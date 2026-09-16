import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { Target, Users, ShieldCheck, HeartHandshake, Award, Compass, ArrowRight } from 'lucide-react';
import { CEOSection } from '../common/CEOSection';

export const AboutPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { navigate } = useNavigation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Hamare Baare Mein
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-3 font-display">
          Digital Success Network
        </h1>
        <p className="text-xl font-bold text-emerald-600 mt-2">
          “Team Se Taraqqi Tak”
        </p>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          {language === 'roman_urdu'
            ? 'DSN ka bunyadi maqsad naujawano aur mehnatkash afrad ko ek musbat, shafaf aur mutaharrik platform muhayya karna hai jahan cooperative teamwork ke zariye har fard taraqqi ki rah par aagey barh sakay.'
            : 'Digital Success Network is founded on the principles of transparent collaboration, structured network progression, and equitable recognition for every dedicated member.'}
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-display">Hamara Vision (Our Vision)</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Ek aisi ba-shaoor aur mutamad digital community qaim karna jahan shafafiyat (transparency), mehnat aur ba-himi imdad ko tarjeeh di jaye. Hum afrad ko digital networking ke usoolon par mustahkam bananay ke khawahan hain.
          </p>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-display">Hamara Mission (Our Mission)</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Char-darja (4-Level) shafaf commission structure, mustaqil points ledger aur multi-tier rank system ke zariye afrad ko mustaqil buniyaadon par aagay barhana aur unki mehnat ka fori sila faraham karna.
          </p>
        </div>
      </div>

      {/* CEO Leadership Section */}
      <CEOSection className="!px-0" />

      {/* Core Principles */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            Hamare Bunyadi Usool (Core Values)
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Har fesla aur har rule shafafiyat aur tehqeeqi buniyaadon par mustahkam hai.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <ShieldCheck className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">100% Shafaf Rules</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Koi chupa hua charges ya gher-haqeeqi waaday nahi. Commission, points aur fees pehle din se wazeh hain.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <Users className="w-8 h-8 text-emerald-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Teamwork & Istemai Taraqqi</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              DSN kisi ek fard ki kamai ka naam nahi, balkay poori team ki mushtarka jadojehed ka nateeja hai.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <Award className="w-8 h-8 text-amber-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Haqeeqi Qadardani</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Starter se lekar Crown tak har rank par member ki koshishon ko points ke zariye tasleem kiya jata hai.
            </p>
          </div>
        </div>
      </div>

      {/* Join Callout */}
      <div className="p-8 sm:p-12 bg-slate-900 text-white rounded-3xl text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
          Aap Bhi DSN Karwan Ka Hissa Banein
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          DSN ke shafaf nizam se faida uthayein aur apni team bana kar mustaqbil ko roshan karein.
        </p>
        <button
          onClick={() => navigate('/register')}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition-all"
        >
          <span>Naya Account Banayein</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
