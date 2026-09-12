import React from 'react';
import { PageId } from '../types';
import { useCompany } from '../context/CompanyContext';
import { EcgWatermark } from '../components/EcgWatermark';
import {
  ShieldCheck,
  Building2,
  HeartHandshake,
  CheckCircle2,
  Target,
  ArrowRight,
  Truck
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const company = useCompany();

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Header Banner */}
      <section className="relative bg-[#0178A2] text-white py-16 sm:py-20 overflow-hidden">
        <EcgWatermark opacity={0.15} className="bottom-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 text-center max-w-3xl">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#4EC2B5]">
            About DK Medical &amp; General Supplies
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2">
            Committed to Quality, Health &amp; Operational Excellence
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-100 leading-relaxed">
            A trusted South African supplier dedicated to empowering healthcare providers, emergency responders, corporate entities, and public institutions with certified medical and general supplies.
          </p>
        </div>
      </section>

      {/* Company Story & Purpose */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0178A2]">
              Our Foundation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              Delivering Medical Integrity Across South Africa
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              <strong>DK Medical &amp; General Supplies</strong> was established to bridge the gap between quality medical equipment manufacturers and the frontline healthcare providers who need them. Whether equipping a multi-disciplinary hospital ward, a private clinic, an emergency ambulance crew, or an office health room, we supply dependable, certified products at competitive rates.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              We operate nationwide, facilitating seamless procurement across South Africa’s nine provinces. Our extensive catalog includes advanced diagnostic tools, sterile consumables, trauma care equipment, PPE, and everyday workplace supplies.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-[#0178A2] hover:bg-[#015B7A] text-white transition-all flex items-center gap-2"
              >
                <span>Explore Our Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all"
              >
                <span>Contact Our Team</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-6 shadow-xs">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3">
              Our Operational Highlights
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#E8F8F6] text-[#4EC2B5] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-[#3BA497]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Hospital &amp; Clinical Compliance</h4>
                  <p className="text-xs text-slate-600 mt-0.5">All diagnostic devices and surgical consumables satisfy stringent South African regulatory standards.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#E6F3F7] text-[#0178A2] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Nationwide Distribution Network</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Logistical pipelines ensuring safe and rapid delivery to urban and regional facilities across South Africa.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#FDE8E9] text-[#E3111D] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Institutional &amp; Tender Procurement</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Experienced partner for municipal, provincial, and private corporate health tenders.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Pillars */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#E6F3F7] text-[#0178A2] flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Our Mission</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                To deliver the highest standard of medical and general supplies efficiently, ensuring healthcare workers and businesses have the reliable tools they need to protect life and maintain wellness.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#E8F8F6] text-[#4EC2B5] flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-[#3BA497]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Quality Assurance</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We stringently vet all suppliers and stock only verified, high-performance equipment, certified PPE, and sterile wound care products that medical professionals trust.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#FDE8E9] text-[#E3111D] flex items-center justify-center mb-4">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Customer Partnership</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We believe in enduring relationships, responsive communication, transparent pricing, and custom sourcing services tailored to each client's specific operational requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Contact Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to discuss your supply requirements?</h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Contact our knowledgeable sales team today via phone, email or WhatsApp for product recommendations, volume quotes, or custom requests.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={company.phoneTelLink}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-[#0178A2] hover:bg-[#015B7A] text-white transition-colors"
            >
              Call {company.phone}
            </a>
            <a
              href={company.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
