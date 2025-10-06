# ESM Loading Guide

A practical guide to understanding and debugging ESM (ECMAScript Modules) loading in PIE player components.

## Quick Overview

PIE supports two module formats:

- **IIFE** (legacy): Bundled JavaScript files loaded via `<script>` tags
- **ESM** (modern): Native browser modules with import maps

The system automatically detects which format to use, falling back to IIFE when ESM is unavailable.

## Architecture

### Two Loaders

**IifePieLoader** (`src/loaders/IifePieLoader.ts`)

- Loads bundled IIFE scripts from build service
- Single bundle per element (player.js, client-player.js, or editor.js)
- Proven, battle-tested approach
- Required for older browsers

**EsmPieLoader** (`src/loaders/EsmPieLoader.ts`)

- Loads native ESM modules via import maps
- Smaller bundles, shared dependencies
- Requires Chrome 89+, Firefox 108+, Safari 16.4+
- Default for modern browsers when packages are available

### Bundle Types

Both loaders support three bundle types based on what's needed:

| Bundle Type | Element | Controller | Configure | Use Case |
|------------|---------|------------|-----------|----------|
| **player** | ✅ | ❌ | ❌ | Hosted mode (server-side scoring) |
| **clientPlayer** | ✅ | ✅ | ❌ | Non-hosted mode (client-side scoring) |
| **editor** | ✅ | ✅ | ✅ | Authoring mode |

**IIFE bundles:** `player.js`, `client-player.js`, `editor.js`

**ESM entry points:** `index.js`, `controller/index.js`, `configure/index.js`

### Auto-Detection Flow

```
1. Browser Check
   ├─ Supports import maps? ──> YES ─┐
   └─ No import maps? ──> FALLBACK ──┘
                                      │
2. Package Probe (ESM only)           │
   ├─ All packages available? ──> YES ┤
   └─ Any missing? ──> FALLBACK ──────┘
                                      │
3. Load                                │
   ├─ ESM: Import map + dynamic imports
   └─ IIFE: Script tags
```

## Key Concepts

### Import Maps

Browser feature that controls how module specifiers resolve to URLs:

```json
{
  "imports": {
    "@pie-element/multiple-choice": "https://esm.sh/@pie-element/multiple-choice@11.0.5-esmbeta.1"
  }
}
```

Allows code to use bare specifiers:

```javascript
import MultipleChoice from '@pie-element/multiple-choice';
```

### Import Map Scopes

For custom CDN URLs with path prefixes (e.g., `https://proxy.pie-api.com/npm`), scopes ensure dependencies resolve correctly:

```json
{
  "imports": { /* ... */ },
  "scopes": {
    "https://proxy.pie-api.com/npm/": {
      "/": "https://proxy.pie-api.com/npm/"
    }
  }
}
```

**Why needed:** esm.sh rewrites imports to relative paths like `/react@18.2.0`. Without scopes, this resolves to `https://proxy.pie-api.com/react` (wrong) instead of `https://proxy.pie-api.com/npm/react` (correct).

### Probe Cache

ESM loader caches package availability checks to avoid redundant network requests.

**Cache key format:** `{cdnBaseUrl}:{sortedPackageVersions}`

Example:

```
"https://esm.sh:@pie-element/multiple-choice@11.0.5-esmbeta.1"
```

**Why version-aware:** Prevents false positives/negatives when switching between ESM and non-ESM versions.

**TTL:** 1 hour (default)

**Clear cache:** `EsmPieLoader.clearProbeCache()`

## Common Issues & Solutions

### Issue: ESM Falls Back to IIFE Despite Available Packages

**Symptoms:**

- Console shows "Cannot use ESM: Packages not available on CDN"
- Packages exist and load fine in browser

**Causes:**

1. **Stale cache:** Cache has old unavailability result
2. **Probe timeout:** Network slow, probe times out (default: 1s)
3. **CORS issues:** CDN blocking HEAD requests

**Solutions:**

```javascript
// Clear cache
EsmPieLoader.clearProbeCache();

// Increase probe timeout
<pie-player esm-probe-timeout="5000" />  // 5 seconds

// Skip probe (trust packages exist)
<pie-player bundle-format="esm" />
```

### Issue: Dependencies Load from Wrong CDN Path

**Symptoms:**

- Main module loads: `https://proxy.pie-api.com/npm/@pie-element/...`
- Dependencies 404: `https://proxy.pie-api.com/react@18.2.0` (missing `/npm`)

**Cause:** Custom CDN without import map scopes

