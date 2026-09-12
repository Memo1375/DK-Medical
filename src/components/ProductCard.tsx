import React, { useState } from 'react';
import { Product } from '../types';
import { ProductImage } from './ProductImage';
import { useCart } from '../context/CartContext';
import { Plus, Check, Info, ZoomIn } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenSpecsModal?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenSpecsModal }) => {
  const { addToCart, cart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);

  const cartItem = cart.find(item => item.product.id === product.id);
  const isInCart = Boolean(cartItem);
  const isService = product.category_slug === 'services' || product.category_id === 4;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleCardClick = () => {
    if (onOpenSpecsModal) {
      onOpenSpecsModal(product);
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden group cursor-pointer"
    >
      {/* Product Image Box */}
      <div className="p-4 pb-0 relative">
        <ProductImage src={product.image_url} alt={product.name} />
        {onOpenSpecsModal && (
          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs p-1.5 rounded-lg shadow-sm border border-slate-200 text-[#0178A2]">
            <ZoomIn className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Pill & In-Cart Badge */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F8F6] text-[#0178A2]">
              {product.category_name || 'Medical Supply'}
            </span>
            {isInCart && (
              <span className="text-[11px] font-bold text-[#0178A2] bg-[#E6F3F7] px-2 py-0.5 rounded-md border border-[#0178A2]/20">
                In Quote Cart ({cartItem?.quantity})
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0178A2] transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
            {product.description}
          </p>

          {/* Specifications Accordion / Toggle */}
          <div className="mt-3 pt-3 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => {
                if (onOpenSpecsModal) {
                  onOpenSpecsModal(product);
                } else {
                  setShowSpecs(!showSpecs);
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0178A2] hover:text-[#4EC2B5] transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>View Full Specs &amp; Infographic</span>
            </button>
            {showSpecs && !onOpenSpecsModal && (
              <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {product.specifications || 'Specifications available on request.'}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-3" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            id={`btn-add-quote-${product.id}`}
            onClick={handleAdd}
            className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
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
                <span>{isService ? 'Enquire About This Service' : 'Add to Cart for Quote'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
