import React from 'react';
import { Award, ShieldCheck, Sparkles } from 'lucide-react';

interface CEOSectionProps {
  className?: string;
}

export const CEOSection: React.FC<CEOSectionProps> = ({ className = '' }) => {
  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-14 shadow-xl border border-slate-700/60 overflow-hidden relative">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* CEO Photo */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm w-full">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-3xl blur-sm opacity-40 group-hover:opacity-70 transition duration-300" />
              <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-slate-800 border-2 border-slate-700/80 shadow-2xl">
                <img
                  src="/ceo-khizer-ghafoor.jpeg"
                  alt="Khizer Ghafoor — Chief Executive Officer"
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.src.includes('WhatsApp')) {
                      target.src = '/WhatsApp Image 2026-09-15 at 8.59.01 PM.jpeg';
                    }
                  }}
                />
              </div>
              <div className="mt-3 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Executive Leadership</span>
                </span>
              </div>
            </div>
          </div>

          {/* CEO Bio & Information */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Leadership Vision</span>
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white">
                Khizer Ghafoor
              </h2>
              <p className="text-emerald-400 font-bold text-base sm:text-lg mt-1.5">
                Chief Executive Officer — Digital Success Network
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-slate-200 text-base sm:text-lg leading-relaxed italic">
                “Focused on building a structured digital network where teamwork, transparency, and collective growth come together.”
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-left">
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Transparent Rules</span>
                </div>
                <p className="text-xs text-slate-300">
                  Shafaf commission structure aur wazeh rules jo har fard ke haq ki hifazat karte hain.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-left">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Teamwork First</span>
                </div>
                <p className="text-xs text-slate-300">
                  “Team Se Taraqqi Tak” — Istemai koshish aur mushtarka taraqqi par mustahkam buniyaad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
