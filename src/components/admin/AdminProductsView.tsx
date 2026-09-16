import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { productService } from '../../services';
import { Package, Plus, CheckCircle2, Clock, DollarSign, BookOpen, Layers } from 'lucide-react';
import { Product } from '../../types';

export const AdminProductsView: React.FC = () => {
  const { success } = useToast();
  const [products, setProducts] = useState<Product[]>(productService.getAllProducts());
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(1500);
  const [category, setCategory] = useState<'course' | 'bundle' | 'tool'>('course');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const handleToggle = (prodId: string) => {
    const updated = products.map(p => {
      if (p.id === prodId) return { ...p, isActive: !p.isActive };
      return p;
    });
    setProducts(updated);
    success('Product status updated.');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      title,
      description,
      price,
      currency: 'PKR',
      category,
      level,
      modulesCount: 8,
      durationHours: 12,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
      createdAt: new Date().toISOString()
    };
    setProducts([newProd, ...products]);
    setShowAddModal(false);
    setTitle('');
    setDescription('');
    success(`Course "${title}" created successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-display">
            Digital Products & Skill Academy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage educational video courses, toolkits, and training packages.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Grid of Products */}
      {products.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-display">Products & Services Catalog</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Digital Products and Services catalog remains Coming Soon. No active courses or toolkits have been published yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <div
              key={p.id}
              className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="h-44 relative bg-slate-900 overflow-hidden">
                  <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        p.isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                    {p.category} • {p.level}
                  </span>
                  <h3 className="text-base font-bold text-white font-display line-clamp-1">{p.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                </div>
              </div>

              <div className="p-5 border-t border-slate-900 flex items-center justify-between">
                <span className="text-base font-black text-emerald-400">
                  {p.price.toLocaleString()} PKR
                </span>
                <button
                  onClick={() => handleToggle(p.id)}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-colors ${
                    p.isActive
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {p.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <h2 className="text-base font-bold text-white font-display">Add Digital Product</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="course">Course</option>
                    <option value="bundle">Bundle</option>
                    <option value="tool">Tool</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
