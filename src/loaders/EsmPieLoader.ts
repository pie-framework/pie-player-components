import { PieContent } from "../interface";

/**
 * Loads PIE elements as native ES modules using import maps and dynamic imports.
 * Requires browser support for import maps (Chrome 89+, Firefox 108+, Safari 16.4+).
 *
 * By default, uses esm.sh (public CDN). Can be configured to use a private proxy like proxy.pie-api.com.
 */
// Cache probe results globally (across instances) to avoid redundant checks
// Key: cdnBaseUrl, Value: { available: boolean, timestamp: number }
const PROBE_CACHE = new Map<string, { available: boolean, timestamp: number }>();

export interface EsmLoaderOptions {
  cdnBaseUrl?: string;
  probeTimeout?: number;    // Timeout for package availability probe in milliseconds
  probeCacheTtl?: number;   // Cache TTL for probe results in milliseconds
}

export class EsmPieLoader {
  private readonly cdnBaseUrl: string;
  private readonly probeTimeout: number;
  private readonly probeCacheTtl: number;
  private importMapInjected = false;
  private loadedElements = new Set<string>();

  /**
   * Create an ESM loader instance
   *
   * @param options - Configuration options
   *                  - cdnBaseUrl: Base URL for the ESM CDN (default: 'https://esm.sh')
   *                  - probeTimeout: Timeout for package probe in ms (default: 1000)
   *                  - probeCacheTtl: Cache TTL for probe results in ms (default: 3600000 = 1 hour)
   *
   * Examples:
   * ```typescript
   * // Default configuration
   * new EsmPieLoader();
   *
   * // Custom CDN
   * new EsmPieLoader({ cdnBaseUrl: 'https://proxy.pie-api.com/npm' });
   *
   * // Fast timeout for slow networks
   * new EsmPieLoader({ probeTimeout: 500 });
   *
   * // Short cache for development
   * new EsmPieLoader({ probeCacheTtl: 60000 }); // 1 minute
   * ```
   */
  constructor(options?: string | EsmLoaderOptions) {
    // Support legacy string parameter for backwards compatibility
    if (typeof options === 'string') {
      this.cdnBaseUrl = options;
      this.probeTimeout = 1000;
      this.probeCacheTtl = 60 * 60 * 1000; // 1 hour
    } else {
      this.cdnBaseUrl = (options && options.cdnBaseUrl) || 'https://esm.sh';
      this.probeTimeout = (options && options.probeTimeout !== undefined) ? options.probeTimeout : 1000;
      this.probeCacheTtl = (options && options.probeCacheTtl !== undefined) ? options.probeCacheTtl : 60 * 60 * 1000;
    }
  }

  /**
   * Load PIE elements with intelligent format detection.
   * Handles both auto-detection and explicit ESM requests.
   *
   * @param content - PIE content configuration
   * @param doc - Document to inject import map into
   * @param format - Bundle format preference ('auto' or 'esm')
   *                 'auto': Check browser + probe packages before loading
   *                 'esm': Trust that ESM works, skip probe for performance
   * @returns Promise resolving to load success or throwing ESM_NOT_SUPPORTED
   */
  async loadWithFormat(
    content: PieContent,
    doc: Document,
    format: 'auto' | 'esm'
  ): Promise<void> {
    // Check 1: Browser capability (always required)
    if (!this.supportsImportMaps()) {
      throw new Error('ESM_NOT_SUPPORTED: Import maps not supported in this browser');
    }

    // Check 2: Package availability (only for auto-detection)
    if (format === 'auto') {
      // Auto mode: Probe to verify packages exist
      const packagesAvailable = await this.probePackageAvailability(content.elements);
      if (!packagesAvailable) {
        throw new Error('ESM_NOT_SUPPORTED: Packages not available on CDN (may not have ESM builds)');
      }
    } else {
      // Explicit ESM mode: Skip probe for performance, trust packages exist
      console.log('[EsmPieLoader] Skipping package probe (explicitly requested ESM)');
    }

    // Load elements
    await this.loadElements(content, doc);
  }

  /**
   * Check if ESM can be used for the given content.
   * Performs two checks:
   * 1. Browser capability (import maps support)
   * 2. Package availability (CDN has the packages)
   *
   * @param content - PIE content configuration
   * @returns Promise<{canUse: boolean, reason?: string}>
   */
  async canUseEsm(content: PieContent): Promise<{canUse: boolean, reason?: string}> {
    // Check 1: Browser capability
    if (!this.supportsImportMaps()) {
      return {
        canUse: false,
        reason: 'Browser does not support import maps (requires Chrome 89+, Firefox 108+, or Safari 16.4+)'
      };
    }

    // Check 2: Package availability
    const packagesAvailable = await this.probePackageAvailability(content.elements);
    if (!packagesAvailable) {
      return {
        canUse: false,
        reason: 'Packages not available on CDN (may not have ESM builds or wrong version)'
      };
    }

    return { canUse: true };
  }

