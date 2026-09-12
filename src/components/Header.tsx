import React, { useState, useEffect } from 'react';
import { PageId } from '../types';
import { useCart } from '../context/CartContext';
import { useCompany } from '../context/CompanyContext';
import { DkLogo } from './DkLogo';
import { Menu, X, ShoppingBag, PhoneCall, Mail } from 'lucide-react';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const { totalItemCount } = useCart();
  const company = useCompany();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'products', label: 'Products' },
    { id: 'contact', label: 'Contact Us' },
    { id: 'quote-cart', label: `Quote Cart${totalItemCount > 0 ? ` (${totalItemCount})` : ' (0)'}` },
  ];

  const handleNavClick = (id: PageId) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Utility Bar with Quick Contact */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-200">South African Medical &amp; General Supplies</span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-[#4EC2B5]">Serving Hospitals, Clinics, Corporates &amp; Private Clients</span>
          </div>
          <div className="flex items-center gap-4 font-medium">
            <a
              href={company.phoneTelLink}
              id="header-top-phone"
              className="inline-flex items-center gap-1.5 hover:text-[#4EC2B5] transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#4EC2B5]" />
              <span>{company.phone}</span>
            </a>
            <a
              href={company.emailMailto}
              id="header-top-email"
              className="inline-flex items-center gap-1.5 hover:text-[#4EC2B5] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#4EC2B5]" />
              <span>{company.email}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation */}
      <header
        id="main-header"
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-all duration-200 border-b ${
          isScrolled ? 'border-slate-200 shadow-sm py-2.5' : 'border-slate-100 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          {/* Logo on Left */}
          <button
            type="button"
            id="brand-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0178A2] rounded-lg p-1 transition-all"
            aria-label="DK Medical & General Supplies - Home"
          >
            <div className="flex items-center">
              <DkLogo className="h-10 sm:h-12 w-auto max-w-[200px] sm:max-w-[240px] transition-transform duration-200 group-hover:scale-[1.02]" />
            </div>
            <div className="hidden xl:block border-l border-slate-200 pl-3">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Medical &amp; General Supplies
              </span>
              <span className="block text-xs font-semibold text-[#0178A2]">
                Trusted South African Supplier
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              const isCart = item.id === 'quote-cart';

              if (isCart) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    id="nav-quote-cart"
                    onClick={() => handleNavClick(item.id)}
                    className={`ml-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-150 flex items-center gap-2 ${
                      isActive
                        ? 'bg-[#0178A2] text-white shadow-sm'
                        : totalItemCount > 0
                        ? 'bg-[#E6F3F7] text-[#0178A2] hover:bg-[#0178A2] hover:text-white border border-[#0178A2]/30'
                        : 'text-slate-700 hover:text-[#0178A2] hover:bg-slate-100'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{item.label}</span>
                    {totalItemCount > 0 && (
                      <span className={`w-5 h-5 rounded-full text-xs font-extrabold flex items-center justify-center ${
                        isActive ? 'bg-[#E3111D] text-white' : 'bg-[#E3111D] text-white'
                      }`}>
                        {totalItemCount}
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 relative ${
                    isActive
                      ? 'text-[#0178A2] font-bold bg-[#E6F3F7]'
                      : 'text-slate-700 hover:text-[#0178A2] hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#0178A2] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Quick Cart Pill for Mobile */}
            <button
              type="button"
              id="mobile-quick-cart"
              onClick={() => handleNavClick('quote-cart')}
              className={`p-2 rounded-lg border flex items-center gap-1.5 text-xs font-bold ${
                currentPage === 'quote-cart'
                  ? 'bg-[#0178A2] text-white border-[#0178A2]'
                  : 'bg-slate-100 text-slate-800 border-slate-200'
              }`}
              aria-label="View Quote Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#0178A2]" />
              <span>{totalItemCount}</span>
            </button>

            <button
              type="button"
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0178A2]"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu-drawer"
            className="md:hidden bg-white border-b border-slate-200 shadow-xl px-4 py-4 space-y-1 animate-in slide-in-from-top-2"
          >
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              const isCart = item.id === 'quote-cart';

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`mobile-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-base flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-[#0178A2] text-white'
                      : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {isCart && <ShoppingBag className="w-5 h-5" />}
                    {item.label}
                  </span>
                  {isCart && totalItemCount > 0 && (
                    <span className="bg-[#E3111D] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {totalItemCount} items
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Contact within mobile menu */}
            <div className="pt-4 mt-2 border-t border-slate-100 space-y-2 text-sm text-slate-600">
              <a
                href={company.phoneTelLink}
                className="flex items-center gap-3 px-4 py-2 font-medium text-[#0178A2] hover:bg-slate-50 rounded-lg"
              >
                <PhoneCall className="w-4 h-4 text-[#4EC2B5]" />
                <span>Call: {company.phone}</span>
              </a>
              <a
                href={company.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 font-medium text-emerald-700 hover:bg-slate-50 rounded-lg"
              >
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">W</span>
                <span>WhatsApp: {company.whatsapp}</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
