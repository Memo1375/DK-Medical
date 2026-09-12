import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { dbManager } from './server/db/index';
import { emailService } from './server/email';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple in-memory rate limiting map for quote submissions
const submissionTracker = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 6;

  const timestamps = submissionTracker.get(ip) || [];
  const validTimestamps = timestamps.filter(t => now - t < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return false;
  }

  validTimestamps.push(now);
  submissionTracker.set(ip, validTimestamps);
  return true;
}

// 1. Company Configuration Endpoint
app.get('/api/config', (req: Request, res: Response) => {
  const phone = process.env.COMPANY_PHONE || '0818894083';
  const whatsappLocal = process.env.COMPANY_WHATSAPP || '0765113443';
  const whatsappIntl = process.env.COMPANY_WHATSAPP_INTERNATIONAL || '27765113443';
  const email = process.env.COMPANY_EMAIL || 'sales@dkmedical.co.za';
  const name = process.env.COMPANY_NAME || 'DK MEDICAL & GENERAL SUPPLIES';
  const logo = process.env.COMPANY_LOGO || '/images/dk-medical-logo.svg';

  res.json({
    name,
    tagline: 'Quality Medical & General Supplies',
    phone,
    phoneTelLink: `tel:${phone.replace(/\s+/g, '')}`,
    whatsapp: whatsappLocal,
    whatsappIntl,
    whatsappUrl: `https://wa.me/${whatsappIntl.replace(/\D/g, '')}`,
    email,
    emailMailto: `mailto:${email}`,
    logoUrl: logo,
    copyright: '© 2026 DK Medical & General Supplies. All Rights Reserved.'
  });
});

// 2. Categories Endpoint
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const categories = dbManager.getCategories();
    res.json({ success: true, categories });
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
});

// 3. Products List Endpoint (with filtering, search, alphabetical ordering)
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const categorySlug = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    const products = dbManager.getProducts({ categorySlug, search });
    res.json({ success: true, count: products.length, products });
  } catch (err: any) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
});

// 4. Single Product Endpoint
app.get('/api/products/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const product = dbManager.getProductBySlug(slug);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (err: any) {
    console.error('Error fetching product:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve product details.' });
  }
});

// 5. Quote Submission Endpoint (Transactional with Anti-spam & Validation)
app.post('/api/quotes', async (req: Request, res: Response) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';

    // 1. Anti-spam Rate Limiting
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests submitted. Please wait a minute before submitting again.'
      });
    }

    const {
      first_name,
      surname,
      company,
      email,
      phone,
      comment,
      items,
      hp_field // Honeypot trap field for bots
    } = req.body;

    // 2. Honeypot check - if filled, silently discard or reject bot
    if (hp_field) {
      console.warn('[Security] Bot detected via honeypot field submission');
      return res.status(400).json({
        success: false,
        message: 'Invalid submission request.'
      });
    }

    // 3. Validation
    if (!first_name || !first_name.trim() || !surname || !surname.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required fields before submitting your enquiry.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (!phone || !phone.trim() || phone.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid cell phone number.'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one product to your quote request.'
      });
    }

    // 4. Execute SQL Transaction
    const result = dbManager.createQuoteRequest({
      first_name: first_name.trim(),
      surname: surname.trim(),
      company: company?.trim(),
      email: email.trim(),
      phone: phone.trim(),
      comment: comment?.trim(),
      items: items.map(i => ({
        product_id: Number(i.product_id),
        quantity: Math.max(1, Number(i.quantity) || 1)
      }))
    });

    // 5. Send both emails: separate client confirmation and internal sales team notification
    const host = req.get('host');
    const protocol = req.protocol;
    const appUrl = `${protocol}://${host}`;

    try {
      console.log(`[Quote] Dispatching emails for quote ${result.quote_reference} to client (${result.customer.email}) and sales...`);
      await emailService.sendQuoteNotifications({
        quoteReference: result.quote_reference,
        customer: result.customer,
        items: result.items,
        comment: comment?.trim(),
        appUrl
      });
      console.log(`[Quote] Email dispatch completed for ${result.quote_reference}`);
    } catch (emailErr) {
      console.error('[Quote Email Delivery Error]:', emailErr);
    }

    // 6. Return Success with Unique Reference
    return res.status(201).json({
      success: true,
      quote_reference: result.quote_reference,
      message: 'Quote request received successfully. One of our agents will be in contact with you shortly.'
    });

  } catch (err: any) {
    console.error('[API Quote Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'We were unable to submit your enquiry at this time. Please try again or contact DK Medical directly.'
    });
  }
});

// 6. Contact / Client Details Enquiry Endpoint
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';

    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests submitted. Please wait a moment before trying again.'
      });
    }

    const {
      first_name,
      surname,
      name, // Fallback if client supplied combined name
      company,
      email,
      phone,
      subject,
      message,
      hp_field
    } = req.body;

    if (hp_field) {
      console.warn('[Security] Bot detected in contact submission');
      return res.status(400).json({ success: false, message: 'Invalid submission request.' });
    }

    // Resolve first_name and surname
    let resolvedFirstName = (first_name || '').trim();
    let resolvedSurname = (surname || '').trim();

    if (!resolvedFirstName && name) {
      const parts = name.trim().split(/\s+/);
      resolvedFirstName = parts[0] || 'Valued';
      resolvedSurname = parts.slice(1).join(' ') || 'Client';
    }

    if (!resolvedFirstName || !resolvedSurname) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your first name and surname.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (!phone || !phone.trim() || phone.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid cell phone number.'
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your message or enquiry details.'
      });
    }

    // Save contact enquiry to database
    const result = dbManager.createContactInquiry({
      first_name: resolvedFirstName,
      surname: resolvedSurname,
      company: company?.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject?.trim(),
      message: message.trim()
    });

    const host = req.get('host');
    const protocol = req.protocol;
    const appUrl = `${protocol}://${host}`;

    // Send separate emails to client (from no-reply@dkmedical.co.za) and sales team (sales@dkmedical.co.za)
    try {
      console.log(`[Contact] Dispatching emails for inquiry ${result.reference} to client (${result.customer.email}) and sales...`);
      await emailService.sendContactInquiryNotifications({
        reference: result.reference,
        customer: result.customer,
        subject: subject?.trim(),
        message: message.trim(),
        appUrl
      });
      console.log(`[Contact] Email dispatch completed for ${result.reference}`);
    } catch (emailErr) {
      console.error('[Contact Email Delivery Error]:', emailErr);
    }

    return res.status(201).json({
      success: true,
      reference: result.reference,
      message: 'Your details have been received successfully. Our sales team will respond to you shortly.'
    });
  } catch (err: any) {
    console.error('[API Contact Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'We were unable to process your request at this time. Please try again or contact us directly.'
    });
  }
});

// Start Server and Vite Middleware
async function startServer() {
  try {
    await dbManager.init();

    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[DK Medical Server] Running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
}

startServer();
