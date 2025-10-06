/**
 * Shared types and constants for PIE loaders (IIFE and ESM)
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

