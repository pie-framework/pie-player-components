import { PieContent } from "../interface";
import { NewRelicEnabledClient } from "../new-relic";
import {
  LoaderConfig,
  DEFAULT_LOADER_CONFIG,
  registerCustomElement,
  checkElementsLoaded
} from "./shared";

/**
 * ESM-specific bundle types
 * Maps to the different entry points in ESM packages
 */
export enum EsmBundleType {
  /** Only load elements (controllers run on server) - Hosted mode */
  player = 'player',
  /** Load elements + controllers (controllers in browser) - Non-hosted mode */
  clientPlayer = 'clientPlayer',
  /** Load elements + controllers + configure (full authoring) - Authoring mode */
  editor = 'editor'
}

/**
 * Custom error class for ESM loading failures
 * Provides structured context for better error handling and tracking
 */
export class EsmLoadingError extends Error {
  public readonly packageVersions: string[];
  public readonly reason: string;
  public readonly itemIds: string[];
  public readonly fallbackAvailable: boolean;

  constructor(
    message: string,
    reason: string,
    packageVersions: string[] = [],
    itemIds: string[] = [],
    fallbackAvailable: boolean = true
  ) {
    super(message);
    this.name = 'EsmLoadingError';
    this.reason = reason;
    this.packageVersions = packageVersions;
    this.itemIds = itemIds;
    this.fallbackAvailable = fallbackAvailable;
  }
}

/**
 * Registry entry for tracking loaded PIE components
 */
export interface EsmRegistryEntry {
  package: string;      // Full package version (e.g., @pie-element/multiple-choice@11.0.1-esmbeta.0)
  tagName: string;      // Custom element tag (e.g., pie-multiple-choice)
  element?: any;        // Element class
  controller?: any;     // Controller module
  config?: any;         // Configure class (matches IIFE naming)
}

/**
 * Configuration options for ESM loader
 */
export interface EsmLoaderOptions {
  cdnBaseUrl?: string;
  probeTimeout?: number;
  probeCacheTtl?: number;
  bundleType?: EsmBundleType;
  loaderConfig?: LoaderConfig;  // For New Relic tracking
}

// Cache probe results globally (across instances) to avoid redundant checks
// Key: cdnBaseUrl:packageVersions, Value: { available: boolean, timestamp: number }
const PROBE_CACHE = new Map<string, { available: boolean, timestamp: number }>();

/**
 * Loads PIE elements as native ES modules using import maps and dynamic imports.
 * Requires browser support for import maps (Chrome 89+, Firefox 108+, Safari 16.4+).
 *
 * By default, uses esm.sh (public CDN). Can be configured to use a private proxy like proxy.pie-api.com.
 * 
 * Supports three bundle types:
 * - player: Elements only (for hosted mode with server-side controllers)
 * - clientPlayer: Elements + controllers (for non-hosted mode with client-side controllers)
 * - editor: Elements + controllers + configure (for authoring mode)
 */
export class EsmPieLoader extends NewRelicEnabledClient {
  private readonly cdnBaseUrl: string;
  private readonly probeTimeout: number;
  private readonly probeCacheTtl: number;
  private readonly bundleType: EsmBundleType;
  private readonly loaderConfig: Required<LoaderConfig>;
  private importMapInjected = false;
  private loadedElements = new Set<string>();
  private registry = new Map<string, EsmRegistryEntry>();

  /**
   * Clear the global probe cache.
   * Useful for development/testing when switching between versions frequently.
   */
  public static clearProbeCache(): void {
    const size = PROBE_CACHE.size;
    PROBE_CACHE.clear();
    console.log(`[EsmPieLoader] Probe cache cleared (${size} entries removed)`);
  }

  /**
   * Get probe cache statistics for debugging.
   * Returns cache size and entries.
   */
  public static getProbeCacheStats(): { size: number; entries: Array<{ key: string; available: boolean; age: number }> } {
    const now = Date.now();
    const entries = Array.from(PROBE_CACHE.entries()).map(([key, value]) => ({
      key,
      available: value.available,
      age: now - value.timestamp
    }));
    return { size: PROBE_CACHE.size, entries };
  }

