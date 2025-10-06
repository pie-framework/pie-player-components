/**
 * @deprecated This module is now a compatibility layer.
 * 
 * The original PieLoader has been refactored into IifePieLoader for clarity.
 * Use IifePieLoader or EsmPieLoader directly instead.
 * 
 * This file re-exports from IifePieLoader and shared types to maintain backward compatibility
 * with existing test code and any external consumers.
 */

// Re-export shared types and constants
export {
  BundleEndpoints,
  BundleType,
  Entry,
  Status,
  DEFAULT_ENDPOINTS,
  LoaderConfig
} from "./loaders/shared";

// Re-export IifePieLoader and its utilities
export {
  IifePieLoader,
  IifePieLoader as PieLoader,  // Alias for backward compatibility
  needToLoad
} from "./loaders/IifePieLoader";

// Initialize global helper for script loading tracking
// This needs to be initialized here because tests and other code may rely on it
if (typeof window !== 'undefined') {
  window["pieHelpers"] = window["pieHelpers"] || {
    loadingScripts: {}
  };
}
