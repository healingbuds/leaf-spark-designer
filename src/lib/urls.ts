/**
 * URL utilities for consistent redirect handling across environments.
 * 
 * For multi-tenant deployments, the redirect URL is derived from the current host.
 * This ensures email confirmation links return users to the same domain they signed up from.
 */

/**
 * Get the current origin URL for auth redirects.
 * Uses the current host to support multi-tenant deployments.
 */
export const getProductionUrl = (): string => {
  return window.location.origin;
};

/**
 * Get a full URL path using the current origin.
 * @param path - The path to append (e.g., '/auth', '/dashboard')
 */
export const getProductionPath = (path: string): string => {
  const baseUrl = getProductionUrl();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};
