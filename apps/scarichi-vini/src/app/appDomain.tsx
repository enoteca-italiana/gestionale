import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AppDomainContext,
  readStoredDomain,
  writeStoredDomain,
  type AppDomain,
  type AppDomainContextValue
} from '@/app/appDomainContext';

export function AppDomainProvider({ children }: { children: ReactNode }) {
  const [activeDomain, setActiveDomain] = useState<AppDomain>(() => readStoredDomain());

  useEffect(() => {
    writeStoredDomain(activeDomain);
  }, [activeDomain]);

  useEffect(() => {
    document.body.dataset.domain = activeDomain;
    return () => {
      if (document.body.dataset.domain === activeDomain) {
        delete document.body.dataset.domain;
      }
    };
  }, [activeDomain]);

  const value = useMemo<AppDomainContextValue>(
    () => ({
      activeDomain,
      setActiveDomain
    }),
    [activeDomain]
  );

  return <AppDomainContext.Provider value={value}>{children}</AppDomainContext.Provider>;
}
