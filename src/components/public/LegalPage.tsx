import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { ShieldCheck, FileText, Lock, RotateCcw, Award, AlertCircle } from 'lucide-react';

export const LegalPage: React.FC = () => {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'refund' | 'commissions'>('terms');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Qawaneen & Policy
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-3 font-display">
          Transparency & Legal Framework
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600">
          DSN operates under strict transparency, responsible member conduct, and clear financial accountability.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab('terms')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'terms'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Terms & Conditions</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'privacy'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Privacy Policy</span>
        </button>

        <button
          onClick={() => setActiveTab('refund')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'refund'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Refund Policy</span>
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'commissions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Commission Rules</span>
        </button>
      </div>

      {/* Content Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-8 sm:p-12 max-w-4xl mx-auto">
        {/* Terms Tab */}
        {activeTab === 'terms' && (
          <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
            <h2 className="text-2xl font-bold text-slate-900 font-display">1. Terms of Service & Membership</h2>
            <p>
              By registering an account with Digital Success Network (DSN), you agree to comply with all community policies, referral conduct guidelines, and legal prerequisites defined herein.
            </p>

            <h3 className="text-base font-bold text-slate-900">1.1 Eligibility & Single Account Rule</h3>
            <p>
              Members must be at least 18 years of age with a valid National Identity Card (CNIC) or official government ID. Multiple accounts registered by the same individual under fake credentials or circular referral loops are strictly prohibited and subject to immediate suspension.
            </p>

            <h3 className="text-base font-bold text-slate-900">1.2 Activation Prerequisite</h3>
            <p>
              Mere user registration does not grant active status or trigger upline compensation. An account becomes fully active only upon verified receipt of the designated activation fee.
            </p>

            <h3 className="text-base font-bold text-slate-900">1.3 No Earnings Guarantee</h3>
            <p>
              DSN does NOT offer fixed return on investment (ROI), passive guaranteed yields, or financial schemes. All commissions and points are solely derived from legitimate network expansion and eligible team activation activity.
            </p>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
            <h2 className="text-2xl font-bold text-slate-900 font-display">2. Privacy & Data Handling Policy</h2>
            <p>
              At DSN, protecting your personal identifiable information (PII) is a paramount operational standard.
            </p>

            <h3 className="text-base font-bold text-slate-900">2.1 Information Collected</h3>
            <p>
              We collect your full legal name, phone number, email address, transaction identifiers for payment verification, and CNIC documentation solely for KYC compliance.
            </p>

            <h3 className="text-base font-bold text-slate-900">2.2 Confidentiality & Third-Party Sharing</h3>
            <p>
              DSN will never sell, rent, or lease member data to external advertisers or unsolicited third parties. Data is utilized exclusively for account authentication, commission distribution, and administrative validation.
            </p>
          </div>
        )}

        {/* Refund Tab */}
        {activeTab === 'refund' && (
          <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
            <h2 className="text-2xl font-bold text-slate-900 font-display">3. Refund & Cancellation Policy</h2>
            <p>
              We prioritize complete operational honesty regarding financial transactions.
            </p>

            <h3 className="text-base font-bold text-slate-900">3.1 Activation Fees</h3>
            <p>
              Once a payment proof is approved and the multi-tier commissions and points have been credited to upline sponsors, activation fees become non-refundable due to real-time distribution across the network.
            </p>

            <h3 className="text-base font-bold text-slate-900">3.2 Rejected Submissions</h3>
            <p>
              If a payment proof is rejected or transaction mismatch occurs, the user may re-submit a valid receipt or contact central operations for dispute resolution within 7 business days.
            </p>
          </div>
        )}

        {/* Commission Tab */}
        {activeTab === 'commissions' && (
          <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
            <h2 className="text-2xl font-bold text-slate-900 font-display">4. Commission & Reward Governance</h2>
            <p>
              All commissions, points, and spin awards are determined by deterministic business logic.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">Approved Commission Matrix:</h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>• <strong>Level 1 (Direct Sponsor):</strong> 20% commission + 50 points + 1 Lucky Spin Credit</li>
                <li>• <strong>Level 2 (Indirect Sponsor):</strong> 10% commission + 25 points</li>
                <li>• <strong>Level 3 (Indirect Sponsor):</strong> 5% commission + 25 points</li>
                <li>• <strong>Level 4 (Indirect Sponsor):</strong> 3% commission + 25 points</li>
              </ul>
            </div>

            <h3 className="text-base font-bold text-slate-900">4.1 Withdrawal Rules</h3>
            <p>
              The minimum withdrawal amount is 20 PKR. Each withdrawal is subject to a 2% processing fee (e.g. 1,000 PKR gross = 20 PKR fee + 980 PKR net). Withdrawals are unlimited with no daily, weekly, or monthly withdrawal-count limit. Members must maintain accurate payment details (JazzCash, EasyPaisa, or Bank Account).
            </p>
          </div>
        )}

        {/* Responsible Disclaimer */}
        <div className="mt-8 pt-8 border-t border-slate-200 bg-amber-50/60 p-5 rounded-2xl border border-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>Mandatory Compliance Notice:</strong> Digital Success Network is not an investment fund, mutual fund, or deposit-taking institution. Financial gains are purely a direct consequence of bona-fide organizational performance, referral building, and team development.
          </p>
        </div>
      </div>
    </div>
  );
};
