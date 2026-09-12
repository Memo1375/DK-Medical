import 'dotenv/config';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { Customer, QuoteItem } from './db/index';

export interface SendQuoteEmailsParams {
  quoteReference: string;
  customer: Customer;
  items: QuoteItem[];
  comment?: string;
  appUrl?: string;
}

export interface SendContactInquiryParams {
  reference: string;
  customer: Customer;
  subject?: string;
  message: string;
  appUrl?: string;
}

export interface EmailDispatchResult {
  salesEmailSent: boolean;
  salesMessageId?: string;
  customerEmailSent?: boolean;
  error?: string;
}

/**
 * Security: Escapes HTML entities to prevent HTML/XSS injection in emails.
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Security: Strips newline characters to prevent SMTP header injection attacks.
 */
export function sanitizeHeader(text: string | null | undefined): string {
  if (!text) return '';
  return String(text).replace(/[\r\n\x00]/g, ' ').trim();
}

/**
 * Validates email format strictly according to standard RFC rules.
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254 || trimmed.length < 5) return false;
  if (/[\r\n]/.test(trimmed)) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

/**
 * Formats RFC-compliant sender string, e.g. "DK Medical" <no-reply@dkmedical.co.za>
 */
function formatSender(emailStr: string | undefined, defaultEmail: string, displayName: string): string {
  const target = sanitizeHeader(emailStr || defaultEmail);
  const cleanName = sanitizeHeader(displayName);
  if (target.includes('<') && target.includes('>')) {
    return target;
  }
  return `"${cleanName}" <${target}>`;
}

/**
 * Returns clean, human-readable date and time formatted in South Africa Standard Time (SAST, UTC+2).
 */
