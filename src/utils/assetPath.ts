/**
 * Asset path helper for GitHub Pages deployment
 * Automatically adds basePath prefix in production
 */

// Get basePath from environment or use default
const basePath = typeof process !== 'undefined' && process.env.NODE_ENV === 'production' 
  ? '/snapshoot' 
  : '';

/**
 * Convert relative asset path to absolute path with basePath
 * @param path - Asset path starting with /assets/
 * @returns Full path with basePath prefix in production
 */
export function getAssetPath(path: string): string {
  // If path already has basePath, return as is
  if (basePath && path.startsWith(basePath)) {
    return path;
  }
  
  // Add basePath prefix
  return `${basePath}${path}`;
}

/**
 * Get public file path (e.g., for manifest, icons)
 * @param path - Public file path starting with /
 * @returns Full path with basePath prefix in production
 */
export function getPublicPath(path: string): string {
  return getAssetPath(path);
}
