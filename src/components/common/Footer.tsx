import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { Shield, Sparkles, Mail, MessageSquare } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white font-black text-lg">
                DSN
              </div>
              <div>
                <span className="font-display font-extrabold text-lg text-white tracking-tight">
                  DIGITAL SUCCESS NETWORK
                </span>
                <p className="text-xs text-emerald-400 font-semibold">Team Se Taraqqi Tak</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering motivated individuals through structured community networking, points tracking, transparent commission distribution, and skill enhancement.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="hover:text-white transition-colors"
                >
                  {t('navHome')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-white transition-colors"
                >
                  {t('navAbout')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/how-it-works')}
                  className="hover:text-white transition-colors"
                >
                  {t('navHowItWorks')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/products')}
                  className="hover:text-white transition-colors"
                >
                  {t('navProducts')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/support')}
                  className="hover:text-white transition-colors"
                >
                  {t('navSupport')}
                </button>
              </li>
            </ul>
          </div>

          {/* Rules & Policy */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Rules & Trust
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => navigate('/legal')}
                  className="hover:text-white transition-colors"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/legal')}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/legal')}
                  className="hover:text-white transition-colors"
                >
                  Refund & Cancellation Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/legal')}
                  className="hover:text-white transition-colors"
                >
                  Commission & Reward Rules
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Transparency */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Contact & Transparency
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              DSN operates on transparent multi-level rules (L1 20%, L2 10%, L3 5%, L4 3%). We do not offer guaranteed returns or passive financial investment schemes. Earnings are purely effort and performance-based.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>support@digitalsuccessnetwork.pk</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Official WhatsApp Support Available</span>
              </div>
            </div>

            {/* Subtle Admin Access Link */}
            <div className="pt-3 border-t border-slate-800/80">
              <button
                onClick={() => navigate('/admin')}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1.5 opacity-70 hover:opacity-100 cursor-pointer"
                title="Administration Access"
              >
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Digital Success Network (DSN). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Tagline: “Team Se Taraqqi Tak”</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
