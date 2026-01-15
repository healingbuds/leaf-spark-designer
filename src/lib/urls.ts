/**
 * URL utilities for consistent redirect handling across environments
 * 
 * This ensures email confirmation links always point to the correct production domain,
 * regardless of which domain the user signed up from.
 */

// Canonical production domain - all auth redirects should use this
const PRODUCTION_DOMAIN = 'https://healingbuds.pt';

/**
 * Get the production URL for auth redirects.
 * In development, uses current origin for testing.
 * In production, always uses the canonical domain.
 */
export const getProductionUrl = (): string => {
  // In development, use current origin for local testing
  if (import.meta.env.DEV) {
    return window.location.origin;
  }
  
  // In production, always use the canonical domain
  return PRODUCTION_DOMAIN;
};

/**
 * Get a full URL path using the production domain.
 * @param path - The path to append (e.g., '/auth', '/dashboard')
 */
export const getProductionPath = (path: string): string => {
  const baseUrl = getProductionUrl();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};
