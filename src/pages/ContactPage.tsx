import React, { useState } from 'react';
import { PageId } from '../types';
import { useCompany } from '../context/CompanyContext';
import { EcgWatermark } from '../components/EcgWatermark';
import { SuccessModal } from '../components/SuccessModal';
import {
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Clock,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  Building
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: PageId) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const company = useCompany();

  const [formData, setFormData] = useState({
    first_name: '',
    surname: '',
    email: '',
    phone: '',
    company: '',
    subject: 'General Medical Supply Enquiry',
    message: ''
  });

  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inquiryReference, setInquiryReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (honeypot) return; // Silent discard bot

    if (!formData.first_name.trim() || !formData.surname.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields (First Name, Surname, Email, Phone, and Message).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name.trim(),
          surname: formData.surname.trim(),
          company: formData.company?.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: formData.subject,
          message: formData.message.trim(),
          hp_field: honeypot
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit enquiry.');
      }

      setInquiryReference(data.reference || null);
      setSubmitted(true);
      setShowModal(true);
    } catch (err: any) {
      console.error('Contact error:', err);
      setError(err.message || 'Unable to deliver message right now. Please call or WhatsApp us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Header Banner */}
      <section className="relative bg-[#0178A2] text-white py-16 sm:py-20 overflow-hidden">
        <EcgWatermark opacity={0.15} className="bottom-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 text-center max-w-3xl">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#4EC2B5]">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2">
            Contact DK Medical &amp; General Supplies
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-100 leading-relaxed">
            Have questions about medical stock, product specifications, bulk delivery or government tenders? Reach out to our dedicated team.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Direct Contact Details & Info */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0178A2]">
                Direct Lines
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                We're Here to Assist You
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Connect with our sales and procurement consultants for urgent quotes, order tracking, and tender documentation.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              <a
                href={company.phoneTelLink}
                id="contact-phone-card"
                className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 hover:bg-[#E6F3F7] border border-slate-200 hover:border-[#0178A2]/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#E6F3F7] group-hover:bg-[#0178A2] text-[#0178A2] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500">Telephone / Switchboard</span>
                  <span className="text-base font-bold text-slate-900 group-hover:text-[#0178A2] transition-colors">{company.phone}</span>
                  <span className="block text-xs text-slate-400 mt-0.5">Mon - Fri: 08:00 - 17:00</span>
                </div>
              </a>

              <a
                href={company.emailMailto}
                id="contact-email-card"
                className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 hover:bg-[#E6F3F7] border border-slate-200 hover:border-[#0178A2]/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#E8F8F6] group-hover:bg-[#4EC2B5] text-[#3BA497] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500">Sales Inquiries</span>
                  <span className="text-base font-bold text-slate-900 group-hover:text-[#0178A2] transition-colors">{company.email}</span>
                  <span className="block text-xs text-slate-400 mt-0.5">Prompt email response</span>
                </div>
              </a>

              <a
                href={company.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="contact-whatsapp-card"
                className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 hover:border-emerald-400 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-emerald-800">WhatsApp Instant Chat</span>
                  <span className="text-base font-bold text-emerald-950">{company.whatsapp}</span>
                  <span className="block text-xs text-emerald-700 mt-0.5">Direct chat with an agent</span>
                </div>
              </a>
            </div>

            {/* Operational Info Box */}
            <div className="p-6 rounded-2xl bg-slate-900 text-slate-300 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#E3111D] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white text-sm">Distribution Coverage:</span>
                  <p className="text-xs text-slate-400 mt-0.5">All 9 South African Provinces with express freight options.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#4EC2B5] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white text-sm">Business Hours:</span>
                  <p className="text-xs text-slate-400 mt-0.5">Monday – Friday: 08:00 to 17:00 (SAST)<br />Emergency healthcare orders processed by arrangement.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#E8F8F6] text-[#4EC2B5] mx-auto flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-[#0178A2]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 max-w-md mx-auto leading-snug">
                    Thank you for your enquiry our sales team will get back to you shortly.
                  </h3>
                  {inquiryReference && (
                    <div className="inline-block px-4 py-1.5 bg-[#E6F3F7] text-[#0178A2] font-mono text-xs font-bold rounded-full">
                      Reference: {inquiryReference}
                    </div>
                  )}
                  <div className="pt-4 flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setInquiryReference(null);
                        setFormData({
                          first_name: '',
                          surname: '',
                          email: '',
                          phone: '',
                          company: '',
                          subject: 'General Medical Supply Enquiry',
                          message: ''
                        });
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#0178A2] text-white text-xs font-bold hover:bg-[#015B7A] cursor-pointer"
                    >
                      Send Another Message
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('products')}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                    >
                      Browse Products
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">
                    Send Us an Inquiry
                  </h2>
                  <p className="text-xs text-slate-500 mb-6">
                    Fill in your details below and our sales team will get in touch directly.
                  </p>

                  {error && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="hidden" aria-hidden="true">
                      <input
                        type="text"
                        name="contact_hp"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        tabIndex={-1}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          First Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
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
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Surname <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="surname"
                          required
                          value={formData.surname}
                          onChange={handleInputChange}
                          placeholder="e.g. Dlamini"
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0178A2] text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Company / Organization <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="e.g. Apex Health Group"
                            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0178A2] text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Cell Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="e.g. 082 123 4567"
                            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0178A2] text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="name@organization.co.za"
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0178A2] text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Inquiry Subject
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0178A2] text-slate-900"
                      >
                        <option value="General Medical Supply Enquiry">General Medical Supply Enquiry</option>
                        <option value="Hospital / Clinic Bulk Quotation">Hospital / Clinic Bulk Quotation</option>
                        <option value="Government Tender & Bid Submission">Government Tender &amp; Bid Submission</option>
                        <option value="Custom Product Sourcing Assistance">Custom Product Sourcing Assistance</option>
                        <option value="Delivery & Logistics Tracking">Delivery &amp; Logistics Tracking</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Message <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Please describe your equipment, consumable, or tender requirements..."
                        className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0178A2] text-slate-900 resize-y"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-[#0178A2] hover:bg-[#015B7A] disabled:bg-slate-300 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Transmitting Message...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send Message</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up Success Modal for Contact Inquiry */}
      <SuccessModal
        isOpen={showModal}
        reference={inquiryReference || ''}
        title="Thank you for your enquiry our sales team will get back to you shortly."
        onClose={() => setShowModal(false)}
        onGoHome={() => {
          setShowModal(false);
          onNavigate('home');
        }}
      />
    </div>
  );
};
