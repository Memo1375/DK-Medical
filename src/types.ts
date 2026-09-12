export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  active: number;
  sort_order: number;
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  name: string;
  slug: string;
  description: string;
  specifications: string;
  image_url: string | null;
  active: number;
  sort_order: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerFormData {
  first_name: string;
  surname: string;
  company?: string;
  email: string;
  phone: string;
  comment?: string;
}

export interface CompanyConfig {
  name: string;
  tagline: string;
  phone: string;
  phoneTelLink: string;
  whatsapp: string;
  whatsappIntl: string;
  whatsappUrl: string;
  email: string;
  emailMailto: string;
  logoUrl: string;
  copyright: string;
}

export type PageId = 'home' | 'about' | 'products' | 'contact' | 'quote-cart';
