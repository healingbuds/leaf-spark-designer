import { useState, useEffect, useCallback } from 'react';

export type ApiEnvironment = 'production' | 'staging';

const STORAGE_KEY = 'drgreen_api_environment';

/**
 * Hook to manage API environment preference (Production vs Staging/Railway)
 * Persists to localStorage and syncs across tabs
 */
export function useApiEnvironment() {
  const [environment, setEnvironmentState] = useState<ApiEnvironment>(() => {
    // Initial read from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'staging' || stored === 'production') {
        return stored;
      }
    }
    return 'production';
  });

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        if (e.newValue === 'staging' || e.newValue === 'production') {
          setEnvironmentState(e.newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setEnvironment = useCallback((newEnv: ApiEnvironment) => {
    setEnvironmentState(newEnv);
    localStorage.setItem(STORAGE_KEY, newEnv);
  }, []);

  return {
    environment,
    setEnvironment,
    isStaging: environment === 'staging',
    isProduction: environment === 'production',
  };
}

/**
 * Helper to get current API environment from localStorage (for use outside React)
 */
export function getApiEnvironment(): ApiEnvironment {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'staging' || stored === 'production') {
      return stored;
    }
  }
  return 'production';
}

/**
 * Environment display info for UI
 */
export const API_ENVIRONMENTS: Record<ApiEnvironment, { label: string; description: string }> = {
  production: {
    label: 'Production',
    description: 'api.drgreennft.com',
  },
  staging: {
    label: 'Staging (Railway)',
    description: 'Railway backend',
  },
};