function formatSubmissionDate(): string {
  try {
    return new Intl.DateTimeFormat('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      dateStyle: 'full',
      timeStyle: 'medium'
    }).format(new Date());
  } catch {
    return new Date().toUTCString();
  }
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.getTransporter();
  }

  /**
   * Initializes and returns the Nodemailer SMTP transporter using server-side configuration.
   * Credentials remain strictly server-side and are NEVER exposed to the frontend.
   */
  public getTransporter(): nodemailer.Transporter | null {
    // 1. SMTP Server Host & Port (defaults to cPanel custom server on port 465 SSL/TLS)
    const host = sanitizeHeader(process.env.SMTP_HOST || process.env.EMAIL_HOST || 'reseller60.webserversystems.com');
    const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 465;
    const isSecure = process.env.SMTP_SECURE === 'false' ? false : (port === 465 || true);

    // 2. SMTP Username & Authentication
    const user = sanitizeHeader(process.env.SMTP_USER || process.env.EMAIL_USERNAME || 'no-reply@dkmedical.co.za');

    // 3. SMTP Password from server-side environment secrets (DO NOT hard-code)
    const pass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || '';

    if (!host || !user || !pass) {
      console.warn('[EmailService] SMTP configuration or credentials missing.');
      this.isConfigured = false;
      return null;
    }

    if (!this.transporter) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: isSecure,
          auth: { user, pass },
          tls: {
            rejectUnauthorized: false
          }
        });
        this.isConfigured = true;
        console.log(`[EmailService] Nodemailer SMTP transporter configured for ${host}:${port} (authenticated as: ${user})`);
      } catch (err) {
        console.error('[EmailService] Failed to initialize Nodemailer transport:', err);
        this.isConfigured = false;
        return null;
      }
    }

    return this.transporter;
  }

  /**
   * Resets transporter cache (useful when credentials or environment variables change).
   */
  public resetTransporter(): void {
    if (this.transporter) {
      try {
        this.transporter.close();
      } catch {
        // ignore close error
      }
      this.transporter = null;
    }
    this.isConfigured = false;
    this.getTransporter();
  }

  /**
   * Verifies SMTP connection and authentication health.
   */
  public async verifyConnection(): Promise<{ success: boolean; error?: string }> {
    const transporter = this.getTransporter();
    if (!transporter) {
      return { success: false, error: 'SMTP transporter not configured or credentials missing.' };
    }
    try {
      await transporter.verify();
      return { success: true };
    } catch (err: any) {
      console.error('[EmailService] SMTP verification failed:', err.message || err);
      return { success: false, error: err.message || 'SMTP verification failed.' };
    }
  }

  /**
   * Helper to retrieve the logo file attachment for universal email client support.
   */
  private getLogoAttachment() {
    const candidates = [
      { name: 'dk-medical-logo.png', type: 'image/png' },
      { name: 'dk-medical-logo.svg', type: 'image/svg+xml' }
    ];

    const dirs = [
      path.join(process.cwd(), 'public', 'images'),
      path.join(process.cwd(), 'dist', 'images')
    ];

    for (const candidate of candidates) {
      for (const dir of dirs) {
        const fullPath = path.join(dir, candidate.name);
        if (fs.existsSync(fullPath)) {
          return [
            {
              filename: candidate.name,
              path: fullPath,
              cid: 'dk-medical-logo',
              contentType: candidate.type,
              contentDisposition: 'inline' as const
            }
          ];
        }
      }
    }
    return [];
  }

  /**
   * Builds the exact Customer Confirmation Email as mandated by DK Medical:
   * 
   * From: DK Medical <no-reply@dkmedical.co.za>
   * Reply-To: sales@dkmedical.co.za
   * Subject: DK Medical Sales Request
   * 
   * Body:
   * Good day [Customer Name and Surname],
   * 
   * Thank you for contacting DK Medical.
   * 
   * Our Sales team will respond to you shortly.
   * 
   * Kind regards
   * 
   * DK Medical
   * 
   * [DK Medical Logo]
   */
  private buildCustomerConfirmationEmail(params: {
    customer: Customer;
    reference: string;
    appUrl?: string;
  }) {
    const { customer, reference, appUrl } = params;
    const rawFullName = `${customer.first_name || ''} ${customer.surname || ''}`.trim() || 'Valued Client';
    const fullNameEscaped = escapeHtml(rawFullName);
    const cleanRef = escapeHtml(reference);
    const baseUrl = appUrl || process.env.APP_URL || 'https://dkmedical.co.za';
    const logoWebFallback = `${baseUrl}/images/dk-medical-logo.png`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DK Medical Sales Request</title>
</head>
<body style="margin: 0; padding: 24px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; line-height: 1.6;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <!-- Teal Brand Header Accent -->
    <tr>
      <td style="background-color: #0178A2; height: 6px; font-size: 0; line-height: 0;">&nbsp;</td>
    </tr>

    <!-- Message Body -->
    <tr>
      <td style="padding: 36px 32px 32px 32px;">
        <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #0f172a;">
          Good day ${fullNameEscaped},
        </p>

        <p style="margin: 0 0 12px 0; font-size: 15px; color: #334155; line-height: 1.6;">
          Thank you for contacting DK Medical.
        </p>

        <p style="margin: 0 0 28px 0; font-size: 15px; color: #334155; line-height: 1.6;">
          Our Sales team will respond to you shortly.
        </p>

        <p style="margin: 0 0 4px 0; font-size: 15px; color: #334155;">
          Kind regards
        </p>

        <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #0178A2;">
          DK Medical
        </p>

        <!-- DK Medical Logo -->
        <div style="margin: 16px 0 24px 0;">
          <img src="cid:dk-medical-logo" alt="DK Medical" style="height: 52px; width: auto; max-width: 240px; display: block; border: 0;" onerror="this.src='${logoWebFallback}'" />
        </div>

        <!-- Reference Identifier Badge -->
        <div style="margin-top: 24px; padding: 10px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; color: #64748b;">
          <span style="font-weight: 600; color: #0178A2;">Reference:</span> ${cleanRef}
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f1f5f9; padding: 18px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
        <p style="margin: 0 0 4px 0; font-weight: 700; color: #0178A2;">DK Medical &amp; General Supplies</p>
        <p style="margin: 0 0 4px 0;">Telephone: 0818894083 | WhatsApp: 0765113443 | Email: sales@dkmedical.co.za</p>
        <p style="margin: 0; color: #94a3b8;">This automated confirmation was sent from no-reply@dkmedical.co.za</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `Good day ${rawFullName},

Thank you for contacting DK Medical.

Our Sales team will respond to you shortly.

Kind regards

DK Medical

Reference: ${reference}

--
DK Medical & General Supplies
Telephone: 0818894083 | WhatsApp: 0765113443 | Email: sales@dkmedical.co.za
Website: https://dkmedical.co.za
`;

    return { html, text, rawFullName };
  }

  /**
   * Builds the Internal Sales Notification Email to sales@dkmedical.co.za:
   * Subject: New DK Medical Sales Request – [Customer Name and Surname]
   * 
   * Contains complete information:
   * - Customer name and surname
   * - Email address
   * - Telephone number
   * - Company
   * - Request type (Quote Request or Contact / Sales Enquiry)
   * - Products/services requested (with table for quotes)
   * - Customer message
   * - Date and time of submission
   * - Reference ID
   */
  private buildInternalSalesEmail(params: {
    customer: Customer;
    reference: string;
    requestType: 'Quote Request' | 'Contact / Sales Enquiry' | 'Request to be Contacted';
    messageOrComment?: string;
    items?: QuoteItem[];
    subject?: string;
    appUrl?: string;
  }) {
    const { customer, reference, requestType, messageOrComment, items, subject, appUrl } = params;
    const rawFullName = `${customer.first_name || ''} ${customer.surname || ''}`.trim() || 'Valued Client';
    const fullNameEscaped = escapeHtml(rawFullName);
    const cleanRef = escapeHtml(reference);
    const cleanEmail = escapeHtml(customer.email);
    const cleanPhone = escapeHtml(customer.phone);
    const cleanCompany = escapeHtml(customer.company || 'Not provided');
    const cleanMessage = escapeHtml(messageOrComment || '');
    const cleanSubject = escapeHtml(subject || (requestType === 'Quote Request' ? 'Quotation Request' : 'General Enquiry'));
    const submissionDate = formatSubmissionDate();
    const baseUrl = appUrl || process.env.APP_URL || 'https://dkmedical.co.za';
    const logoWebFallback = `${baseUrl}/images/dk-medical-logo.png`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New DK Medical Sales Request – ${fullNameEscaped}</title>
</head>
<body style="margin: 0; padding: 24px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; line-height: 1.6;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <!-- Header Banner -->
    <tr>
      <td style="background-color: #0178A2; padding: 24px 32px; text-align: left;">
        <span style="display: inline-block; background-color: #4EC2B5; color: #01384c; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 4px; margin-bottom: 8px;">
          ${escapeHtml(requestType.toUpperCase())}
        </span>
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.2px;">
          New DK Medical Sales Request
        </h1>
        <p style="margin: 4px 0 0 0; color: #e0f2fe; font-size: 13px;">
          Reference: <strong>${cleanRef}</strong> &bull; Submitted: ${escapeHtml(submissionDate)}
        </p>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 28px 32px;">
        <!-- Customer Details Box -->
        <h2 style="font-size: 15px; font-weight: 700; color: #0178A2; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #E6F3F7; padding-bottom: 6px;">
          Customer Contact Details
        </h2>
        <table role="presentation" width="100%" style="border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 160px; font-weight: 600;">Customer Name:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${fullNameEscaped}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Email Address:</td>
            <td style="padding: 6px 0;"><a href="mailto:${cleanEmail}" style="color: #0178A2; font-weight: 600; text-decoration: underline;">${cleanEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Telephone Number:</td>
            <td style="padding: 6px 0;"><a href="tel:${cleanPhone}" style="color: #0178A2; text-decoration: none;">${cleanPhone}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Company:</td>
            <td style="padding: 6px 0; color: #334155;">${cleanCompany}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Subject:</td>
            <td style="padding: 6px 0; color: #334155; font-weight: 600;">${cleanSubject}</td>
          </tr>
        </table>

        <!-- Customer Message / Enquiry Details -->
        <h2 style="font-size: 15px; font-weight: 700; color: #0178A2; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #E6F3F7; padding-bottom: 6px;">
          Customer Message / Enquiry
        </h2>
        <div style="background-color: #f8fafc; border-left: 4px solid #0178A2; padding: 14px 18px; margin-bottom: 24px; font-size: 14px; color: #1e293b; border-radius: 0 8px 8px 0;">
          ${cleanMessage ? cleanMessage.replace(/\n/g, '<br>') : '<em style="color: #94a3b8;">No additional message provided.</em>'}
        </div>

        ${items && items.length > 0 ? `
        <!-- Products Requested Section -->
        <h2 style="font-size: 15px; font-weight: 700; color: #0178A2; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #E6F3F7; padding-bottom: 6px;">
          Products / Services Requested (${items.length} items)
        </h2>
        <table role="presentation" width="100%" style="border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
              <th style="text-align: left; padding: 8px 10px; color: #475569; font-weight: 700;">Product</th>
              <th style="text-align: left; padding: 8px 10px; color: #475569; font-weight: 700;">Category</th>
              <th style="text-align: left; padding: 8px 10px; color: #475569; font-weight: 700;">Specifications</th>
              <th style="text-align: right; padding: 8px 10px; color: #475569; font-weight: 700;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; color: #0f172a; font-weight: 600;">${escapeHtml(item.product_name_snapshot)}</td>
                <td style="padding: 10px; color: #64748b;">${escapeHtml(item.category_name || 'General')}</td>
                <td style="padding: 10px; color: #64748b; font-size: 12px;">${escapeHtml(item.specifications || 'Standard')}</td>
                <td style="padding: 10px; text-align: right; font-weight: 700; color: #0178A2; font-size: 14px;">${item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}

        <!-- Sales Action Box -->
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px; margin-top: 16px; font-size: 13px; color: #166534;">
          <strong>Quick Action:</strong> You can reply directly to this email to respond to <strong>${fullNameEscaped}</strong> at <strong>${cleanEmail}</strong>.
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f1f5f9; padding: 18px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
        <img src="cid:dk-medical-logo" alt="DK Medical" style="height: 36px; width: auto; margin-bottom: 8px;" onerror="this.src='${logoWebFallback}'" />
        <p style="margin: 0; color: #64748b;">DK Medical Quotation &amp; Sales Management System</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `NEW DK MEDICAL SALES REQUEST
=========================================
Reference: ${reference}
Request Type: ${requestType}
Submitted: ${submissionDate}

CUSTOMER CONTACT DETAILS:
- Name: ${rawFullName}
- Email: ${customer.email}
- Phone: ${customer.phone}
- Company: ${customer.company || 'Not provided'}
- Subject: ${subject || (requestType === 'Quote Request' ? 'Quotation Request' : 'General Enquiry')}

CUSTOMER MESSAGE / DETAILS:
${messageOrComment || 'No additional message provided.'}

${items && items.length > 0 ? `
REQUESTED PRODUCTS:
${items.map(i => `- ${i.product_name_snapshot} | Qty: ${i.quantity} | Cat: ${i.category_name || 'General'}`).join('\n')}
` : ''}

--
To respond to the customer, reply directly to this notification.
DK Medical Sales System`;

    return { html, text };
  }

  /**
   * Dispatches Quote Request notification to sales@dkmedical.co.za:
   * External email to the client is NOT sent.
   * Internal sales notification is sent to sales@dkmedical.co.za (From: DK Medical <no-reply@dkmedical.co.za>, Reply-To: customer.email)
   */
  public async sendQuoteNotifications(params: SendQuoteEmailsParams): Promise<EmailDispatchResult> {
    const { quoteReference, customer, items, comment, appUrl } = params;

    // Strict email validation
    if (!isValidEmail(customer.email)) {
      console.error(`[EmailService] Invalid customer email rejected: "${customer.email}"`);
      return {
        salesEmailSent: false,
        error: 'Invalid customer email address.'
      };
    }

    const authSenderUser = sanitizeHeader(process.env.SMTP_USER || process.env.EMAIL_USERNAME || 'no-reply@dkmedical.co.za');
    const senderName = sanitizeHeader(process.env.SMTP_FROM_NAME || 'DK Medical');
    const senderEmail = sanitizeHeader(process.env.SMTP_FROM_EMAIL || process.env.EMAIL_NO_REPLY || 'no-reply@dkmedical.co.za');
    const salesEmail = sanitizeHeader(process.env.SALES_EMAIL || process.env.SMTP_REPLY_TO || process.env.COMPANY_EMAIL || 'sales@dkmedical.co.za');

    const formattedFrom = formatSender(senderEmail, 'no-reply@dkmedical.co.za', senderName);
    const cleanCustomerEmail = sanitizeHeader(customer.email);
    const rawFullName = `${customer.first_name || ''} ${customer.surname || ''}`.trim() || 'Valued Client';

    // Build Internal Sales Email
    const salesEmailContent = this.buildInternalSalesEmail({
      customer,
      reference: quoteReference,
      requestType: 'Quote Request',
      messageOrComment: comment,
      items,
      appUrl
    });

    const transporter = this.getTransporter();

    if (!transporter) {
      const err = '[EmailService] SMTP transporter not configured. Check SMTP_PASSWORD secret.';
      console.error(err);
      return {
        salesEmailSent: false,
        error: err
      };
    }

    const logoAttachments = this.getLogoAttachment();

    // Send Internal Sales Notification Email to sales@dkmedical.co.za
    try {
      const salesSubject = sanitizeHeader(`New DK Medical Quote Request – ${rawFullName} (${quoteReference})`);
      console.log(`[EmailService] Dispatching quote request notification to sales: ${salesEmail}...`);
      const info = await transporter.sendMail({
        from: formattedFrom,
        envelope: {
          from: authSenderUser,
          to: [salesEmail]
        },
        replyTo: cleanCustomerEmail,
        to: salesEmail,
        subject: salesSubject,
        html: salesEmailContent.html,
        text: salesEmailContent.text,
        attachments: logoAttachments
      });
      console.log(`[EmailService] Quote request sent successfully to sales (${salesEmail}, MessageId: ${info.messageId})`);
      return {
        salesEmailSent: true,
        salesMessageId: info.messageId
      };
    } catch (err: any) {
      console.error(`[EmailService Error - Quote Request] Failed sending to sales (${salesEmail}):`, err.message || err);
      return {
        salesEmailSent: false,
        error: err.message || 'Failed to send quote request to sales team.'
      };
    }
  }

  /**
   * Dispatches Request to be Contacted notification to sales@dkmedical.co.za:
   * External email to the client is NOT sent.
   * Internal sales notification is sent to sales@dkmedical.co.za (From: DK Medical <no-reply@dkmedical.co.za>, Reply-To: customer.email)
   */
  public async sendContactInquiryNotifications(params: SendContactInquiryParams): Promise<EmailDispatchResult> {
    const { reference, customer, subject, message, appUrl } = params;

    // Strict email validation
    if (!isValidEmail(customer.email)) {
      console.error(`[EmailService] Invalid customer email rejected: "${customer.email}"`);
      return {
        salesEmailSent: false,
        error: 'Invalid customer email address.'
      };
    }

    const authSenderUser = sanitizeHeader(process.env.SMTP_USER || process.env.EMAIL_USERNAME || 'no-reply@dkmedical.co.za');
    const senderName = sanitizeHeader(process.env.SMTP_FROM_NAME || 'DK Medical');
    const senderEmail = sanitizeHeader(process.env.SMTP_FROM_EMAIL || process.env.EMAIL_NO_REPLY || 'no-reply@dkmedical.co.za');
    const salesEmail = sanitizeHeader(process.env.SALES_EMAIL || process.env.SMTP_REPLY_TO || process.env.COMPANY_EMAIL || 'sales@dkmedical.co.za');

    const formattedFrom = formatSender(senderEmail, 'no-reply@dkmedical.co.za', senderName);
    const cleanCustomerEmail = sanitizeHeader(customer.email);
    const rawFullName = `${customer.first_name || ''} ${customer.surname || ''}`.trim() || 'Valued Client';

    // Build Internal Sales Email for Contact / Request to be contacted
    const salesEmailContent = this.buildInternalSalesEmail({
      customer,
      reference,
      requestType: 'Request to be Contacted',
      messageOrComment: message,
      subject,
      appUrl
    });

    const transporter = this.getTransporter();

    if (!transporter) {
      const err = '[EmailService] SMTP transporter not configured. Check SMTP_PASSWORD secret.';
      console.error(err);
      return {
        salesEmailSent: false,
        error: err
      };
    }

    const logoAttachments = this.getLogoAttachment();

    // Send Internal Sales Notification Email to sales@dkmedical.co.za
    try {
      const salesSubject = sanitizeHeader(`New DK Medical Request to be Contacted – ${rawFullName} (${reference})`);
      console.log(`[EmailService] Dispatching contact request notification to sales: ${salesEmail}...`);
      const info = await transporter.sendMail({
        from: formattedFrom,
        envelope: {
          from: authSenderUser,
          to: [salesEmail]
        },
        replyTo: cleanCustomerEmail,
        to: salesEmail,
        subject: salesSubject,
        html: salesEmailContent.html,
        text: salesEmailContent.text,
        attachments: logoAttachments
      });
      console.log(`[EmailService] Contact request sent successfully to sales (${salesEmail}, MessageId: ${info.messageId})`);
      return {
        salesEmailSent: true,
        salesMessageId: info.messageId
      };
    } catch (err: any) {
      console.error(`[EmailService Error - Contact Request] Failed sending to sales (${salesEmail}):`, err.message || err);
      return {
        salesEmailSent: false,
        error: err.message || 'Failed to send contact request to sales team.'
      };
    }
  }
}

export const emailService = new EmailService();
