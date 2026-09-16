import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Mail, MessageSquare, Phone, Send, CheckCircle2, Clock, HelpCircle } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'activation',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      error('Please fill in all required fields.');
      return;
    }
    setSubmitted(true);
    success('Your inquiry has been submitted! Support team will respond within 24 hours.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Madad & Rabta
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-3 font-display">
          Support & Help Center
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600">
          Hamari support team aapki rehnumai aur sawalat ke jawabat ke liye hazir hai.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
        {/* Contact Info Col */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900 font-display">Rabtay Ke Zariye</h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Email Support</p>
                  <p className="text-slate-500 text-xs mt-0.5">support@digitalsuccessnetwork.pk</p>
                  <p className="text-slate-400 text-[11px]">Jawab ka waqt: 24 ghantay ke andar</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Official WhatsApp Helpdesk</p>
                  <p className="text-slate-500 text-xs mt-0.5">Member Support Desk</p>
                  <p className="text-slate-400 text-[11px]">Subah 10:00 AM se Shaam 7:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Operational Hours</p>
                  <p className="text-slate-500 text-xs mt-0.5">Monday to Saturday</p>
                  <p className="text-slate-400 text-[11px]">Sunday: Automated ticketing only</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-900 mb-1">Notice for Members:</p>
              Withdrawal status ya payment proof ke hawale se rabta karte waqt apna Registered Email aur Transaction Reference lazmi darj karein.
            </div>
          </div>
        </div>

        {/* Contact Form Col */}
        <div className="lg:col-span-7">
          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 font-display mb-6">
              Inquiry / Ticket Form
            </h2>

            {submitted ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-950">Inquiry Received!</h3>
                <p className="text-sm text-emerald-800 max-w-md mx-auto">
                  Shukriya, {formData.name}. Aapka ticket submit ho chuka hai. Hamari support team foran janch ke baad aapke email par rabta karegi.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', category: 'activation', message: '' });
                  }}
                  className="px-5 py-2 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 rounded-xl hover:bg-emerald-100"
                >
                  Naya Sawal Bhejein
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Poora Naam *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Mehmood"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone / WhatsApp No.
                    </label>
                    <input
                      type="text"
                      placeholder="03001234567"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    >
                      <option value="activation">Account Activation & Payment</option>
                      <option value="commission">Commission & Points Ledger</option>
                      <option value="withdrawal">Withdrawal Inquiries</option>
                      <option value="kyc">CNIC / KYC Verification</option>
                      <option value="general">General Support</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tafseel (Message) *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Apna masla ya sawal wazeh alfaz mein darj karein..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