  /**
   * Create an ESM loader instance
   *
   * @param options - Configuration options
   *                  - cdnBaseUrl: Base URL for the ESM CDN (default: 'https://esm.sh')
   *                  - probeTimeout: Timeout for package probe in ms (default: 1000)
   *                  - probeCacheTtl: Cache TTL for probe results in ms (default: 3600000 = 1 hour)
   *                  - bundleType: What to load - player, clientPlayer, or editor (default: player)
   *
   * Examples:
   * ```typescript
   * // Default configuration (player mode)
   * new EsmPieLoader();
   *
   * // Client player mode (with controllers)
   * new EsmPieLoader({ bundleType: EsmBundleType.clientPlayer });
   *
   * // Editor mode (with controllers and configure)
   * new EsmPieLoader({ bundleType: EsmBundleType.editor });
   *
   * // Custom CDN
   * new EsmPieLoader({ cdnBaseUrl: 'https://proxy.pie-api.com/npm' });
   *
   * // Clear cache for testing
   * EsmPieLoader.clearProbeCache();
   *
   * // Check cache stats
   * const stats = EsmPieLoader.getProbeCacheStats();
   * ```
   */
  constructor(options?: string | EsmLoaderOptions) {
    super();

    // Support legacy string parameter for backwards compatibility
    if (typeof options === 'string') {
      this.cdnBaseUrl = options;
      this.probeTimeout = 1000;
      this.probeCacheTtl = 60 * 60 * 1000; // 1 hour
      this.bundleType = EsmBundleType.player;
      this.loaderConfig = DEFAULT_LOADER_CONFIG;
    } else {
      this.cdnBaseUrl = (options && options.cdnBaseUrl) || 'https://esm.sh';
      this.probeTimeout = (options && options.probeTimeout !== undefined) ? options.probeTimeout : 1000;
      this.probeCacheTtl = (options && options.probeCacheTtl !== undefined) ? options.probeCacheTtl : 60 * 60 * 1000;
      this.bundleType = (options && options.bundleType) || EsmBundleType.player;
      this.loaderConfig = { ...DEFAULT_LOADER_CONFIG, ...(options && options.loaderConfig) };
    }
  }

  /**
   * Get controller for a given PIE element tag name.
   * Returns null if controller not loaded (e.g., in player mode) or not found.
   *
   * @param pieTagName - Custom element tag name (e.g., 'pie-multiple-choice')
   * @returns Controller module or null
   */
  public getController(pieTagName: string): any | null {
    const entry = this.registry.get(pieTagName);
    return entry && entry.controller ? entry.controller : null;
  }

