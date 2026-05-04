import { createContext, useContext } from 'react';

export type AppDomain = 'wine' | 'spirits';

export type AppDomainContextValue = {
  activeDomain: AppDomain;
  setActiveDomain: (domain: AppDomain) => void;
};

export const ACTIVE_DOMAIN_KEY = 'scarichi.activeDomain.v1';
export const DEFAULT_DOMAIN: AppDomain = 'wine';

export const AppDomainContext = createContext<AppDomainContextValue | null>(null);

export function isValidDomain(value: string | null): value is AppDomain {
  return value === 'wine' || value === 'spirits';
}

export function readStoredDomain(): AppDomain {
  try {
    const raw = window.localStorage.getItem(ACTIVE_DOMAIN_KEY);
    return isValidDomain(raw) ? raw : DEFAULT_DOMAIN;
  } catch {
    return DEFAULT_DOMAIN;
  }
}

export function writeStoredDomain(domain: AppDomain) {
  try {
    window.localStorage.setItem(ACTIVE_DOMAIN_KEY, domain);
  } catch {
    // Ignore storage failures.
  }
}

export function useAppDomain(): AppDomainContextValue {
  const ctx = useContext(AppDomainContext);
  if (!ctx) {
    throw new Error('useAppDomain must be used within AppDomainProvider');
  }
  return ctx;
}