**Solution:** Scopes are added automatically for non-esm.sh URLs. Verify:

```javascript
// Check import map in DevTools
document.querySelector('script[type="importmap"]').textContent
```

Should have `"scopes"` field.

### Issue: "Custom element already defined" Error

**Symptoms:**

```
DOMException: Failed to execute 'define' on 'CustomElementRegistry': 
the name "pie-multiple-choice" has already been used
```

**Cause:** Attempting to define the same custom element twice (e.g., version switching without page reload)

**Solution:**

- Ensure page fully reloads when switching versions
- Check that version selectors use `window.location.href` (not SPA navigation)
- Use `needsLoading()` check before defining

### Issue: Wrong Bundle Type Loaded

**Symptoms:**

- Authoring mode but configure components missing
- Client-side scoring but controllers not loaded

**Cause:** Incorrect bundle type for the mode

**Check:**

```javascript
// pie-player: hosted determines bundle type
hosted=true  -> EsmBundleType.player (elements only)
hosted=false -> EsmBundleType.clientPlayer (elements + controllers)

// pie-author: always editor
EsmBundleType.editor (elements + controllers + configure)
```

## Debugging

### Enable Console Logging

ESM loader logs extensively:

```javascript
[EsmPieLoader] Probing 3 package(s) in parallel...
[EsmPieLoader] @pie-element/multiple-choice@11.0.5-esmbeta.1: ✅
[EsmPieLoader] Using cached probe result (0ms): Available
[EsmPieLoader] Import map injected: {...}
[EsmPieLoader] Loading element pie-multiple-choice from @pie-element/multiple-choice
[EsmPieLoader]   ✅ Element registered: pie-multiple-choice
[EsmPieLoader]   ✅ Controller loaded: pie-multiple-choice
```

### Check New Relic (if enabled)

Events to look for:

```sql
-- Auto-detection decisions
SELECT * FROM PageAction 
WHERE eventType IN (
  'esm_autodetect_browser_check',
  'esm_autodetect_choose_esm',
  'esm_autodetect_fallback_iife'
)

-- Cache effectiveness
SELECT * FROM PageAction 
WHERE eventType IN (
  'esm_probe_cache_hit',
  'esm_probe_cache_miss'
)

-- Package availability issues
SELECT * FROM PageAction 
WHERE eventType = 'esm_packages_unavailable'
```

### Inspect Cache

```javascript
// Get cache stats
const stats = EsmPieLoader.getProbeCacheStats();
console.log('Cache size:', stats.size);
console.log('Entries:', stats.entries);

// Output:
{
  size: 3,
  entries: [
    {
      key: "https://esm.sh:@pie-element/multiple-choice@11.0.5-esmbeta.1",
      available: true,
      age: 123456  // milliseconds since cached
    }
  ]
}
```

### Check Network Requests

**DevTools → Network → Filter: "esm.sh" or "proxy.pie-api.com"**

Look for:

- HEAD requests (probes) - should be 200-299 or 404
- GET requests (modules) - should be 200
- Waterfall timing - imports should be parallel

### Verify Import Map

```javascript
// Get import map from DOM
const importMap = JSON.parse(
  document.querySelector('script[type="importmap"]').textContent
);
console.log(importMap);
```

Expected structure:

```json
{
  "imports": {
    "@pie-element/multiple-choice": "https://esm.sh/@pie-element/multiple-choice@11.0.5-esmbeta.1",
    "@pie-element/multiple-choice/controller": "https://esm.sh/@pie-element/multiple-choice@11.0.5-esmbeta.1/controller"
  },
  "scopes": {  // Only for custom CDNs
    "https://proxy.pie-api.com/npm/": {
      "/": "https://proxy.pie-api.com/npm/"
    }
  }
}
```

## Configuration

### pie-player / pie-author

```html
<!-- Auto-detect (default) -->
<pie-player config='...' />

<!-- Force ESM -->
<pie-player bundle-format="esm" config='...' />

<!-- Force IIFE -->
<pie-player bundle-format="iife" config='...' />

<!-- Custom CDN -->
<pie-player 
  bundle-format="auto"
  esm-cdn-url="https://proxy.pie-api.com/npm"
  config='...' 
/>

<!-- Tune probe settings -->
<pie-player 
  bundle-format="auto"
  esm-probe-timeout="5000"
  esm-probe-cache-ttl="600000"
  config='...' 
/>

<!-- Enable New Relic tracking -->
<pie-player 
  bundle-format="auto"
  loader-config='{"trackPageActions": true}'
  config='...' 
/>
```

