/**
 * Shared types, constants, and utilities for PIE loaders (IIFE and ESM)
 */

/**
 * Bundle endpoints configuration
 */
export interface BundleEndpoints {
  buildServiceBase: string;
  bundleBase: string;
}

/**
 * Default endpoints for different environments
 */
export const DEFAULT_ENDPOINTS = {
  prod: {
    bundleBase: "https://pits-cdn.pie-api.io/bundles/",
    buildServiceBase: "https://proxy.pie-api.com/bundles/"
  },
  // this is actually not really used anymore? equals to dev
  stage: {
    bundleBase: "https://pits-cdn.pie-api.io/bundles/",
    buildServiceBase: "https://proxy.pie-api.com/bundles/"
  },
  dev: {
    bundleBase: "https://pits-cdn.pie-api.io/bundles/",
    buildServiceBase: "https://proxy.dev.pie-api.com/bundles/"
  }
};

/**
 * Loading status for registry entries
 */
export enum Status {
  loading = "loading",
  loaded = "loaded"
}

/**
 * IIFE bundle types - maps to specific bundle files
 */
export enum BundleType {
  player = "player.js",
  clientPlayer = "client-player.js",
  editor = "editor.js"
}

/**
 * Registry entry for tracking loaded PIE components (IIFE loader)
 */
export interface Entry {
  package: string;
  status: Status;
  tagName: string;
  controller?: any;
  config?: any;  // Custom element constructor
  element?: any; // Custom element constructor
}

/**
 * Configuration options for loaders
 */
export type LoaderConfig = {
  /**
   * Enable tracking page actions/events with New Relic.
   * When enabled, all network requests will be instrumented.
   * Note: Setting this to true increases data sent to New Relic, which may affect costs.
   * Default: false
   */
  trackPageActions?: boolean;
};

/**
 * Default loader configuration values
 */
export const DEFAULT_LOADER_CONFIG: Required<LoaderConfig> = {
  trackPageActions: false
};

/**
 * Shared utility: Register a custom element and wait for it to be defined.
 * This ensures consistent behavior between IIFE and ESM loaders.
 * 
 * @param tagName - Custom element tag name
 * @param elementClass - Custom element class to register
 * @returns Promise resolving to the registered custom element constructor
 */
export async function registerCustomElement(
  tagName: string,
  elementClass: any
): Promise<any> {
  // Check if already defined (avoid re-definition errors)
  const existing = customElements.get(tagName);
  if (existing) {
    console.log(`[PIE Loader] Custom element already registered: ${tagName}`);
    return existing;
  }

  // Define the custom element
  customElements.define(tagName, elementClass);
  
  // Wait for it to be fully defined before returning
  await customElements.whenDefined(tagName);
  
  // Return the actual registered constructor
  return customElements.get(tagName);
}

/**
 * Shared utility: Check if all specified custom elements have been defined.
 * Used by both IIFE and ESM loaders.
 * 
 * @param elements - Array of element queries with name and tag
 * @returns Promise resolving to { elements, val: boolean }
 */
export async function checkElementsLoaded(
  elements: Array<{ name: string; tag: string }>
): Promise<{ elements: typeof elements; val: boolean }> {
  try {
    const promises = elements.map(el => customElements.whenDefined(el.tag));
    await Promise.all(promises);
    return { elements, val: true };
  } catch (error) {
    console.error('[PIE Loader] Error waiting for elements:', error);
    return { elements, val: false };
  }
}

