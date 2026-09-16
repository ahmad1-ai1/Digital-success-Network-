import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import {
  UserPlus,
  CheckCircle,
  Share2,
  PieChart,
  Award,
  Gift,
  ArrowRight,
  Wallet,
  AlertTriangle
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { navigate } = useNavigation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Rehnumai (Full Guide)
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-3 font-display">
          DSN Kaise Kaam Karta Hai?
        </h1>
        <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
          {language === 'roman_urdu'
            ? 'Account bananey se lekar points, commission aur withdrawal tak har marhalay ki mukammal tafseel.'
            : 'Comprehensive step-by-step breakdown of registration, activation, referral tracking, commissions, points, and withdrawals.'}
        </p>
      </div>

      {/* Critical Policy Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 text-amber-900">
        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold mb-1">Ahem Tareen Shafafiyat Note:</p>
          <p className="leading-relaxed">
            Sirf registration karne se kisi bhi sponsor ya member ko commission, points ya spin credits nahi miltay. DSN par earnings aur points sirf us waqt generate hotay hain jab naya member muqarara activation fee jama karwa kar Central Operations se tasdeeq (approval) hasil karta hai.
          </p>
        </div>
      </div>

      {/* Sequential Steps */}
      <div className="space-y-8">
        {/* Step 1 */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-1 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center">
              1
            </div>
          </div>
          <div className="lg:col-span-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Naya Account Register Karein</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Apna poora naam, email, mobile number aur sponsor ka referral code darj karein. Register hote hi aapko aapka unique referral code (maslan: DSN-AHM123) mil jata hai.
            </p>
          </div>
          <div className="lg:col-span-3 text-right">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700">
              State: Pending Activation
            </span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-1 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center">
              2
            </div>
          </div>
          <div className="lg:col-span-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Activation Payment Proof Submit Karein</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Member dashboard ke 'Activation Proof' section mein jakar 1,300 PKR ki muqarara activation ka receipt/transaction ID submit karein. Admin verification ke baad aapka account Active ho jata hai.
            </p>
          </div>
          <div className="lg:col-span-3 text-right">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              State: Active
            </span>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-1 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center">
              3
            </div>
          </div>
          <div className="lg:col-span-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Referral Link Share Karein & Team Banayein</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dashboard se apna personalized link doston aur network mein share karein. DSN ka system 4 satah (Levels 1 to 4) par team genealogy maintain karta hai.
            </p>
          </div>
          <div className="lg:col-span-3 text-right">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              Levels 1, 2, 3, 4
            </span>
          </div>
        </div>

        {/* Step 4 */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-1 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white font-black text-xl flex items-center justify-center">
              4
            </div>
          </div>
          <div className="lg:col-span-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Commissions, Points & Spin Credits Wasool Karein</h2>
            <div className="text-sm text-slate-600 space-y-2 mt-2 leading-relaxed">
              <p>• <strong>Commission:</strong> Level 1 (20% = 200 PKR), Level 2 (10% = 100 PKR), Level 3 (5% = 50 PKR), Level 4 (3% = 30 PKR).</p>
              <p>• <strong>Points:</strong> Direct member par 50 points, Indirect members par 25 points.</p>
              <p>• <strong>Lucky Spin:</strong> Har direct eligible joining par direct sponsor ko 1 spin credit milta hai.</p>
            </div>
          </div>
          <div className="lg:col-span-3 text-right">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              Instant Credit
            </span>
          </div>
        </div>

        {/* Step 5 */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-1 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-xl flex items-center justify-center">
              5
            </div>
          </div>
          <div className="lg:col-span-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Ranks & Asaan Withdrawals</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Points jama karte huay Starter (500 pts) se lekar Crown (10,000 pts) tak pohanchen. Jab aapka balance 20 PKR ho jaye, to 2% processing fee ke sath JazzCash, EasyPaisa ya Bank mein foran withdrawal request submit karein.
            </p>
          </div>
          <div className="lg:col-span-3 text-right">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
              Min 20 PKR (2% Fee)
            </span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center pt-4">
        <button
          onClick={() => navigate('/register')}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-98"
        >
          <span>Abhi Account Banayein</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