  /**
   * Internal method: Load PIE elements after checks have passed.
   * Generates import map and dynamically imports each element.
   *
   * @param content - PIE content configuration
   * @param doc - Document to inject import map into
   */
  private async loadElements(content: PieContent, doc: Document): Promise<void> {
    // 1. Generate and inject import map (once per page)
    if (!this.importMapInjected) {
      const importMap = this.generateImportMap(content.elements);
      this.injectImportMap(importMap, doc);
      this.importMapInjected = true;
    }

    // 2. Dynamically import and register each element
    const elementTags = Object.keys(content.elements);
    const loadPromises = elementTags.map(tag =>
      this.loadElement(tag, content.elements[tag])
    );

    await Promise.all(loadPromises);
  }

  /**
   * @deprecated Use loadWithFormat() instead for better control.
   * Load PIE elements using ESM.
   *
   * @param content - PIE content configuration
   * @param doc - Document to inject import map into (defaults to document)
   * @param options - Loading options
   */
  async load(content: PieContent, doc: Document = document, options?: { skipProbe?: boolean }): Promise<void> {
    const format = (options && options.skipProbe) ? 'esm' : 'auto';
    await this.loadWithFormat(content, doc, format);
  }

  /**
   * Check if browser supports import maps
   */
  private supportsImportMaps(): boolean {
    // TypeScript doesn't have HTMLScriptElement.supports in its type definitions yet
    // This is a real browser API: https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement/supports
    return typeof HTMLScriptElement !== 'undefined' &&
           typeof (HTMLScriptElement as any).supports === 'function' &&
           (HTMLScriptElement as any).supports('importmap') === true;
  }

