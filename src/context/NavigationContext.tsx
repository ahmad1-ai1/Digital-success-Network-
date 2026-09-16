import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface NavigationContextType {
  currentPath: string;
  searchParams: URLSearchParams;
  navigate: (path: string) => void;
  referralCodeParam: string | null;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) return hash.split('?')[0] || '/';
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => {
    if (typeof window !== 'undefined') {
      const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
      return new URLSearchParams(hashQuery || window.location.search);
    }
    return new URLSearchParams();
  });

  const [referralCodeParam, setReferralCodeParam] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
      const params = new URLSearchParams(hashQuery || window.location.search);
      return params.get('ref');
    }
    return null;
  });

  const updateLocationState = useCallback(() => {
    const hash = window.location.hash.replace(/^#/, '');
    const pathPart = hash ? hash.split('?')[0] : window.location.pathname || '/';
    const queryPart = hash.includes('?') ? hash.split('?')[1] : window.location.search;
    const params = new URLSearchParams(queryPart);

    setCurrentPath(pathPart);
    setSearchParams(params);

    const ref = params.get('ref');
    if (ref) {
      setReferralCodeParam(ref);
      localStorage.setItem('dsn_captured_ref', ref);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', updateLocationState);
    window.addEventListener('hashchange', updateLocationState);

    // Initial capture from localStorage if present
    const savedRef = localStorage.getItem('dsn_captured_ref');
    if (savedRef && !referralCodeParam) {
      setReferralCodeParam(savedRef);
    }

    return () => {
      window.removeEventListener('popstate', updateLocationState);
      window.removeEventListener('hashchange', updateLocationState);
    };
  }, [updateLocationState, referralCodeParam]);

  const navigate = useCallback((path: string) => {
    if (path.startsWith('/')) {
      window.location.hash = path;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = '/' + path;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        currentPath,
        searchParams,
        navigate,
        referralCodeParam
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
