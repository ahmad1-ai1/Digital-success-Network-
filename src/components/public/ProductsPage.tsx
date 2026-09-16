import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { Package, Clock, Sparkles, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import { productService } from '../../services';

export const ProductsPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { navigate } = useNavigation();
  const products = productService.getProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Catalog Architecture
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-3 font-display">
          Products & Services
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600">
          Official Digital Services & Learning Resources
        </p>
      </div>

      {/* Prominent Coming Soon Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-10 sm:p-16 text-center border border-slate-800 shadow-xl max-w-4xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center mx-auto mb-6 text-blue-400">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight">
          Products & Services — Coming Soon
        </h2>

        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          {language === 'roman_urdu'
            ? 'DSN ka mukammal digital curriculum, skill enhancement courses aur value-added services jald launch ki ja rahi hain. Hamara catalog architecture tayar hai aur Admin portal ke zariye control kiya jaye ga.'
            : 'The official digital courses, certifications, and product bundles are currently in development. The backend-ready product catalog architecture is active and ready for central management.'}
        </p>

        <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-2xl mx-auto text-xs text-slate-400">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-white block mb-1">Catalog Schema</span>
            <p>id, name, slug, description, image, category, price, status</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-white block mb-1">Admin Controlled</span>
            <p>Full CRUD operations supported via central administration</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-white block mb-1">No Speculative Pricing</span>
            <p>Accurate prices will appear once officially released</p>
          </div>
        </div>

        <div className="mt-10">
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-3 rounded-xl font-bold text-sm text-slate-900 bg-white hover:bg-slate-100 transition-all shadow-md"
          >
            Join Network Pre-Launch
          </button>
        </div>
      </div>

      {/* If products ever added by admin, show them here */}
      {products.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Current Catalog Entries:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
              <div key={p.id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {p.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">{p.name}</h3>
                <p className="text-xs text-slate-600 mt-1">{p.description}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span>PKR {p.price}</span>
                  <span className="capitalize text-emerald-600">{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
