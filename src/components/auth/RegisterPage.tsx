import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { devStore } from '../../store/devStore';
import { supabase } from '../../lib/supabase';
import {
  User,
  Mail,
  Phone,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { navigate, referralCodeParam } = useNavigation();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: referralCodeParam || ''
  });

  const [sponsorName, setSponsorName] = useState<string | null>(null);
  const [sponsorStatus, setSponsorStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (referralCodeParam) {
      setFormData(prev => ({ ...prev, referralCode: referralCodeParam }));
    }
  }, [referralCodeParam]);

  useEffect(() => {
    const code = formData.referralCode.trim().toUpperCase();
    if (!code) {
      setSponsorName(null);
      setSponsorStatus('idle');
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const { data: sponsorRow } = await supabase
          .from('profiles')
          .select('full_name, referral_code')
          .ilike('referral_code', code)
          .maybeSingle();

        if (!isMounted) return;

        if (sponsorRow) {
          setSponsorName(sponsorRow.full_name);
          setSponsorStatus('valid');
          return;
        }

        const db = devStore.getData();
        const sponsor = db.users.find(u => u.referralCode.toUpperCase() === code);
        if (sponsor) {
          setSponsorName(sponsor.fullName);
          setSponsorStatus('valid');
        } else {
          setSponsorName(null);
          setSponsorStatus('invalid');
        }
      } catch (err) {
        if (!isMounted) return;
        setSponsorName(null);
        setSponsorStatus('invalid');
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [formData.referralCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      error('Please accept the Terms & Conditions and Commission Rules to proceed.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const res = await register({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      referralCode: formData.referralCode.trim().toUpperCase() || undefined
    });
    setLoading(false);

    if (res.success) {
      success('Account kamyabi se register ho gaya! Welcome to DSN.');
      navigate('/dashboard');
    } else {
      error(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            DSN
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            {t('registerTitle')}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            {t('registerSub')}
          </p>
        </div>

        {/* Rule Reminder */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Registration Shafafiyat:</strong> Registration mukammal karne par account 'Pending Activation' mein hoga. Team commissions aur points sirf activation fee verification ke baad credit hotay hain.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Poora Naam (Full Name) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Usman Ali"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile / WhatsApp Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="03001234567"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Referral Code Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Sponsor Referral Code (Optional)
              </label>
              {sponsorStatus === 'valid' && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sponsor: {sponsorName}</span>
                </span>
              )}
              {sponsorStatus === 'invalid' && (
                <span className="text-[11px] font-bold text-rose-500">
                  Code not found
                </span>
              )}
            </div>
            <div className="relative">
              <Sparkles className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="e.g. DSN-AHM101"
                value={formData.referralCode}
                onChange={e => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-600 select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded mt-0.5 border-slate-300 focus:ring-blue-500"
              />
              <span className="leading-normal">
                Main DSN ke{' '}
                <button
                  type="button"
                  onClick={() => navigate('/legal')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Qawaneen & Policy
                </button>
                , Refund Policy aur Shafaf Commission Rules ko parh kar tasleem karta hoon.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            <span>{loading ? 'Account ban raha hai...' : t('navRegister')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-600">
          Pehle se account mojood hai?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 font-bold hover:underline"
          >
            {t('navLogin')}
          </button>
        </div>
      </div>
    </div>
  );
};
