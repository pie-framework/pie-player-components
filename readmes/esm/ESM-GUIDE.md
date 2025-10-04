# ESM Loading Guide

## Quick Start

Both `pie-player` and `pie-author` default to `bundle-format="auto"`, which automatically detects browser capability and package availability.

```html
<!-- No configuration needed -->
<pie-player config='...'></pie-player>
<pie-author config='...'></pie-author>
```

**Detection logic**:
1. Check browser import maps support (`HTMLScriptElement.supports('importmap')`)
2. Probe CDN to verify all packages available (HEAD request, parallel, 1s timeout)
3. If both pass: use ESM
4. If either fails: fall back to IIFE

**Performance**: ~100-200ms first load, <1ms cached (1-hour TTL)

**Browser support**: Chrome 89+, Firefox 108+, Safari 16.4+, Edge 89+ (~95% coverage)

---

## Configuration

### Props

All props apply to both `<pie-player>` and `<pie-author>`.

#### `bundle-format`

| Value | Behavior |
|-------|----------|
| `'auto'` (default) | Auto-detect, use ESM if available |
| `'esm'` | Force ESM attempt (skips probe, saves ~100ms) |
| `'iife'` | Force IIFE, never attempt ESM |

#### `esm-cdn-url`

Base URL for ESM CDN.

| Value | Usage |
|-------|-------|
| `'https://esm.sh'` (default) | Public CDN |
| `'https://proxy.pie-api.com/npm'` | Private proxy |
| `'https://cdn.jsdelivr.net/npm'` | Alternative public CDN |

```html
<pie-player esm-cdn-url="https://proxy.pie-api.com/npm" />
```

#### `esm-probe-timeout` (number, ms)

Max wait time for CDN probe before fallback.

| Value | Usage |
|-------|-------|
| `1000` (default) | Production |
| `500` | Development (fast feedback) |
| `2000` | Slow networks |

#### `esm-probe-cache-ttl` (number, ms)

Cache TTL for probe results.

| Value | Usage |
|-------|-------|
| `3600000` (1 hour, default) | Production |
| `60000` (1 minute) | Development |
| `86400000` (24 hours) | Long sessions |

### Common Configurations

**Production (default)**
```html
<pie-player config='...' />
```

**Private Proxy**
```html
<pie-player esm-cdn-url="https://proxy.pie-api.com/npm" />
```

**Development**
```html
<pie-player 
  esm-probe-timeout="500"
  esm-probe-cache-ttl="60000"
/>
```

**Slow Networks**
```html
<pie-player 
  esm-probe-timeout="2000"
  esm-probe-cache-ttl="86400000"
/>
```

**Force ESM (skip probe)**
```html
<pie-player bundle-format="esm" />
```

### Cache Behavior

- **Scope**: Global across all components
- **Key**: CDN URL
- **Shared**: Multiple components use same cache
- **Cleared**: After TTL expires

Example: If `pie-player` probes `esm.sh` successfully, subsequent `pie-author` instances on the same page will use the cached result (<1ms).

---

## Implementation

### Package Probe

```typescript
private async probePackageAvailability(elements: Record<string, string>): Promise<boolean> {
  // 1. Check cache (1-hour TTL)
  const cached = PROBE_CACHE.get(this.cdnBaseUrl);
  if (cached && (Date.now() - cached.timestamp) < this.probeCacheTtl) {
    return cached.available;
  }

  // 2. Probe ALL packages in parallel (ALL must exist)
  const probePromises = packageVersions.map(async (packageVersion) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.probeTimeout);
    
    const response = await fetch(`${this.cdnBaseUrl}/${packageVersion}`, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    clearTimeout(timeoutId);
    return { packageVersion, available: response.ok };
  });

  const results = await Promise.all(probePromises);
  const allAvailable = results.every(r => r.available);

  // 3. Cache result (positive or negative)
  PROBE_CACHE.set(this.cdnBaseUrl, { available: allAvailable, timestamp: Date.now() });
  
  return allAvailable;
}
```

### Optimizations

