import React, { useState } from 'react';
import { PageId, Product } from '../types';
import { useCompany } from '../context/CompanyContext';
import { EcgWatermark } from '../components/EcgWatermark';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import {
  ShieldCheck,
  Truck,
  FileCheck,
  Headphones,
  ArrowRight,
  Stethoscope,
  Package,
  Layers,
  Award,
  PhoneCall,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: PageId, categoryFilter?: string) => void;
  featuredProducts: Product[];
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, featuredProducts }) => {
  const company = useCompany();
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {modalProduct && (
        <ProductDetailModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-b from-[#E6F3F7] via-white to-white overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-slate-100">
        {/* Subtle ECG pulse line moving in background */}
        <EcgWatermark opacity={0.12} className="top-1/2 -translate-y-1/2" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl">
            {/* Sector Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#4EC2B5]/40 shadow-xs mb-6 text-xs font-bold text-[#0178A2]">
              <Sparkles className="w-3.5 h-3.5 text-[#4EC2B5]" />
              <span>South African Medical &amp; General Supplies</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Quality Medical &amp; <br />
              <span className="text-[#0178A2]">General Supplies</span> for Healthcare &amp; Industry.
            </h1>

            {/* Sub-copy */}
            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              From precision diagnostic equipment, sterile consumables, and certified PPE to comprehensive first aid kits and general operational supplies — DK Medical delivers reliability and compliance across South Africa.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                id="hero-browse-btn"
                onClick={() => onNavigate('products')}
                className="px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-[#0178A2] hover:bg-[#015B7A] text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span>Browse Product Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="hero-quote-btn"
                onClick={() => onNavigate('quote-cart')}
                className="px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-white hover:bg-slate-50 text-[#0178A2] border-2 border-[#0178A2] shadow-xs transition-all"
              >
                <span>Request Custom Quote</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4EC2B5]" />
                <span>Certified Medical Supplies</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#4EC2B5]" />
                <span>Nationwide SA Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#4EC2B5]" />
                <span>Tender &amp; Bulk Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Four Core Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Why Choose DK Medical &amp; General Supplies?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Committed to supporting clinics, hospitals, emergency responders, and enterprise clients with dependable procurement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#E6F3F7] text-[#0178A2] flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Hospital-Grade Standards</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every medical device, consumable, and piece of PPE conforms to stringent safety standards and clinical reliability.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#E8F8F6] text-[#4EC2B5] flex items-center justify-center mb-4">
              <Truck className="w-6 h-6 text-[#3BA497]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">All 9 SA Provinces</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Expedited, trackable logistics to Gauteng, Western Cape, KwaZulu-Natal, Eastern Cape, and all outlying regions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#FDE8E9] text-[#E3111D] flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Bulk &amp; Tender Supply</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tailored volume quotes and institutional supply agreements for corporate wellness, private clinics, and government bids.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
              <Headphones className="w-6 h-6 text-[#0178A2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Dedicated Advisory</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Direct access to knowledgeable product specialists ready to answer technical queries and source custom requirements.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Category Explorations */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0178A2]">
                Our Product Offerings
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Explore Core Categories
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0178A2] hover:text-[#015B7A] transition-colors"
            >
              <span>View Full 28-Item Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cat 1: Medical Equipment */}
            <div
              onClick={() => onNavigate('products', 'medical-equipment')}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E6F3F7] text-[#0178A2] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0178A2] transition-colors">
                  Medical Equipment
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Blood Pressure Monitors, Medical Scales, Nebulisers, Pulse Oximeters, and Infrared Thermometers.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-xs font-bold text-[#0178A2]">
                <span>Browse Equipment</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Cat 2: Medical Consumables */}
            <div
              onClick={() => onNavigate('products', 'medical-consumables')}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E8F8F6] text-[#4EC2B5] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6 text-[#3BA497]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0178A2] transition-colors">
                  Medical Consumables
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  First Aid Kits, Burn Kits, Trauma Kits, Gloves, Syringes, Gauze, Gowns, Face Shields, and Sanitizers.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-xs font-bold text-[#0178A2]">
                <span>Browse Consumables</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Cat 3: General Supplies */}
            <div
              onClick={() => onNavigate('products', 'general-supplies')}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0178A2] transition-colors">
                  General Supplies
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Office Supplies, Industrial Packaging Materials, and Healthcare Stationery.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-xs font-bold text-[#0178A2]">
                <span>Browse General Supplies</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Cat 4: Services */}
            <div
              onClick={() => onNavigate('products', 'services')}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FDE8E9] text-[#E3111D] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0178A2] transition-colors">
                  Procurement &amp; Services
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Bulk Procurement, Corporate Supply, Custom Sourcing, Government Tenders, and Logistics.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-xs font-bold text-[#0178A2]">
                <span>Explore Services</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Inventory Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0178A2]">
              Direct from our Warehouse
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Essential Medical Inventory
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="text-sm font-bold text-[#0178A2] hover:text-[#015B7A] inline-flex items-center gap-1"
          >
            <span>See All Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenSpecsModal={(p) => setModalProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 5. Direct Action CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="relative rounded-3xl bg-[#0178A2] text-white p-8 sm:p-12 overflow-hidden shadow-xl">
          <EcgWatermark opacity={0.15} className="bottom-2" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-block text-xs font-extrabold tracking-widest text-[#4EC2B5] uppercase">
                Fast &amp; Professional Quotations
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Need a Custom Quote or Bulk Supply Agreement?
              </h2>
              <p className="text-sm sm:text-base text-slate-100 max-w-2xl leading-relaxed">
                Add your required items to our simple Quote Cart or contact our sales department directly. Our team responds promptly with formal quotation documents.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <a
                href={company.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp: {company.whatsapp}</span>
              </a>

              <a
                href={company.phoneTelLink}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-white hover:bg-slate-100 text-[#0178A2] flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <PhoneCall className="w-4 h-4 text-[#0178A2]" />
                <span>Call Us: {company.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
