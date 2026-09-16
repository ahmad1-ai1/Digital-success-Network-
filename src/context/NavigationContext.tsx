import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface NavigationContextType {
  currentPath: string;
  searchParams: URLSearchParams;
  navigate: (path: string) => void;
  referralCodeParam: string | null;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

function parseNavigationState() {
  if (typeof window === 'undefined') {
    return {
      path: '/',
      searchParams: new URLSearchParams(),
      referralCode: null
    };
  }

  // 1. Path resolution:
  // Check hash route first if it has a non-root path (e.g. #/register, #/dashboard)
  const hash = window.location.hash.replace(/^#/, '').trim();
  const hashPath = hash.split('?')[0];

  let path = '/';
  if (hashPath && hashPath !== '/' && hashPath !== '') {
    path = hashPath.startsWith('/') ? hashPath : '/' + hashPath;
  } else if (window.location.pathname && window.location.pathname !== '' && window.location.pathname !== '/') {
    path = window.location.pathname;
  }

  // Normalize trailing slashes (e.g. '/register/' -> '/register')
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // 2. Query params extraction (combines window.location.search and hash query)
  const combined = new URLSearchParams(window.location.search);
  if (hash.includes('?')) {
    const hashQuery = hash.split('?')[1];
    const hp = new URLSearchParams(hashQuery);
    hp.forEach((val, key) => {
      if (!combined.has(key)) {
        combined.set(key, val);
      }
    });
  }

  // 3. Referral code capture
  let ref = combined.get('ref');
  if (ref && ref.trim()) {
    ref = ref.trim().toUpperCase();
    try {
      localStorage.setItem('dsn_captured_ref', ref);
    } catch {
      // ignore
    }
  } else {
    try {
      const saved = localStorage.getItem('dsn_captured_ref');
      if (saved && saved.trim()) {
        ref = saved.trim().toUpperCase();
      }
    } catch {
      // ignore
    }
  }

  return {
    path,
    searchParams: combined,
    referralCode: ref || null
  };
}

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [navState, setNavState] = useState(parseNavigationState);

  const updateLocationState = useCallback(() => {
    setNavState(parseNavigationState());
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', updateLocationState);
    window.addEventListener('hashchange', updateLocationState);

    // Initial sync
    updateLocationState();

    return () => {
      window.removeEventListener('popstate', updateLocationState);
      window.removeEventListener('hashchange', updateLocationState);
    };
  }, [updateLocationState]);

  const navigate = useCallback((path: string) => {
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    window.location.hash = cleanPath;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(updateLocationState, 0);
  }, [updateLocationState]);

  return (
    <NavigationContext.Provider
      value={{
        currentPath: navState.path,
        searchParams: navState.searchParams,
        navigate,
        referralCodeParam: navState.referralCode
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