  /**
   * Check if all specified custom elements have been defined.
   * Uses shared utility for consistent behavior with IIFE loader
   *
   * @param elements - Array of element queries with name and tag
   * @returns Promise resolving to { elements, val: boolean }
   */
  public async elementsHaveLoaded(
    elements: Array<{ name: string; tag: string }>
  ): Promise<{ elements: typeof elements; val: boolean }> {
    const startTime = this.trackOperationStart("elementsHaveLoaded", {
      elementsQuery: elements
    });

    try {
      const result = await checkElementsLoaded(elements);
      this.trackOperationComplete("elementsHaveLoaded", startTime);
      return result;
    } catch (error) {
      console.error('[EsmPieLoader] Error waiting for elements:', error);
      this.trackOperationComplete("elementsHaveLoaded", startTime, false, "Error waiting for elements");
      return { elements, val: false };
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
    const startTime = this.trackOperationStart("loadWithFormat", {
      format,
      bundleType: this.bundleType,
      elementsCount: Object.keys(content.elements || {}).length
    });

    try {
      // Check 1: Browser capability (always required)
      const browserSupportsImportMaps = this.supportsImportMaps();
      
      // Track browser check for auto-detection (Priority 1 metric)
      if (format === 'auto' && this.loaderConfig.trackPageActions && this.newRelic) {
        this.track("activity", "esm_autodetect_browser_check", {
          supportsImportMaps: browserSupportsImportMaps,
          cdnBaseUrl: this.cdnBaseUrl
        });
      }

      if (!browserSupportsImportMaps) {
        // Track fallback decision (Priority 1 metric)
        if (format === 'auto' && this.loaderConfig.trackPageActions && this.newRelic) {
          this.track("activity", "esm_autodetect_fallback_iife", {
            reason: "browser_no_importmap_support",
            packagesCount: Object.keys(content.elements || {}).length,
            cdnBaseUrl: this.cdnBaseUrl
          });
        }
        throw new Error('ESM_NOT_SUPPORTED: Import maps not supported in this browser');
      }

      // Check 2: Package availability (only for auto-detection)
      if (format === 'auto') {
        // Auto mode: Probe to verify packages exist
        const packagesAvailable = await this.probePackageAvailability(content.elements);
        if (!packagesAvailable) {
          // Track fallback decision (Priority 1 metric)
          if (this.loaderConfig.trackPageActions && this.newRelic) {
            this.track("activity", "esm_autodetect_fallback_iife", {
              reason: "packages_unavailable",
              packagesCount: Object.keys(content.elements || {}).length,
              cdnBaseUrl: this.cdnBaseUrl
            });
          }
          throw new Error('ESM_NOT_SUPPORTED: Packages not available on CDN (may not have ESM builds)');
        }

        // Track ESM selection (Priority 1 metric)
        if (this.loaderConfig.trackPageActions && this.newRelic) {
          this.track("activity", "esm_autodetect_choose_esm", {
            packagesCount: Object.keys(content.elements || {}).length,
            cdnBaseUrl: this.cdnBaseUrl,
            bundleType: this.bundleType
          });
        }
      } else {
        // Explicit ESM mode: Skip probe for performance, trust packages exist
        console.log('[EsmPieLoader] Skipping package probe (explicitly requested ESM)');
      }

      // Load elements (and controllers/configure based on bundleType)
      await this.loadElements(content, doc);
      
      this.trackOperationComplete("loadWithFormat", startTime);
    } catch (error) {
      this.trackOperationComplete("loadWithFormat", startTime, false, error.message);
      throw error;
    }
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
   * Generates import map and dynamically imports each element (and controller/configure based on bundleType).
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

    // 2. Dynamically import and register each element (and controller/configure)
    const elementTags = Object.keys(content.elements);
    const loadPromises = elementTags.map(tag =>
      this.loadElement(tag, content.elements[tag])
    );

    await Promise.all(loadPromises);

    // Log what was loaded
    const bundleTypeLabel = {
      [EsmBundleType.player]: 'elements only',
      [EsmBundleType.clientPlayer]: 'elements + controllers',
      [EsmBundleType.editor]: 'elements + controllers + configure'
    }[this.bundleType];
    console.log(`[EsmPieLoader] Loaded ${elementTags.length} package(s) (${bundleTypeLabel})`);
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
   * Cache key includes both CDN URL AND package versions to avoid false positives
   * when switching between different versions of the same packages.
   *
   * @param elements - Map of element tags to package versions
   * @returns Promise<boolean> - true if ALL packages are available
   */
  private async probePackageAvailability(elements: Record<string, string>): Promise<boolean> {
    const trackingStartTime = this.trackOperationStart("probePackageAvailability", {
      cdnBaseUrl: this.cdnBaseUrl,
      packagesCount: Object.keys(elements).length
    }, true);  // Mark as API request
    
    const startTime = performance.now();

    // Create cache key that includes both CDN URL and specific package versions
    // This ensures switching between versions correctly re-probes
    const sortedPackageVersions = Object.values(elements).sort(); // Sort for consistent key
    const cacheKey = `${this.cdnBaseUrl}:${sortedPackageVersions.join(',')}`;

    // Check cache first
    const cached = PROBE_CACHE.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.probeCacheTtl) {
      const elapsed = (performance.now() - startTime).toFixed(0);
      console.log(`[EsmPieLoader] Using cached probe result (${elapsed}ms):`, cached.available ? 'Available' : 'Not available');
      
      // Track cache hit (Priority 1 metric)
      if (this.loaderConfig.trackPageActions && this.newRelic) {
        this.track("activity", "esm_probe_cache_hit", {
          cacheAge: Date.now() - cached.timestamp,
          cacheResult: cached.available,
          packagesCount: Object.keys(elements).length,
          cdnBaseUrl: this.cdnBaseUrl
        });
      }
      
      this.trackOperationComplete("probePackageAvailability", trackingStartTime, true);
      return cached.available;
    }

    // Cache miss - track it (Priority 1 metric)
    if (this.loaderConfig.trackPageActions && this.newRelic) {
      this.track("activity", "esm_probe_cache_miss", {
        packagesCount: Object.keys(elements).length,
        cacheSize: PROBE_CACHE.size,
        cdnBaseUrl: this.cdnBaseUrl
      });
    }

    // Get all packages to probe
    const packageVersions = Object.values(elements);
    if (packageVersions.length === 0) {
      console.warn('[EsmPieLoader] No packages to probe');
      return false;
    }

    // Note: We cannot check npm registry from browsers due to CORS restrictions.
    // Instead, we rely on the CDN probe below - if packages lack ESM builds,
    // the CDN (esm.sh) will return 404 and we'll fall back to IIFE.
    console.log(`[EsmPieLoader] Probing ${packageVersions.length} package(s) on CDN for availability...`);

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

      // Track package probe results (Priority 1 metric - optimized: batched and failure-focused)
      if (this.loaderConfig.trackPageActions && this.newRelic) {
        const unavailablePackages = results.filter(r => !r.available);
        
        if (unavailablePackages.length > 0) {
          // Failure case: track details
          this.track("activity", "esm_packages_unavailable", {
            packages: unavailablePackages.map(r => r.packageVersion),
            unavailableCount: unavailablePackages.length,
            totalCount: results.length,
            cdnBaseUrl: this.cdnBaseUrl
          });
        } else {
          // Success case: track summary only
          this.track("activity", "esm_probe_all_available", {
            packagesCount: results.length,
            probeDuration: parseInt(elapsed, 10),
            cdnBaseUrl: this.cdnBaseUrl
          });
        }
      }

      // Cache the result with version-aware key
      PROBE_CACHE.set(cacheKey, { available: allAvailable, timestamp: Date.now() });

      this.trackOperationComplete("probePackageAvailability", trackingStartTime, true);
      return allAvailable;
    } catch (error) {
      const elapsed = (performance.now() - startTime).toFixed(0);
      console.warn(`[EsmPieLoader] Package probe failed (${elapsed}ms):`, error);

      // Cache negative result to avoid repeated failures (with version-aware key)
      PROBE_CACHE.set(cacheKey, { available: false, timestamp: Date.now() });

      this.trackOperationComplete("probePackageAvailability", trackingStartTime, true, error.message);
      return false;
    }
  }

