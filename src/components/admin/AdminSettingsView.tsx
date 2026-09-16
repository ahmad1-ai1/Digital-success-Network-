import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { settingsService, spinService, adminService } from '../../services';
import { Settings, Save, CheckCircle2, DollarSign, Zap, Gift, Wallet } from 'lucide-react';
import { SpinPrize } from '../../types';

export const AdminSettingsView: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const currentSettings = settingsService.getSettings();

  const [regFee, setRegFee] = useState(currentSettings.registrationFee);
  const [l1Rate, setL1Rate] = useState(currentSettings.commissionRates.level1 * 100);
  const [l2Rate, setL2Rate] = useState(currentSettings.commissionRates.level2 * 100);
  const [l3Rate, setL3Rate] = useState(currentSettings.commissionRates.level3 * 100);
  const [l4Rate, setL4Rate] = useState(currentSettings.commissionRates.level4 * 100);
  const [directPts, setDirectPts] = useState(currentSettings.pointsConfig.directActivationPoints);
  const [indirectPts, setIndirectPts] = useState(currentSettings.pointsConfig.indirectActivationPoints);
  const [minWithdrawal, setMinWithdrawal] = useState(currentSettings.withdrawalConfig.minAmount);
  const [feeRate, setFeeRate] = useState(currentSettings.withdrawalConfig.feeRate * 100);
  const [loading, setLoading] = useState(false);
  const [prizes, setPrizes] = useState<SpinPrize[]>(() => spinService.getAllPrizes());

  const handleTogglePrize = (id: string, currentActive: boolean) => {
    adminService.updateSpinPrize(id, { active: !currentActive }, user?.id);
    setPrizes(spinService.getAllPrizes());
    success('Spin prize status updated.');
  };

  const handleUpdateWeight = (id: string, weight: number) => {
    adminService.updateSpinPrize(id, { weight: Math.max(1, weight) }, user?.id);
    setPrizes(spinService.getAllPrizes());
  };

  const totalCommissionRate = l1Rate + l2Rate + l3Rate + l4Rate;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const res = settingsService.updateSettings(
      {
        registrationFee: regFee,
        commissionRates: {
          level1: l1Rate / 100,
          level2: l2Rate / 100,
          level3: l3Rate / 100,
          level4: l4Rate / 100
        },
        pointsConfig: {
          directActivationPoints: directPts,
          indirectActivationPoints: indirectPts
        },
        withdrawalConfig: {
          minAmount: minWithdrawal,
          feeRate: feeRate / 100
        }
      },
      user.id
    );
    setLoading(false);

    if (res.success) {
      success('System settings and commission policies updated successfully!');
    } else {
      error(res.error || 'Failed to update system settings.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white font-display">
          System Governance & Compensation Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure activation fee, multi-tier compensation rates, points algorithms, and payout thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Activation Fee & Commission Rates */}
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white font-display">
              Activation Fee & 4-Level Distribution
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Membership Activation Fee (PKR) *
              </label>
              <input
                type="number"
                required
                value={regFee}
                onChange={e => setRegFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Standard baseline: 1,300 PKR
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Total Network Commission Outflow
              </label>
              <div className="px-3.5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-bold text-emerald-400">
                {totalCommissionRate}% ({(regFee * totalCommissionRate) / 100} PKR per activation)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-blue-400 mb-1">
                Level 1 Rate (%) *
              </label>
              <input
                type="number"
                required
                value={l1Rate}
                onChange={e => setL1Rate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {(regFee * l1Rate) / 100} PKR payout
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-400 mb-1">
                Level 2 Rate (%) *
              </label>
              <input
                type="number"
                required
                value={l2Rate}
                onChange={e => setL2Rate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {(regFee * l2Rate) / 100} PKR payout
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-400 mb-1">
                Level 3 Rate (%) *
              </label>
              <input
                type="number"
                required
                value={l3Rate}
                onChange={e => setL3Rate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {(regFee * l3Rate) / 100} PKR payout
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-400 mb-1">
                Level 4 Rate (%) *
              </label>
              <input
                type="number"
                required
                value={l4Rate}
                onChange={e => setL4Rate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {(regFee * l4Rate) / 100} PKR payout
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Points Configuration */}
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Zap className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white font-display">
              Points Ledger Configuration
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Points per Direct Join (L1) *
              </label>
              <input
                type="number"
                required
                value={directPts}
                onChange={e => setDirectPts(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">Standard: 50 points</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Points per Indirect Team Join (L2-L4) *
              </label>
              <input
                type="number"
                required
                value={indirectPts}
                onChange={e => setIndirectPts(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">Standard: 25 points</p>
            </div>
          </div>
        </div>

        {/* Section 3: Withdrawal Policy */}
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Wallet className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white font-display">
              Withdrawal Limits & Fee Schedule
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Minimum Withdrawal Threshold (PKR) *
              </label>
              <input
                type="number"
                required
                value={minWithdrawal}
                onChange={e => setMinWithdrawal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">Default minimum: 20 PKR</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Withdrawal Processing Fee (%) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={feeRate}
                onChange={e => setFeeRate(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">Default fee: 2%</p>
            </div>
          </div>
        </div>

        {/* Section 4: Spin Wheel Prize Pool & Weights */}
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Gift className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white font-display">
              Lucky Spin Wheel Prize Pool & Probability Weights
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {prizes.map(p => (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all ${
                  p.active ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-900/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-xs font-bold text-white">{p.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePrize(p.id, p.active)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-lg cursor-pointer ${
                      p.active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.active ? 'Active' : 'Disabled'}
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                  <span>Type: <strong className="text-slate-200 capitalize">{p.type}</strong></span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]">Weight:</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={p.weight}
                      onChange={e => handleUpdateWeight(p.id, Number(e.target.value))}
                      className="w-14 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving Settings...' : 'Save Configuration Changes'}</span>
        </button>
      </form>
    </div>
  );
};
