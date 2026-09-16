import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  X,
  Globe,
  User as UserIcon,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const Header: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { currentPath, navigate } = useNavigation();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'roman_urdu' ? 'en' : 'roman_urdu');
  };

  const navLinks = [
    { label: t('navHome'), path: '/' },
    { label: t('navAbout'), path: '/about' },
    { label: t('navHowItWorks'), path: '/how-it-works' },
    { label: t('navProducts'), path: '/products' },
    { label: t('navLegal'), path: '/legal' },
    { label: t('navSupport'), path: '/support' }
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Tagline */}
          <div
            id="header-brand-logo"
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform duration-200">
              DSN
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  DIGITAL SUCCESS
                </span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  NETWORK
                </span>
              </div>
              <p className="text-xs font-medium text-emerald-600 tracking-wide">
                “Team Se Taraqqi Tak”
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map(link => (
              <button
                key={link.path}
                id={`nav-link-${link.path.replace('/', '') || 'home'}`}
                onClick={() => handleNavClick(link.path)}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                  isActive(link.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switch */}
            <button
              id="header-lang-switch"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="Switch Language"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span>{language === 'roman_urdu' ? 'EN' : 'Roman Urdu'}</span>
            </button>

            {/* If Logged In */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <button
                    id="header-btn-admin"
                    onClick={() => handleNavClick('/admin')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{t('navAdmin')}</span>
                  </button>
                ) : (
                  <button
                    id="header-btn-dashboard"
                    onClick={() => handleNavClick('/dashboard')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
                  >
                    <UserIcon className="w-4 h-4 text-blue-200" />
                    <span>{t('navDashboard')}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="header-btn-login"
                  onClick={() => handleNavClick('/login')}
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  {t('navLogin')}
                </button>
                <button
                  id="header-btn-register"
                  onClick={() => handleNavClick('/register')}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>{t('navRegister')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleLanguage}
              className="p-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg border border-slate-200"
              aria-label="Toggle language"
            >
              {language === 'roman_urdu' ? 'EN' : 'UR'}
            </button>
            <button
              id="header-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-1">
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`w-full flex items-center justify-between px-4 py-3 text-base font-semibold rounded-xl transition-all ${
                  isActive(link.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 bg-slate-50 rounded-xl text-xs text-slate-600">
                  Logged in as: <strong className="text-slate-900">{user?.fullName}</strong> ({user?.role})
                </div>
                {isAdmin ? (
                  <button
                    onClick={() => handleNavClick('/admin')}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-slate-900 rounded-xl"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{t('navAdmin')}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavClick('/dashboard')}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl"
                  >
                    <UserIcon className="w-4 h-4 text-blue-200" />
                    <span>{t('navDashboard')}</span>
                  </button>
                )}
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavClick('/login')}
                  className="w-full py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl text-center"
                >
                  {t('navLogin')}
                </button>
                <button
                  onClick={() => handleNavClick('/register')}
                  className="w-full py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl text-center"
                >
                  {t('navRegister')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