  /**
   * Probe if packages are available on the CDN with ESM builds.
   * Optimized for speed:
   * - Uses cache (configurable TTL, default 1 hour) to avoid redundant checks
   * - Fast timeout (configurable, default 1 second)
   * - HEAD request (no body download)
   * - Probes ALL packages in parallel - ALL must exist for ESM to work
   *
   * @param elements - Map of element tags to package versions
   * @returns Promise<boolean> - true if ALL packages are available
   */
  private async probePackageAvailability(elements: Record<string, string>): Promise<boolean> {
    const startTime = performance.now();

    // Check cache first
    const cached = PROBE_CACHE.get(this.cdnBaseUrl);
    if (cached && (Date.now() - cached.timestamp) < this.probeCacheTtl) {
      const elapsed = (performance.now() - startTime).toFixed(0);
      console.log(`[EsmPieLoader] Using cached probe result (${elapsed}ms):`, cached.available ? 'Available' : 'Not available');
      return cached.available;
    }

    // Get all packages to probe
    const packageVersions = Object.values(elements);
    if (packageVersions.length === 0) {
      console.warn('[EsmPieLoader] No packages to probe');
      return false;
    }

    console.log(`[EsmPieLoader] Probing ${packageVersions.length} package(s) in parallel...`);

    try {
      // Probe ALL packages in parallel
      const probePromises = packageVersions.map(async (packageVersion) => {
        const probeUrl = `${this.cdnBaseUrl}/${packageVersion}`;

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.probeTimeout);

        try {
          // Make a HEAD request to check if package exists
          const response = await fetch(probeUrl, {
            method: 'HEAD',
            signal: controller.signal,
            cache: 'no-cache' // Don't cache the probe
          });

          clearTimeout(timeoutId);

          const available = response.ok; // 200-299 status
          console.log(`[EsmPieLoader] ${packageVersion}:`, available ? '✅' : '❌');

          return { packageVersion, available };
        } catch (fetchError) {
          clearTimeout(timeoutId);

          if (fetchError.name === 'AbortError') {
            console.warn(`[EsmPieLoader] ${packageVersion}: ⏱️ Timeout (${this.probeTimeout}ms)`);
          }
          return { packageVersion, available: false };
        }
      });

      // Wait for all probes to complete
      const results = await Promise.all(probePromises);

      // ALL packages must be available for ESM to work
      const allAvailable = results.every(r => r.available);
      const elapsed = (performance.now() - startTime).toFixed(0);

      if (allAvailable) {
        console.log(`[EsmPieLoader] All ${packageVersions.length} package(s) available (${elapsed}ms) ✅`);
      } else {
        const missing = results.filter(r => !r.available).map(r => r.packageVersion);
        console.warn(`[EsmPieLoader] ${missing.length} package(s) unavailable (${elapsed}ms):`, missing);
      }

      // Cache the result
      PROBE_CACHE.set(this.cdnBaseUrl, { available: allAvailable, timestamp: Date.now() });

      return allAvailable;
    } catch (error) {
      const elapsed = (performance.now() - startTime).toFixed(0);
      console.warn(`[EsmPieLoader] Package probe failed (${elapsed}ms):`, error);

      // Cache negative result to avoid repeated failures
      PROBE_CACHE.set(this.cdnBaseUrl, { available: false, timestamp: Date.now() });

      return false;
    }
  }

  /**
   * Generate import map from PIE elements configuration
   *
   * @param elements - Map of element tags to package versions
   * @returns Import map object
   */
  private generateImportMap(elements: Record<string, string>): { imports: Record<string, string> } {
    const imports: Record<string, string> = {};

    Object.entries(elements).forEach(([tag, packageVersion]) => {
      // packageVersion format: @pie-element/multiple-choice@11.0.1-esm.0
      // Extract package name (everything before the last @)
      const parts = packageVersion.split('@');
      const packageName = parts.length >= 3
        ? `@${parts[1]}` // scoped package: @pie-element/multiple-choice
        : parts[0];      // unscoped package

      imports[packageName] = `${this.cdnBaseUrl}/${packageVersion}`;
    });

    return { imports };
  }

  /**
   * Inject import map script into document head
   *
   * @param importMap - Import map object
   * @param doc - Document to inject into
   */
  private injectImportMap(importMap: { imports: Record<string, string> }, doc: Document): void {
    const script = doc.createElement('script');
    script.type = 'importmap';
    script.textContent = JSON.stringify(importMap, null, 2);
    doc.head.appendChild(script);

    console.log('[EsmPieLoader] Import map injected:', importMap);
  }

  /**
   * Load and register a single PIE element
   *
   * @param tag - Custom element tag name
   * @param packageVersion - Package name with version (e.g., @pie-element/multiple-choice@11.0.1-esm.0)
   */
  private async loadElement(tag: string, packageVersion: string): Promise<void> {
    // Skip if already loaded
    if (this.loadedElements.has(tag)) {
      console.log(`[EsmPieLoader] Element ${tag} already loaded, skipping`);
      return;
    }

    // Skip if already defined as custom element
    if (customElements.get(tag)) {
      console.log(`[EsmPieLoader] Element ${tag} already defined as custom element`);
      this.loadedElements.add(tag);
      return;
    }

    try {
      // Extract package name (without version) for import
      const parts = packageVersion.split('@');
      const packageName = parts.length >= 3
        ? `@${parts[1]}` // scoped package: @pie-element/multiple-choice
        : parts[0];      // unscoped package

      console.log(`[EsmPieLoader] Loading element ${tag} from ${packageName}`);

      // Dynamic import resolves via import map
      const module = await import(packageName);

      // Register custom element
      // Try different export patterns
      if (module.default && typeof module.default === 'function') {
        // Default export (most common)
        customElements.define(tag, module.default);
        this.loadedElements.add(tag);
        console.log(`[EsmPieLoader] ✅ Registered ${tag} from default export`);
      } else if (module.Element && typeof module.Element === 'function') {
        // Named export: Element
        customElements.define(tag, module.Element);
        this.loadedElements.add(tag);
        console.log(`[EsmPieLoader] ✅ Registered ${tag} from Element export`);
      } else if (module[tag] && typeof module[tag] === 'function') {
        // Named export matching tag name
        customElements.define(tag, module[tag]);
        this.loadedElements.add(tag);
        console.log(`[EsmPieLoader] ✅ Registered ${tag} from named export`);
      } else {
        console.error(`[EsmPieLoader] No element constructor found for ${tag} in module`, module);
        throw new Error(`No element constructor found for ${tag}`);
      }
    } catch (error) {
      console.error(`[EsmPieLoader] Failed to load element ${tag}:`, error);
      throw error;
    }
  }

  /**
   * Check if all elements have been loaded and defined
   * Similar to PieLoader.elementsHaveLoaded()
   *
   * @param elements - Array of element tags to check
   * @returns Promise that resolves when all elements are defined
   */
  async elementsHaveLoaded(elements: Array<{ name: string; tag: string }>): Promise<boolean> {
    try {
      const promises = elements.map(el => customElements.whenDefined(el.tag));
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('[EsmPieLoader] Error waiting for elements:', error);
      return false;
    }
  }
}

