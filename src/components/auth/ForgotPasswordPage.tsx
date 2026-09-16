import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Please enter your email address.');
      return;
    }
    const res = await authService.resetPassword(email);
    setSubmitted(true);
    if (res.success) {
      success(res.message);
    } else {
      error(res.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
            Password Recovery
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Apna registered email darj karein taakay password recovery link bheja ja sakay.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="text-sm font-semibold text-emerald-950">
              Recovery link successfully sent to {email}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-white text-xs font-bold text-emerald-800 rounded-xl border border-emerald-300"
            >
              Wapas Login Karein
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Reset Link Bhejein</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Login Page Par Wapas Jayein</span>
          </button>
        </div>
      </div>
    </div>
  );
};
