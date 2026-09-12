import React, { useState, useEffect } from 'react';
import { PageId, Product, Category } from './types';
import { CartProvider } from './context/CartContext';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SuccessModal } from './components/SuccessModal';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProductsPage } from './pages/ProductsPage';
import { QuoteCartPage } from './pages/QuoteCartPage';
import { ContactPage } from './pages/ContactPage';
import { MessageSquare, ArrowUp } from 'lucide-react';

const MainApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [initialCategorySlug, setInitialCategorySlug] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Success Modal State
  const [submittedQuoteRef, setSubmittedQuoteRef] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  const company = useCompany();

  // Fetch Products & Categories
  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products').then(r => r.json()),
          fetch('/api/categories').then(r => r.json())
        ]);

        if (prodRes.success && prodRes.products) {
          setProducts(prodRes.products);
        }
        if (catRes.success && catRes.categories) {
          setCategories(catRes.categories);
        }
      } catch (err) {
        console.warn('Failed to load API data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Track scroll position for Back to Top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (page: PageId, categoryFilter?: string) => {
    if (categoryFilter) {
      setInitialCategorySlug(categoryFilter);
    } else if (page === 'products') {
      setInitialCategorySlug('all');
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuoteSubmitted = (quoteRef: string) => {
    setSubmittedQuoteRef(quoteRef);
    setShowSuccessModal(true);
  };

  const handleGoHome = () => {
    setShowSuccessModal(false);
    handleNavigate('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[#4EC2B5] selection:text-slate-900 font-sans">
      {/* Header */}
      <Header currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content View */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            featuredProducts={products}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'products' && (
          <ProductsPage
            products={products}
            categories={categories}
            initialCategorySlug={initialCategorySlug}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'quote-cart' && (
          <QuoteCartPage
            onNavigate={handleNavigate}
            onQuoteSubmitted={handleQuoteSubmitted}
          />
        )}

        {currentPage === 'contact' && (
          <ContactPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        quoteReference={submittedQuoteRef || ''}
        onClose={() => setShowSuccessModal(false)}
        onGoHome={handleGoHome}
      />

      {/* Floating Instant WhatsApp Button */}
      <a
        href={company.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="floating-whatsapp-btn"
        className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
        aria-label="Chat with DK Medical on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <MessageSquare className="w-6 h-6 fill-current" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 text-xs font-bold transition-all duration-300 ease-in-out">
          WhatsApp Support
        </span>
      </a>

      {/* Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          id="scroll-to-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-6 z-40 bg-slate-900/80 hover:bg-slate-900 text-white p-3 rounded-full shadow-md backdrop-blur-xs transition-all duration-200 focus:outline-none"
          aria-label="Scroll back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default function App() {
  return (
    <CompanyProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </CompanyProvider>
  );
}
