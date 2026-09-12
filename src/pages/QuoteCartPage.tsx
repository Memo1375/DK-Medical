import React, { useState } from 'react';
import { PageId, CustomerFormData } from '../types';
import { useCart } from '../context/CartContext';
import { useCompany } from '../context/CompanyContext';
import { ProductImage } from '../components/ProductImage';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Send,
  Loader2,
  AlertCircle,
  ShoppingBag,
  ShieldCheck,
  Phone,
  Mail,
  User,
  Building,
  MessageSquare
} from 'lucide-react';

interface QuoteCartPageProps {
  onNavigate: (page: PageId) => void;
  onQuoteSubmitted: (quoteReference: string) => void;
}

export const QuoteCartPage: React.FC<QuoteCartPageProps> = ({
  onNavigate,
  onQuoteSubmitted
}) => {
  const { cart, updateQuantity, removeFromCart, clearCart, totalItemCount } = useCart();
  const company = useCompany();

  const [formData, setFormData] = useState<CustomerFormData>({
    first_name: '',
    surname: '',
    company: '',
    email: '',
    phone: '',
    comment: ''
  });

  const [honeypot, setHoneypot] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Check cart items
    if (cart.length === 0) {
      setErrorMessage('Please add at least one product to your quote request before submitting.');
      return;
    }

    // 2. Validate form fields
    if (!formData.first_name.trim() || !formData.surname.trim()) {
      setErrorMessage('Please provide your First Name and Surname.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!formData.phone.trim() || formData.phone.trim().length < 6) {
      setErrorMessage('Please enter a valid cell phone contact number.');
      return;
    }

    // 3. Submit to server API
    setSubmitting(true);

    try {
      const payload = {
        first_name: formData.first_name.trim(),
        surname: formData.surname.trim(),
        company: formData.company?.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        comment: formData.comment?.trim(),
        hp_field: honeypot, // Honeypot
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      };

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit quote enquiry. Please try again.');
      }

      // Success! Clear cart and notify parent to display modal
      clearCart();
      onQuoteSubmitted(data.quote_reference);

    } catch (err: any) {
      console.error('Quote submission error:', err);
      setErrorMessage(err.message || 'We were unable to submit your enquiry at this time. Please try again or contact DK Medical directly.');
    } finally {
      setSubmitting(false);
    }
  };

  // If Cart is Empty
  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#E6F3F7] text-[#0178A2] flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Your Quote Cart is Empty
          </h1>
          <p className="mt-3 text-slate-600 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            You have not added any medical supplies or services to your quotation list yet. Browse our full catalog to select items.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-[#0178A2] hover:bg-[#015B7A] text-white transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Explore Products Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              <span>General Enquiry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0178A2]">
            Quote Request System
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Review Your Quote Request
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review your selected products and provide your details to receive an official formal quote.
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Items</span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <div className="text-sm font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Selected Products ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="text-xs font-bold text-[#0178A2] hover:text-[#015B7A]"
              >
                + Add More Products
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  id={`cart-item-${product.id}`}
                  className="p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                    <ProductImage
                      src={product.image_url}
                      alt={product.name}
                      className="!h-16 sm:!h-20"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[11px] font-bold text-[#0178A2] uppercase tracking-wide">
                      {product.category_name || 'Medical Supply'}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {product.description}
                    </p>

                    {/* Quantity Selector */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-slate-900 min-w-[28px] text-center">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        className="text-xs text-slate-400 hover:text-rose-600 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#E6F3F7]/60 border border-[#0178A2]/20 text-xs text-slate-700 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-[#0178A2]" />
            <span>
              All quotes are formal and non-binding. Our sales agents confirm stock availability, delivery lead-times, and volume discounts.
            </span>
          </div>
        </div>

        {/* Right Column: Customer Details Form */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Customer Information
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Fill in your contact details below to receive your customized quotation document.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Anti-spam Honeypot Field (Hidden from normal users) */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="hp_field"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* First Name & Surname */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="first_name" className="block text-xs font-bold text-slate-700 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      required
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Sipho"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0178A2] text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="surname" className="block text-xs font-bold text-slate-700 mb-1">
                    Surname <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="surname"
                    name="surname"
                    required
                    value={formData.surname}
                    onChange={handleInputChange}
                    placeholder="e.g. Dlamini"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0178A2] text-slate-900"
                  />
                </div>
              </div>

              {/* Company / Institution */}
              <div>
                <label htmlFor="company" className="block text-xs font-bold text-slate-700 mb-1">
                  Company / Hospital / Practice <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g. City Health Clinic"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0178A2] text-slate-900"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@organization.co.za"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0178A2] text-slate-900"
                  />
                </div>
              </div>

              {/* Cell Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1">
                  Cell Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 082 123 4567"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0178A2] text-slate-900"
                  />
                </div>
              </div>

              {/* Comment / Specific Requirements */}
              <div>
                <label htmlFor="comment" className="block text-xs font-bold text-slate-700 mb-1">
                  Comment / Delivery Address / Specific Requirements <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <textarea
                    id="comment"
                    name="comment"
                    rows={3}
                    value={formData.comment}
                    onChange={handleInputChange}
                    placeholder="Add delivery location, urgent timelines, or technical specifications..."
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0178A2] text-slate-900 resize-y"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="submit-quote-btn"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-[#0178A2] hover:bg-[#015B7A] disabled:bg-slate-300 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Quote Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Quote Request</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                By submitting this request, you agree to receive a quotation from DK Medical &amp; General Supplies.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