  /**
   * Generate import map from PIE elements configuration.
   * Includes main element and optionally controller/configure based on bundleType.
   * 
   * When using a custom CDN URL (not esm.sh), adds "scopes" to ensure transitive
   * dependencies resolve correctly. This fixes issues where dependencies like
   * /react@18.2.0 would resolve to https://proxy.com/react instead of
   * https://proxy.com/npm/react when using https://proxy.com/npm as the base.
   *
   * @param elements - Map of element tags to package versions
   * @returns Import map object with optional scopes
   */
  private generateImportMap(elements: Record<string, string>): { 
    imports: Record<string, string>;
    scopes?: Record<string, Record<string, string>>;
  } {
    const imports: Record<string, string> = {};

    Object.entries(elements).forEach(([tag, packageVersion]) => {
      // packageVersion format: @pie-element/multiple-choice@11.0.1-esmbeta.0
      // Extract package name (everything before the last @)
      const packageName = this.extractPackageName(packageVersion);

      // Always include main element
      imports[packageName] = `${this.cdnBaseUrl}/${packageVersion}`;

      // Include controller for clientPlayer and editor modes
      if (this.bundleType === EsmBundleType.clientPlayer || this.bundleType === EsmBundleType.editor) {
        imports[`${packageName}/controller`] = `${this.cdnBaseUrl}/${packageVersion}/controller`;
      }

      // Include configure for editor mode
      if (this.bundleType === EsmBundleType.editor) {
        imports[`${packageName}/configure`] = `${this.cdnBaseUrl}/${packageVersion}/configure`;
      }
    });

    // Add scopes for dependency resolution when using custom CDN path
    // This ensures dependencies like /react@18.2.0 resolve to the correct CDN path
    // Example: https://proxy.pie-api.com/npm/react instead of https://proxy.pie-api.com/react
    let scopes: Record<string, Record<string, string>> | undefined;
    
    if (this.cdnBaseUrl !== 'https://esm.sh') {
      // Custom CDN: add scope to preserve path prefix for dependencies
      // Ensure cdnBaseUrl ends with / for proper scope matching
      const cdnPathBase = this.cdnBaseUrl.endsWith('/') 
        ? this.cdnBaseUrl 
        : `${this.cdnBaseUrl}/`;
      
      scopes = {
        [cdnPathBase]: {
          "/": cdnPathBase  // Map root-relative imports to CDN base
        }
      };
      
      console.log(`[EsmPieLoader] Using custom CDN, adding scope for dependency resolution: ${cdnPathBase}`);
    }

    return scopes ? { imports, scopes } : { imports };
  }