| Technique | Benefit |
|-----------|---------|
| HEAD request | No body download (~200 bytes vs 150KB-2MB) |
| 1s timeout | Max wait time, fail fast |
| Global cache (1hr TTL) | Subsequent probes <1ms |
| Parallel probes | O(1) time regardless of package count |
| Verify all packages | Reliable fallback detection |
| Cache negative results | Don't retry failed CDN |

### Performance

| Scenario | Time | Details |
|----------|------|---------|
| First load (3 packages) | 100-200ms | All probed in parallel |
| Cached load | <1ms | Global cache hit |
| CDN timeout | 1000ms | AbortController timeout |
| Missing package | 100-200ms | Detect, fallback to IIFE |

---

## Console Output

### ESM Success
```
[pie-player] Auto-detect mode: attempting ESM load from https://esm.sh
[EsmPieLoader] Probing 3 package(s) in parallel...
[EsmPieLoader] @pie-element/multiple-choice@11.0.1-esm.0: ✅
[EsmPieLoader] @pie-element/text-entry@11.0.1-esm.0: ✅
[EsmPieLoader] @pie-element/categorize@11.0.1-esm.0: ✅
[EsmPieLoader] All 3 package(s) available (124ms) ✅
[pie-player] ESM loading complete
```

### IIFE Fallback
```
[pie-player] ESM not available, falling back to IIFE
[pie-player] Reason: Import maps not supported in this browser
```

### Cached
```
[EsmPieLoader] Using cached probe result (0ms): Available
```

### Missing Package
```
[EsmPieLoader] Probing 3 package(s) in parallel...
[EsmPieLoader] @pie-element/multiple-choice@11.0.1-esm.0: ✅
[EsmPieLoader] @pie-element/text-entry@10.0.0: ❌
[EsmPieLoader] @pie-element/categorize@11.0.1-esm.0: ✅
[EsmPieLoader] 1 package(s) unavailable (142ms): @pie-element/text-entry@10.0.0
```

---

## Testing

### Test Suites

**Unit Tests** (`EsmPieLoader.spec.ts`) - Mocked network requests
```bash
yarn test EsmPieLoader.spec
```

**E2E Tests** (`EsmPieLoader.e2e.ts`) - Real CDNs, real packages
```bash
yarn test EsmPieLoader.e2e
```

**Component Integration** - Player/Author ESM integration
```bash
yarn test pie-player-esm.e2e
yarn test pie-author-esm.e2e
```

### CDN Testing Matrix

E2E tests verify against multiple CDNs:

| CDN | URL | Status |
|-----|-----|--------|
| esm.sh | `https://esm.sh` | Default, tested |
| jsdelivr | `https://cdn.jsdelivr.net/npm` | Tested |
| proxy.pie-api.com | `https://proxy.pie-api.com/npm` | Internal, tested |

### Manual Testing

**Browser Console**
```javascript
// Test esm.sh
import('https://esm.sh/@pie-element/categorize@11.0.1-esm.0')
  .then(mod => console.log('Success:', mod))
  .catch(err => console.error('Failed:', err));
```

**With Components**
```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://unpkg.com/@pie-framework/pie-player-components@latest/dist/index.js"></script>
</head>
<body>
  <pie-player 
    bundle-format="auto"
    esm-cdn-url="https://esm.sh"
    config='{"elements": {"mc": "@pie-element/categorize@11.0.1-esm.0"}, ...}'
  ></pie-player>
</body>
</html>
```

### Test Scenarios

1. **Auto-detection (default)**: `<pie-player config='...' />`
2. **Explicit ESM**: `<pie-player bundle-format="esm" config='...' />`
3. **Custom CDN**: `<pie-player esm-cdn-url="https://cdn.jsdelivr.net/npm" config='...' />`
4. **IIFE Fallback**: `<pie-player bundle-format="iife" config='...' />`

### Common Issues

- **"Import maps not supported"**: Browser doesn't support import maps (Chrome <89, Firefox <108, Safari <16.4)
- **"Packages not available on CDN"**: Package version doesn't have ESM build or CDN is down
- **Timeout**: CDN probe took >1s (default). Increase `esm-probe-timeout`
- **404 on package**: Package version doesn't exist or CDN path incorrect

