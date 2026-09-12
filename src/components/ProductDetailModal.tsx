import React, { useState } from 'react';
import { Product } from '../types';
import { ProductImage } from './ProductImage';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Check, Phone, Mail, FileText, Sparkles } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, cart } = useCart();
  const company = useCompany();
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const cartItem = cart.find((item) => item.product.id === product.id);
  const isInCart = Boolean(cartItem);
  const isService = product.category_slug === 'services' || product.category_id === 4;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 1200);
  };

  // Format specifications into clean line items or sections
  const specLines = (product.specifications || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-[#E8F8F6] text-[#0178A2] text-xs font-bold uppercase tracking-wider">
              {product.category_name || 'Medical Supplies'}
            </span>
            {isInCart && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                In Quote Cart ({cartItem?.quantity})
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Image Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-center min-h-[260px]">
              <ProductImage
                src={product.image_url}
                alt={product.name}
                className="!h-64 sm:!h-72 w-full object-contain"
              />
            </div>

            {/* Product Overview */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <h2 id="product-detail-title" className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h2>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Quick Contact Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs text-slate-600">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0178A2]" />
                  <span>Institutional &amp; Healthcare Supply</span>
                </div>
                <div className="flex flex-col gap-1.5 pt-1">
                  <a
                    href={`tel:${company.phone}`}
                    className="flex items-center gap-2 hover:text-[#0178A2] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#0178A2]" />
                    <span>Call: {company.phone}</span>
                  </a>
                  <a
                    href={`mailto:${company.email}?subject=Quote%20Inquiry%20-%20${encodeURIComponent(product.name)}`}
                    className="flex items-center gap-2 hover:text-[#0178A2] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#0178A2]" />
                    <span>Email: {company.email}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Specifications Section */}
          {specLines.length > 0 && (
            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-[#0178A2]" />
                <span>Product Specifications &amp; Breakdown</span>
              </h3>
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-2 text-sm text-slate-700 leading-relaxed">
                {specLines.map((line, idx) => {
                  const isHeader = line.startsWith('•') || line.startsWith('-') || line.startsWith('1.') || line.includes(':');
                  return (
                    <div
                      key={idx}
                      className={`text-xs sm:text-sm ${
                        line.startsWith('•') ? 'pl-2 text-slate-800 font-medium' : 'text-slate-600'
                      }`}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Quantity Controls */}
          {!isService && (
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2.5 py-1.5 hover:bg-slate-100 text-slate-600 active:bg-slate-200 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 py-1 font-bold text-sm text-slate-900 min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-2.5 py-1.5 hover:bg-slate-100 text-slate-600 active:bg-slate-200 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Add to Quote Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:inline-flex px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0178A2] hover:bg-[#015B7A] active:scale-[0.98] text-white'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Quote Cart</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{isService ? 'Request Service Quote' : `Add ${quantity > 1 ? `(${quantity}) ` : ''}to Quote Cart`}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