  /**
   * Extract package name from package version string
   * @example extractPackageName('@pie-element/multiple-choice@11.0.1') => '@pie-element/multiple-choice'
   */
  private extractPackageName(packageVersion: string): string {
    const parts = packageVersion.split('@');
    return parts.length >= 3
      ? `@${parts[1]}` // scoped package: @pie-element/multiple-choice
      : parts[0];      // unscoped package
  }

  /**
   * Inject import map script into document head
   *
   * @param importMap - Import map object (with optional scopes)
   * @param doc - Document to inject into
   */
  private injectImportMap(
    importMap: { 
      imports: Record<string, string>;
      scopes?: Record<string, Record<string, string>>;
    }, 
    doc: Document
  ): void {
    const script = doc.createElement('script');
    script.type = 'importmap';
    script.textContent = JSON.stringify(importMap, null, 2);
    doc.head.appendChild(script);

    console.log('[EsmPieLoader] Import map injected:', importMap);
  }

  /**
   * Check if element needs to be loaded based on what's already in registry
   * Similar to needToLoad() in IifePieLoader
   */
  private needsLoading(tag: string): { element: boolean; controller: boolean; configure: boolean } {
    const entry = this.registry.get(tag);
    
    if (!entry) {
      // Nothing loaded yet
      return { element: true, controller: true, configure: true };
    }

    // Check what's missing based on bundle type
    const needs = {
      element: !entry.element && !customElements.get(tag),
      controller: false,
      configure: false
    };

    // Controller needed for clientPlayer and editor
    if (this.bundleType === EsmBundleType.clientPlayer || this.bundleType === EsmBundleType.editor) {
      needs.controller = !entry.controller;
    }

    // Configure needed for editor
    if (this.bundleType === EsmBundleType.editor) {
      const configElName = `${tag}-config`;
      needs.configure = !entry.config && !customElements.get(configElName);
    }

    return needs;
  }

