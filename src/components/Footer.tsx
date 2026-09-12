import React from 'react';
import { PageId } from '../types';
import { useCompany } from '../context/CompanyContext';
import { EcgWatermark } from './EcgWatermark';
import { DkLogo } from './DkLogo';
import { Phone, Mail, MessageSquare, ShieldCheck, MapPin, ChevronRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const company = useCompany();

  const handleNav = (page: PageId) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="relative bg-slate-950 text-slate-300 overflow-hidden border-t border-slate-800">
      {/* Subtle ECG Watermark in Footer */}
      <EcgWatermark opacity={0.08} className="top-10" />

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <DkLogo theme="dark" className="h-11 w-auto max-w-[220px]" />
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              {company.tagline}. Dedicated South African distributor of certified medical equipment, clinical consumables, protective wear, and general institutional supplies.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#4EC2B5] font-semibold bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-[#4EC2B5]" />
              <span>Compliant &amp; Certified Sourcing Partner</span>
            </div>
          </div>

          {/* Col 2: Quick Navigation */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-l-2 border-[#4EC2B5] pl-2.5">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className="hover:text-[#4EC2B5] transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('about')}
                  className="hover:text-[#4EC2B5] transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('products')}
                  className="hover:text-[#4EC2B5] transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Product Catalog</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('quote-cart')}
                  className="hover:text-[#4EC2B5] transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Quote Request Cart</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('contact')}
                  className="hover:text-[#4EC2B5] transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Contact Us</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Product Sectors */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-l-2 border-[#0178A2] pl-2.5">
              Product Categories
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4EC2B5]" />
                <span>Medical Equipment &amp; Diagnostics</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4EC2B5]" />
                <span>Medical Consumables &amp; Wound Care</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4EC2B5]" />
                <span>First Aid, Burn &amp; Trauma Kits</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4EC2B5]" />
                <span>PPE &amp; Protective Gowns</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4EC2B5]" />
                <span>General Office &amp; Packaging</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4EC2B5]" />
                <span>Bulk Procurement &amp; Tender Supply</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Direct Inquiries */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-l-2 border-[#E3111D] pl-2.5">
              Direct Contact
            </h4>
            <div className="space-y-3.5 text-sm">
              <a
                href={company.phoneTelLink}
                id="footer-phone-link"
                className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors group"
              >
                <Phone className="w-4 h-4 text-[#4EC2B5] mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="block text-xs text-slate-400">Telephone</span>
                  <span className="font-semibold text-white">{company.phone}</span>
                </div>
              </a>

              <a
                href={company.emailMailto}
                id="footer-email-link"
                className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors group"
              >
                <Mail className="w-4 h-4 text-[#4EC2B5] mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="block text-xs text-slate-400">Sales Inquiries</span>
                  <span className="font-semibold text-white">{company.email}</span>
                </div>
              </a>

              <a
                href={company.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="footer-whatsapp-link"
                className="flex items-start gap-3 p-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 transition-colors group"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="block text-xs text-emerald-300 font-medium">WhatsApp Support</span>
                  <span className="font-semibold text-white">{company.whatsapp}</span>
                </div>
              </a>

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#E3111D]" />
                <span>Nationwide Logistics Across South Africa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Copyright */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>{company.copyright}</p>
          <div className="flex items-center gap-4">
            <span className="text-[#4EC2B5] font-semibold">DK Medical &amp; General Supplies</span>
            <span>•</span>
            <span>All 9 Provinces Covered</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
