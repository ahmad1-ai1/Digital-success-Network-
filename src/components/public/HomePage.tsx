import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { CEOSection } from '../common/CEOSection';
import {
  Users,
  TrendingUp,
  Award,
  Gift,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  HelpCircle,
  Clock,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t, language } = useTranslation();
  const { navigate } = useNavigation();

  const commissionLevels = [
    { level: 'Level 1', rate: '20%', type: 'Direct Sponsor', desc: 'Direct eligible joinings activated by you' },
    { level: 'Level 2', rate: '10%', type: 'Team Expansion', desc: 'Activations from your Level 1 referrals' },
    { level: 'Level 3', rate: '5%', type: 'Network Depth', desc: 'Activations from your Level 2 referrals' },
    { level: 'Level 4', rate: '3%', type: 'Community Scale', desc: 'Activations from your Level 3 referrals' }
  ];

  const ranks = [
    { name: 'Starter', points: '500', color: 'border-blue-500 text-blue-600 bg-blue-50' },
    { name: 'Silver', points: '1,500', color: 'border-slate-400 text-slate-700 bg-slate-100' },
    { name: 'Gold', points: '3,000', color: 'border-amber-500 text-amber-600 bg-amber-50' },
    { name: 'Platinum', points: '5,000', color: 'border-cyan-500 text-cyan-600 bg-cyan-50' },
    { name: 'Diamond', points: '8,000', color: 'border-purple-500 text-purple-600 bg-purple-50' },
    { name: 'Crown', points: '10,000', color: 'border-pink-500 text-pink-600 bg-pink-50' }
  ];

  const faqs = [
    {
      q: language === 'roman_urdu' ? 'DSN kya hai aur yeh kaise kaam karta hai?' : 'What is DSN and how does it work?',
      a: language === 'roman_urdu'
        ? 'Digital Success Network (DSN) ek aisi digital networking community hai jahan afraad teamwork aur structured referral progression ke zariye commissions, points aur ranks hasil kartay hain.'
        : 'Digital Success Network (DSN) is a digital community platform where members collaborate through structured team building, transparent points tracking, and multi-tier rewards.'
    },
    {
      q: language === 'roman_urdu' ? 'Kya sirf registration se commission milta hai?' : 'Do I earn commission on registration alone?',
      a: language === 'roman_urdu'
        ? 'Hargiz nahi! DSN mein registration se koi commission ya points generate nahi hotay. Commission aur points sirf us waqt credit hotay hain jab member ka account muqarara activation proof ke baad faal (active) hota hai.'
        : 'Absolutely not! Registration alone NEVER generates commissions, points, or earnings. Rewards only accrue upon verified activation of an eligible member.'
    },
    {
      q: language === 'roman_urdu' ? 'Points kaise calculate hotay hain?' : 'How are points awarded?',
      a: language === 'roman_urdu'
        ? 'Har direct eligible joining par sponsor ko 50 points miltay hain, jabkay Level 2 se Level 4 tak team joinings par 25 points credit hotay hain.'
        : 'Direct eligible activations award 50 points to the direct sponsor, while indirect joinings across Levels 2 through 4 award 25 points each.'
    },
    {
      q: language === 'roman_urdu' ? 'Withdrawal ka kya tareeqa aur sharait hain?' : 'What are the withdrawal rules and methods?',
      a: language === 'roman_urdu'
        ? 'Kam az kam withdrawal 20 PKR hai. Har withdrawal par 2% transparent processing fee lagu hoti hai (Maslan: 1,000 PKR par 20 PKR fee aur 980 PKR net). Payment JazzCash, EasyPaisa ya Bank Transfer se wasool ki ja sakti hai.'
        : 'Minimum withdrawal is 20 PKR with a transparent 2% processing fee (e.g. 20 PKR fee on 1,000 PKR, receiving 980 PKR net). Supported payout methods include JazzCash, EasyPaisa, and Bank Transfer.'
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-white pt-12 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs sm:text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Official Network Platform</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span className="text-emerald-700 font-bold">Team Se Taraqqi Tak</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight font-display">
            DIGITAL SUCCESS NETWORK
          </h1>

          <p className="mt-4 text-xl sm:text-2xl font-bold text-emerald-600 tracking-wide">
            “Team Se Taraqqi Tak”
          </p>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('heroSub')}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              id="hero-btn-join"
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all active:scale-98"
            >
              <span>{t('ctaJoin')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              id="hero-btn-how-works"
              onClick={() => navigate('/how-it-works')}
              className="px-6 py-3.5 rounded-xl font-bold text-base text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 shadow-xs transition-all"
            >
              {t('ctaHowItWorks')}
            </button>

            <button
              id="hero-btn-login"
              onClick={() => navigate('/login')}
              className="px-6 py-3.5 rounded-xl font-bold text-base text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              {t('ctaLogin')}
            </button>
          </div>

          {/* Value Pillars */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-2xl font-extrabold text-blue-600">L1 - L4</span>
              <p className="text-xs text-slate-500 mt-1 font-medium">Multi-Level Commission</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-2xl font-extrabold text-emerald-600">50 / 25</span>
              <p className="text-xs text-slate-500 mt-1 font-medium">Direct / Team Points</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-2xl font-extrabold text-amber-600">6 Ranks</span>
              <p className="text-xs text-slate-500 mt-1 font-medium">Starter to Crown</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-2xl font-extrabold text-purple-600">20 PKR</span>
              <p className="text-xs text-slate-500 mt-1 font-medium">Min Withdrawal (2% Fee)</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 font-display">
            {t('sectionHowWorksTitle')}
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            {t('sectionHowWorksSub')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t('step1Title')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t('step1Desc')}</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t('step2Title')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t('step2Desc')}</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t('step3Title')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t('step3Desc')}</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-lg mb-4">
                4
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t('step4Title')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t('step4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Structure Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="max-w-3xl mb-10">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
              Transparent Compensation
            </span>
            <h2 className="text-3xl font-extrabold mt-1 font-display">
              {t('commStructureTitle')}
            </h2>
            <p className="mt-2 text-slate-400 text-sm sm:text-base">
              {t('commStructureSub')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {commissionLevels.map((lvl, idx) => (
              <div
                key={lvl.level}
                className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-700 text-slate-300">
                      {lvl.level}
                    </span>
                    <span className="text-2xl font-black text-emerald-400">
                      {lvl.rate}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{lvl.type}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{lvl.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              * Commission rule: Calculated strictly upon successful activation verification. Registration alone generates 0% commission.
            </p>
            <button
              onClick={() => navigate('/how-it-works')}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>Learn full calculation</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Points & Ranks Progression */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Points Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 font-display">
                {t('pointsTitle')}
              </h2>
              <p className="text-slate-600 text-sm mt-2 mb-6">
                {t('pointsSub')}
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{t('directPoints')}</h3>
                    <p className="text-xs text-slate-500">{t('directPointsDesc')}</p>
                  </div>
                  <span className="text-lg font-black text-blue-700 bg-white px-3 py-1 rounded-lg border border-blue-200">
                    +50 Pts
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{t('indirectPoints')}</h3>
                    <p className="text-xs text-slate-500">{t('indirectPointsDesc')}</p>
                  </div>
                  <span className="text-lg font-black text-emerald-700 bg-white px-3 py-1 rounded-lg border border-emerald-200">
                    +25 Pts
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
              {t('pointsRuleNote')}
            </div>
          </div>

          {/* Ranks Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 font-display">
                  {t('ranksTitle')}
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  {t('ranksSub')}
                </p>
              </div>
              <Award className="w-8 h-8 text-amber-500" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {ranks.map((r, i) => (
                <div
                  key={r.name}
                  className={`p-4 rounded-2xl border ${r.color} flex flex-col justify-between`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tier {i + 1}
                  </span>
                  <div className="my-2">
                    <span className="text-lg font-black">{r.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    {r.points} Points
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Climb tiers automatically as your verified points ledger grows.</span>
              <button
                onClick={() => navigate('/register')}
                className="text-blue-600 font-bold hover:underline"
              >
                Start as Starter →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Spin Wheel & Withdrawal Transparency */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Spin Wheel Highlight */}
          <div className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-3xl p-8 shadow-md flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                <Gift className="w-6 h-6 text-amber-400" />
              </div>
              <h2 className="text-2xl font-extrabold font-display">
                {t('spinWheelTitle')}
              </h2>
              <p className="mt-3 text-sm text-indigo-200 leading-relaxed">
                {t('spinWheelSub')}
              </p>
              <div className="mt-6 p-4 rounded-xl bg-white/10 border border-white/15 text-xs text-indigo-100">
                <p className="font-semibold text-white mb-1">Clear Direct Joining Rule:</p>
                <p>{t('spinRule')}</p>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => navigate('/register')}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-indigo-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-xs"
              >
                Join to Earn Spins
              </button>
            </div>
          </div>

          {/* Withdrawal Transparency */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 font-display">
                {t('withdrawalRulesTitle')}
              </h2>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {t('withdrawalRulesSub')}
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                  <span className="font-semibold text-slate-700">{t('minWithdrawal')}</span>
                  <span className="font-black text-slate-900">{t('minWithdrawalVal')}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                  <span className="font-semibold text-slate-700">{t('feeRate')}</span>
                  <span className="font-black text-slate-900">{t('feeRateVal')}</span>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500 leading-relaxed bg-slate-100 p-3 rounded-xl">
                {t('feeExample')}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-3">
              <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                JazzCash
              </span>
              <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                EasyPaisa
              </span>
              <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                Bank Transfer
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CEO Section */}
      <CEOSection />

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Clear answers to common questions about DSN policies and operations
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs"
            >
              <h3 className="text-base font-bold text-slate-900 flex items-start gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed pl-7">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display">
            Ready to Build Your Digital Team?
          </h2>
          <p className="mt-4 text-blue-100 max-w-xl mx-auto text-base sm:text-lg">
            Join thousands advancing with Digital Success Network. Transparent rules, fair recognition, and teamwork.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 rounded-xl font-bold text-blue-900 bg-white hover:bg-slate-100 shadow-md transition-all active:scale-98"
            >
              {t('ctaJoin')}
            </button>
            <button
              onClick={() => navigate('/support')}
              className="px-6 py-3.5 rounded-xl font-bold text-white bg-blue-800/60 hover:bg-blue-800 border border-blue-400/40 transition-all"
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