  /**
   * Retry logic for dynamic imports
   * Handles transient network failures with exponential backoff
   */
  private async importWithRetry(
    modulePath: string,
    retries: number = 3,
    initialDelay: number = 1000
  ): Promise<any> {
    let lastError: Error;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await import(modulePath);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries - 1) {
          const delay = initialDelay * Math.pow(2, attempt); // Exponential backoff
          console.warn(
            `[EsmPieLoader] Import failed for ${modulePath}, retrying in ${delay}ms (attempt ${attempt + 1}/${retries})...`
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries exhausted
    throw new Error(`Failed to import ${modulePath} after ${retries} attempts: ${lastError!.message}`);
  }

  /**
   * Load and register a single PIE element (and optionally controller/configure)
   *
   * @param tag - Custom element tag name
   * @param packageVersion - Package name with version (e.g., @pie-element/multiple-choice@11.0.1-esmbeta.0)
   */
  private async loadElement(tag: string, packageVersion: string): Promise<void> {
    // Check what needs to be loaded (intelligent loading)
    const needs = this.needsLoading(tag);
    
    if (!needs.element && !needs.controller && !needs.configure) {
      console.log(`[EsmPieLoader] Element ${tag} already fully loaded for ${this.bundleType} mode, skipping`);
      return;
    }

    const startTime = this.trackOperationStart("loadElement", {
      tag,
      packageVersion,
      bundleType: this.bundleType,
      needsElement: needs.element,
      needsController: needs.controller,
      needsConfigure: needs.configure
    });

    try {
      const packageName = this.extractPackageName(packageVersion);

      // Get or initialize registry entry
      let entry = this.registry.get(tag);
      if (!entry) {
        entry = {
          package: packageVersion,
          tagName: tag
        };
        this.registry.set(tag, entry);
      }

      // 1. Load main element (if needed)
      if (needs.element) {
        console.log(`[EsmPieLoader] Loading element ${tag} from ${packageName}`);
        const elementModule = await this.importWithRetry(packageName);
        const elementClass = this.extractElementClass(elementModule, tag);
        
        // Use shared utility for consistent registration (matches IIFE behavior)
        entry.element = await registerCustomElement(tag, elementClass);
        console.log(`[EsmPieLoader]   ✅ Element registered: ${tag}`);
      }

      // 2. Load controller (if needed)
      if (needs.controller) {
        try {
          console.log(`[EsmPieLoader] Loading controller for ${tag}`);
          const controllerModule = await this.importWithRetry(`${packageName}/controller`);
          entry.controller = controllerModule.default || controllerModule;
          console.log(`[EsmPieLoader]   ✅ Controller loaded: ${tag}`);
        } catch (error) {
          console.warn(`[EsmPieLoader]   ⚠️ Controller not available for ${tag} (this is okay if package has no controller)`);
        }
      }

      // 3. Load configure (if needed)
      // Note: Configure components in ESM are web component classes (like IIFE bundles)
      if (needs.configure) {
        try {
          console.log(`[EsmPieLoader] Loading configure for ${tag}`);
          const configureModule = await this.importWithRetry(`${packageName}/configure`);
          const configureClass = this.extractElementClass(configureModule, `${tag}-config`);
          const configElName = `${tag}-config`;
          
          // Use shared utility for consistent registration (matches IIFE behavior)
          entry.config = await registerCustomElement(configElName, configureClass);
          console.log(`[EsmPieLoader]   ✅ Configure registered: ${configElName}`);
        } catch (error) {
          console.warn(`[EsmPieLoader]   ⚠️ Configure not available for ${tag}:`, error.message);
        }
      }

      // Mark as loaded
      this.loadedElements.add(tag);

      this.trackOperationComplete("loadElement", startTime);
    } catch (error) {
      console.error(`[EsmPieLoader] Failed to load element ${tag}:`, error);
      this.trackOperationComplete("loadElement", startTime, false, error.message);
      throw error;
    }
  }

  /**
   * Extract element class from module exports
   * Tries multiple export patterns: default, Element, tag name, Configure
   */
  private extractElementClass(module: any, fallbackName: string): any {
    // Try different export patterns
    if (module.default && typeof module.default === 'function') {
      // Default export (most common)
      return module.default;
    } else if (module.Element && typeof module.Element === 'function') {
      // Named export: Element
      return module.Element;
    } else if (module.Configure && typeof module.Configure === 'function') {
      // Named export: Configure (for configure modules)
      return module.Configure;
    } else if (module[fallbackName] && typeof module[fallbackName] === 'function') {
      // Named export matching tag name
      return module[fallbackName];
    } else {
      console.error(`[EsmPieLoader] No element constructor found for ${fallbackName} in module`, module);
      throw new Error(`No element constructor found for ${fallbackName}`);
    }
  }

  /**
   * Implementation of the abstract method from NewRelicEnabledClient
   */
  protected getTrackingBaseAttributes(): Record<string, any> {
    return {
      cdnBaseUrl: this.cdnBaseUrl,
      bundleType: this.bundleType,
      networkInfo: this.getNetworkInfo()
    };
  }

  /**
   * Track operation start if trackPageActions is enabled
   */
  private trackOperationStart(
    operationName: string,
    data: Record<string, any> = {},
    apiRequest: boolean = false
  ) {
    const startTime = Date.now();

    if (!this.loaderConfig.trackPageActions || !this.newRelic) {
      return startTime;
    }

    const operationType = apiRequest ? "api" : "esm";

    this.track("activity", `${operationType}_${operationName}_started`, {
      data: JSON.stringify(data),
      timestamp: new Date().toISOString()
    });

    return startTime;
  }

  /**
   * Track operation complete if trackPageActions is enabled
   */
  private trackOperationComplete(
    operationName: string,
    startTime: number,
    apiRequest: boolean = false,
    errorMessage?: string
  ) {
    if (!this.loaderConfig.trackPageActions || !this.newRelic) {
      return;
    }

    const operationType = apiRequest ? "api" : "esm";

    this.track("activity", `${operationType}_${operationName}_complete`, {
      duration: Date.now() - startTime,
      success: errorMessage ? false : true,
      ...(errorMessage && { errorMessage })
    });
  }
}
