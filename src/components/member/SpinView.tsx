import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { spinService } from '../../services';
import { Gift, Sparkles, AlertCircle, History, Trophy, Award } from 'lucide-react';
import { SpinPrize } from '../../types';

export const SpinView: React.FC = () => {
  const { user, profile, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<SpinPrize | null>(null);

  if (!user || !profile) return null;

  const prizes = spinService.getPrizes();
  const history = spinService.getSpinHistory(user.id);

  const handleSpin = async () => {
    if (profile.spinCredits <= 0) {
      error('You do not have any lucky spin credits. 1 credit is awarded for every direct member activation.');
      return;
    }

    if (spinning) return;

    setSpinning(true);
    setWonPrize(null);

    // Call service to determine winning prize using weighted probability
    const result = await spinService.performSpin(user.id);
    if (!result.success || !result.prize) {
      error(result.error || 'Unable to spin wheel.');
      setSpinning(false);
      return;
    }

    const prizeIndex = prizes.findIndex(p => p.id === result.prize!.id);
    const segmentAngle = 360 / prizes.length;
    // Calculate final rotation to align segment with top indicator
    const extraRounds = 360 * 5; // 5 full rotations
    const targetAngle = extraRounds + (prizes.length - prizeIndex) * segmentAngle - segmentAngle / 2;

    setRotation(prev => prev + targetAngle);

    setTimeout(() => {
      setSpinning(false);
      setWonPrize(result.prize!);
      refreshUser();
      success(`Mubarak! You won: ${result.prize!.label}`);
    }, 4000);
  };

  const colors = [
    '#2563eb', // blue-600
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#8b5cf6', // purple-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#f97316', // orange-500
    '#6366f1'  // indigo-500
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">
          Lucky Spin Wheel
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Shafaf direct activation bonus rewards. 1 verified direct joining = 1 spin credit.
        </p>
      </div>

      {/* Main Wheel Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Visual Spin Wheel */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col items-center justify-center relative overflow-hidden">
          {/* Wheel Pointer Arrow */}
          <div className="z-20 -mb-4 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-rose-600 drop-shadow-md" />
          </div>

          {/* Rotating Wheel Container */}
          <div
            className="w-72 h-72 sm:w-80 sm:h-80 rounded-full border-8 border-slate-900 shadow-2xl relative overflow-hidden transition-all ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: spinning ? '4000ms' : '0ms',
              transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.25, 1)'
            }}
          >
            {/* SVG Segments */}
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {prizes.map((prize, index) => {
                const total = prizes.length;
                const angle = 360 / total;
                const startAngle = index * angle;
                const endAngle = startAngle + angle;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const x1 = 50 + 50 * Math.cos(startRad);
                const y1 = 50 + 50 * Math.sin(startRad);
                const x2 = 50 + 50 * Math.cos(endRad);
                const y2 = 50 + 50 * Math.sin(endRad);

                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                return (
                  <path
                    key={prize.id}
                    d={pathData}
                    fill={colors[index % colors.length]}
                    stroke="#ffffff"
                    strokeWidth="0.8"
                  />
                );
              })}
            </svg>

            {/* Labels overlay */}
            {prizes.map((prize, index) => {
              const angle = (360 / prizes.length) * index + (360 / prizes.length) / 2;
              return (
                <div
                  key={prize.id}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    transform: `rotate(${angle}deg)`
                  }}
                >
                  <span className="text-[10px] sm:text-xs font-black text-white drop-shadow-md translate-y-[-90px] sm:translate-y-[-105px] tracking-tight">
                    {prize.label}
                  </span>
                </div>
              );
            })}

            {/* Center Hub */}
            <div className="absolute inset-0 m-auto w-14 h-14 bg-slate-900 border-4 border-white rounded-full flex items-center justify-center shadow-lg z-10">
              <Gift className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          {/* Spin Trigger Button */}
          <div className="mt-8 flex flex-col items-center gap-2">
            <button
              onClick={handleSpin}
              disabled={spinning || profile.spinCredits <= 0}
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50 text-slate-950 font-black text-base rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-slate-900" />
              <span>{spinning ? 'Spinning...' : 'Spin the Wheel!'}</span>
            </button>
            <span className="text-xs text-slate-500 font-semibold">
              Available Credits:{' '}
              <strong className="text-slate-900">{profile.spinCredits}</strong>
            </span>
          </div>

          {/* Won Prize Banner */}
          {wonPrize && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center animate-in zoom-in-95">
              <span className="text-xs font-bold text-emerald-600 uppercase">Congratulations!</span>
              <p className="text-lg font-black text-emerald-950 mt-0.5">
                You won: {wonPrize.label}
              </p>
              <p className="text-xs text-emerald-700">
                The reward has been instantly credited to your account!
              </p>
            </div>
          )}
        </div>

        {/* Spin Rules & Stats */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 font-display">
              Direct Joining Rule
            </h2>
            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-950 space-y-2 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-blue-900">
                <Gift className="w-4 h-4 text-blue-600" />
                <span>1 Direct Eligible Joining = 1 Spin Credit</span>
              </p>
              <p>
                Jab bhi aapka direct refer kiya gaya member 1,000 PKR activation fee ke sath active hota hai, to foran aapko 1 lucky spin credit mil jata hai.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Possible Wheel Rewards:</p>
              <div className="grid grid-cols-2 gap-2">
                {prizes.map(p => (
                  <div key={p.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700">
                    {p.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Spin History ({history.length} spins)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Spin ID</th>
                <th className="py-3 px-4">Prize Won</th>
                <th className="py-3 px-4">Reward Value</th>
                <th className="py-3 px-4">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {item.id}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {item.prizeLabel}
                  </td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">
                    {item.rewardValue > 0 ? `+${item.rewardValue} ${item.prizeType === 'cash' ? 'PKR' : 'Pts'}` : 'Better Luck Next Time'}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-xs">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}

              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    No spin records yet. Invite direct members to earn spin credits!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
