import React, { useState, useMemo } from 'react';
import { Product, Category, PageId } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { Search, SlidersHorizontal, PackageOpen, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductsPageProps {
  products: Product[];
  categories: Category[];
  initialCategorySlug?: string;
  onNavigate: (page: PageId) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  categories,
  initialCategorySlug = 'all',
  onNavigate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const { totalItemCount } = useCart();

  // Filter and sort products (alphabetical by name)
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all') {
          if (p.category_slug !== selectedCategory) return false;
        }
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchCat = p.category_name?.toLowerCase().includes(q);
          return matchName || matchDesc || matchCat;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      {modalProduct && (
        <ProductDetailModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0178A2]">
            Comprehensive Inventory
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1">
            Product &amp; Supply Catalog
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
            Browse our full range of certified medical equipment, clinical consumables, protective wear, general supplies, and procurement services.
          </p>
        </div>

        {totalItemCount > 0 && (
          <button
            type="button"
            onClick={() => onNavigate('quote-cart')}
            className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-[#0178A2] hover:bg-[#015B7A] text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Review Quote Cart ({totalItemCount})</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          <button
            type="button"
            id="cat-pill-all"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#0178A2] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            All Items ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter(p => p.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                id={`cat-pill-${cat.slug}`}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#0178A2] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="product-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equipment, PPE, kits..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0178A2] text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenSpecsModal={(p) => setModalProduct(p)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto text-slate-500 mb-4">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No products found</h3>
          <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
            We couldn't find any products matching "{searchQuery}". Try selecting another category or clear your search.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#0178A2] text-white text-xs font-bold hover:bg-[#015B7A] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