### EsmPieLoader Direct Usage

```typescript
import { EsmPieLoader, EsmBundleType } from './loaders/EsmPieLoader';

const loader = new EsmPieLoader({
  cdnBaseUrl: 'https://esm.sh',
  probeTimeout: 1000,         // ms
  probeCacheTtl: 3600000,     // ms (1 hour)
  bundleType: EsmBundleType.clientPlayer,
  loaderConfig: {
    trackPageActions: true    // Enable New Relic
  }
});

// Load with auto-detection
await loader.loadWithFormat(content, document, 'auto');

// Load without probe (explicit ESM)
await loader.loadWithFormat(content, document, 'esm');

// Get controller (for non-hosted mode)
const controller = loader.getController('pie-multiple-choice');
```

## Code Structure

```
src/
├── loaders/
│   ├── EsmPieLoader.ts       # ESM implementation
│   ├── IifePieLoader.ts      # IIFE implementation
│   └── shared.ts             # Common types/constants
├── components/
│   ├── pie-player/
│   │   └── pie-player.tsx    # Player with ESM support
│   └── pie-author/
│       └── pie-author.tsx    # Author with ESM support
└── pie-loader.ts             # Legacy exports (compatibility)
```

### Key Methods

**EsmPieLoader:**

- `loadWithFormat(content, doc, format)` - Main entry point
- `canUseEsm(content)` - Check if ESM is possible
- `getController(tag)` - Get loaded controller
- `static clearProbeCache()` - Clear global cache
- `static getProbeCacheStats()` - Inspect cache

**IifePieLoader:**

- `loadCloudPies(bundle, content)` - Load IIFE bundles
- `getController(tag)` - Get loaded controller

## Performance

### ESM vs IIFE

**ESM advantages:**

- Smaller bundles (shared dependencies)
- Parallel loading
- Better caching (per-dependency)
- Faster updates (only changed modules)

**ESM overhead:**

- Initial probe: 100-500ms (cached after first load)
- Import map injection: < 1ms
- Dynamic imports: 50-200ms per element

**Recommendation:** ESM is faster for most scenarios, especially multi-element pages.

### Probe Cache

**Cache hit:** < 1ms (instant)
**Cache miss:** 100-500ms (network)

**Hit rate target:** > 70%

## Browser Support

### Import Maps

- ✅ Chrome 89+ (March 2021)
- ✅ Firefox 108+ (December 2022)
- ✅ Safari 16.4+ (March 2023)
- ✅ Edge 89+ (March 2021)
- ❌ IE 11 (use IIFE fallback)

### Dynamic Imports

- ✅ All evergreen browsers
- ✅ Chrome 63+, Firefox 67+, Safari 11.1+

## Troubleshooting Checklist

When ESM loading fails:

- [ ] Check browser supports import maps (`HTMLScriptElement.supports('importmap')`)
- [ ] Verify packages exist on CDN (manually check URL in browser)
- [ ] Clear probe cache (`EsmPieLoader.clearProbeCache()`)
- [ ] Check Network tab for 404s or CORS errors
- [ ] Verify import map is injected correctly
- [ ] Check console for detailed error messages
- [ ] Try explicit ESM mode (`bundle-format="esm"`) to skip probe
- [ ] If using custom CDN, verify scopes are present in import map
- [ ] Check that versions are ESM-enabled (look for `esmbeta` tag)

## Testing

```javascript
// Test auto-detection
<pie-player bundle-format="auto" config='...' />
// Check console: should see "ESM auto-detection passed" or fallback message

// Test cache hit
// 1. Load page (cache miss)
// 2. Reload page (cache hit)
// Console should show: "Using cached probe result (0ms): Available"

// Test version switching
// 1. Load ESM version (e.g., 11.0.5-esmbeta.1)
// 2. Switch to non-ESM version (e.g., 9.9.1)
// Should fall back to IIFE correctly

// Test custom CDN
<pie-player 
  esm-cdn-url="https://proxy.pie-api.com/npm"
  bundle-format="auto"
  config='...' 
/>
// Check import map has "scopes" field
```

## Resources

### Specifications

- [Import Maps Spec](https://github.com/WICG/import-maps)
- [ES Modules Spec](https://tc39.es/ecma262/#sec-modules)

### CDN Documentation

- [esm.sh](https://esm.sh/)
- [jspm.org](https://jspm.org/)

### Browser APIs

- [HTMLScriptElement.supports()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement/supports)
- [import()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [CustomElementRegistry](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry)

