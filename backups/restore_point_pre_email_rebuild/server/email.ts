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

function formatSender(emailStr: string | undefined, defaultEmail: string, displayName: string): string {
  const target = (emailStr || defaultEmail).trim();
  if (target.includes('<') && target.includes('>')) {
    return target;
  }
  return `"${displayName}" <${target}>`;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.getTransporter();
  }

  private getTransporter(): nodemailer.Transporter | null {
    const host = process.env.EMAIL_HOST || 'reseller60.webserversystems.com';
    const port = Number(process.env.EMAIL_PORT) || 465;
    const user = process.env.EMAIL_USERNAME || 'sales@dkmedical.co.za';
    const pass = process.env.EMAIL_PASSWORD || 'M3d98tys@l3';

    if (!host || !user || !pass) {
      console.warn('[EmailService] SMTP credentials missing.');
      this.isConfigured = false;
      return null;
    }

    if (!this.transporter) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
          tls: {
            rejectUnauthorized: false
          }
        });
        this.isConfigured = true;
        console.log(`[EmailService] SMTP transport configured for ${host}:${port} (user: ${user})`);
      } catch (err) {
        console.error('[EmailService] Failed to create transport:', err);
        this.isConfigured = false;
        return null;
      }
    }

    return this.transporter;
  }

  /**
   * Builds the official client confirmation email required by DK Medical.
   * Subject: "DK Medical Sales Request"
   * From: no-reply@dkmedical.co.za
   * Salutation: Good day (Name and Surname provided on the contact details)
   * Body:
   * Thank you for contacting DK Medical.
   * Our Sales team will respond to you shortly.
   * 
   * Kind regards
   * 
   * DK Medical
   * (Insert the logo here)
   */
  private buildClientEmail(params: {
    customer: Customer;
    quoteReference?: string;
    reference?: string;
    items?: QuoteItem[];
    appUrl?: string;
  }) {
    const { customer, quoteReference, reference, items, appUrl } = params;
    const baseUrl = appUrl || process.env.APP_URL || 'https://dkmedical.co.za';
    const logoUrl = `${baseUrl}/images/dk-medical-logo.svg`;

    const fullName = `${customer.first_name || ''} ${customer.surname || ''}`.trim() || 'Valued Client';
    const activeRef = quoteReference || reference;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DK Medical Sales Request</title>
</head>
<body style="margin: 0; padding: 24px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; line-height: 1.6;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <!-- Top Teal Header Accent Bar -->
    <tr>
      <td style="background-color: #0178A2; height: 6px; font-size: 0; line-height: 0;">&nbsp;</td>
    </tr>

    <!-- Main Content Area -->
    <tr>
      <td style="padding: 36px 32px 28px 32px;">
        <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #0f172a;">
          Good day ${fullName},
        </p>

        <p style="margin: 0 0 8px 0; font-size: 15px; color: #334155; line-height: 1.6;">
          Thank you for contacting DK Medical.
        </p>
        <p style="margin: 0 0 24px 0; font-size: 15px; color: #334155; line-height: 1.6;">
          Our Sales team will respond to you shortly.
        </p>

        <p style="margin: 0 0 4px 0; font-size: 15px; color: #334155;">
          Kind regards
        </p>

        <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #0178A2;">
          DK Medical
        </p>

        <!-- DK Medical Logo -->
        <div style="margin: 12px 0 24px 0;">
          <img src="cid:dk-medical-logo" alt="DK Medical &amp; General Supplies" style="height: 55px; width: auto; max-width: 250px; display: block; border: 0;" />
        </div>

        ${items && items.length > 0 ? `
        <!-- Optional Items Summary Box -->
        <div style="margin-top: 24px; padding: 16px 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0178A2; margin-bottom: 10px;">
            Requested Products Summary ${activeRef ? `(Ref: ${activeRef})` : ''}
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <th style="text-align: left; padding: 6px 0; color: #64748b; font-weight: 600;">Product</th>
                <th style="text-align: right; padding: 6px 0; color: #64748b; font-weight: 600;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #1e293b;"><strong>${item.product_name_snapshot}</strong></td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #0178A2;">${item.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : (activeRef ? `
        <!-- Reference Number Box -->
        <div style="margin-top: 20px; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; color: #64748b;">
          <span style="font-weight: 600; color: #0178A2;">Request Reference:</span> ${activeRef}
        </div>
        ` : '')}
      </td>
    </tr>

    <!-- Footer Information -->
    <tr>
      <td style="background-color: #f1f5f9; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
        <p style="margin: 0 0 4px 0; font-weight: 700; color: #0178A2;">DK Medical &amp; General Supplies</p>
        <p style="margin: 0 0 4px 0;">Telephone: 0818894083 | WhatsApp: 0765113443 | Email: sales@dkmedical.co.za</p>
        <p style="margin: 0; color: #94a3b8;">This automated email was sent from no-reply@dkmedical.co.za</p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const text = [
      `Good day ${fullName},`,
      '',
      'Thank you for contacting DK Medical.',
      'Our Sales team will respond to you shortly.',
      '',
      'Kind regards',
      '',
      'DK Medical',
      '',
      activeRef ? `Reference: ${activeRef}` : '',
      items && items.length > 0 ? `\nRequested Products:\n${items.map(i => `- ${i.product_name_snapshot} (Qty: ${i.quantity})`).join('\n')}` : '',
      '',
      '--',
      'DK Medical & General Supplies',
      'Telephone: 0818894083 | WhatsApp: 0765113443 | Email: sales@dkmedical.co.za',
      'Sent from: no-reply@dkmedical.co.za'
    ].filter(line => line !== null && line !== undefined).join('\n');

    return { html, text, fullName };
  }

  /**
   * Helper to retrieve the logo file attachment for nodemailer.
   * Prefers PNG for universal email client compatibility (Gmail, Apple Mail, Outlook),
   * falling back to SVG if needed.
   */
  private getLogoAttachment(appUrl?: string) {
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
   * Send Quote Notifications:
   * 1. Confirmation email to client from no-reply@dkmedical.co.za with subject "DK Medical Sales Request"
   * 2. Full notification to internal sales team at sales@dkmedical.co.za
   */
  public async sendQuoteNotifications(params: SendQuoteEmailsParams): Promise<{ customerEmailSent: boolean; salesEmailSent: boolean }> {
    const { quoteReference, customer, items, comment, appUrl } = params;
    const companyEmail = process.env.COMPANY_EMAIL || 'sales@dkmedical.co.za';
    const authUser = process.env.EMAIL_USERNAME || 'sales@dkmedical.co.za';
    const senderEmail = process.env.EMAIL_NO_REPLY || process.env.EMAIL_FROM || authUser;
    const clientFrom = formatSender(senderEmail, authUser, 'DK Medical');
    const emailSubject = 'DK Medical Sales Request';
    const baseUrl = appUrl || process.env.APP_URL || 'https://dkmedical.co.za';
    const logoUrl = `${baseUrl}/images/dk-medical-logo.svg`;

    const { html: customerHtml, text: customerText } = this.buildClientEmail({
      customer,
      quoteReference,
      items,
      appUrl
    });

    // 2. Sales Notification Email HTML
    const salesHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background-color: #0178A2; padding: 24px; text-align: center; }
          .content { padding: 32px 28px; }
          .section-title { font-size: 16px; font-weight: 700; color: #0178A2; border-bottom: 2px solid #4EC2B5; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; }
          .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          .info-grid td { padding: 8px 0; font-size: 14px; }
          .info-label { width: 160px; font-weight: 600; color: #64748b; }
          .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .items-table th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 13px; color: #475569; border-bottom: 2px solid #cbd5e1; }
          .items-table td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .logo-img { max-height: 45px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">NEW QUOTE REQUEST</h1>
          </div>
          <div class="content">
            <div style="background-color: #f0fdf4; border-left: 4px solid #4EC2B5; padding: 12px 16px; margin-bottom: 20px;">
              <strong style="color: #0178A2; font-size: 16px;">Quote Reference: ${quoteReference}</strong>
            </div>

            <div class="section-title">Customer Contact Details</div>
            <table class="info-grid">
              <tr>
                <td class="info-label">Name and Surname:</td>
                <td><strong>${customer.first_name} ${customer.surname}</strong></td>
              </tr>
              <tr>
                <td class="info-label">Company:</td>
                <td>${customer.company || '<em>Not provided</em>'}</td>
              </tr>
              <tr>
                <td class="info-label">Email Address:</td>
                <td><a href="mailto:${customer.email}" style="color: #0178A2;">${customer.email}</a></td>
              </tr>
              <tr>
                <td class="info-label">Cell Phone Number:</td>
                <td><a href="tel:${customer.phone}" style="color: #0178A2;">${customer.phone}</a></td>
              </tr>
              <tr>
                <td class="info-label">Comment / Notes:</td>
                <td>${comment ? comment.replace(/\n/g, '<br>') : '<em>No comment provided</em>'}</td>
              </tr>
            </table>

            <div class="section-title">Products Requested</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Specifications</th>
                  <th style="text-align: right;">Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td><strong>${item.product_name_snapshot}</strong></td>
                    <td style="color: #64748b;">${item.category_name || 'General'}</td>
                    <td style="color: #64748b; font-size: 13px;">${item.specifications || 'Available on request'}</td>
                    <td style="text-align: right; font-weight: bold; font-size: 15px; color: #0178A2;">${item.quantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
              <img src="${logoUrl}" alt="DK Medical Logo" class="logo-img" onerror="this.style.display='none'" />
              <p style="font-size: 12px; color: #94a3b8; margin-top: 10px;">DK Medical Quote Management Engine</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    let customerEmailSent = false;
    let salesEmailSent = false;
    const transporter = this.getTransporter();

    // 1. Send Separate Customer Confirmation Email (From: no-reply@dkmedical.co.za | Subject: DK Medical Sales Request)
    try {
      if (transporter && this.isConfigured) {
        console.log(`[Email] Dispatching client confirmation to ${customer.email} from ${clientFrom}...`);
        const info = await transporter.sendMail({
          from: clientFrom,
          envelope: {
            from: authUser,
            to: [customer.email]
          },
          replyTo: companyEmail,
          to: customer.email,
          subject: emailSubject,
          html: customerHtml,
          text: customerText,
          attachments: this.getLogoAttachment(appUrl)
        });
        customerEmailSent = true;
        console.log(`[Email] Customer confirmation successfully sent to ${customer.email} (MessageId: ${info.messageId})`);
      } else {
        console.log(`[Email Log - Customer Confirmation] From: ${clientFrom} | To: ${customer.email} | Subject: ${emailSubject} | Ref: ${quoteReference}`);
        console.log(`[Email Log - Content Preview]:\n${customerText}`);
        customerEmailSent = true;
      }
    } catch (err) {
      console.error(`[Email Error - Customer] Failed sending to client (${customer.email}):`, err);
    }

    // 2. Send Sales Team Notification Email (To: sales@dkmedical.co.za)
    try {
      const salesSubject = `New Quote Request - ${customer.first_name} ${customer.surname} (${quoteReference})`;
      if (transporter && this.isConfigured) {
        console.log(`[Email] Dispatching sales notification to ${companyEmail}...`);
        const info = await transporter.sendMail({
          from: formatSender(authUser, 'sales@dkmedical.co.za', 'DK Medical System'),
          envelope: {
            from: authUser,
            to: [companyEmail]
          },
          replyTo: customer.email,
          to: companyEmail,
          subject: salesSubject,
          html: salesHtml,
          text: `New Quote Request\n\nReference: ${quoteReference}\nCustomer: ${customer.first_name} ${customer.surname}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nCompany: ${customer.company || 'N/A'}\nComment: ${comment || 'N/A'}\nItems:\n${items.map(i => `- ${i.product_name_snapshot} (Qty: ${i.quantity})`).join('\n')}`,
          attachments: this.getLogoAttachment(appUrl)
        });
        salesEmailSent = true;
        console.log(`[Email] Sales team notification successfully sent to ${companyEmail} (MessageId: ${info.messageId})`);
      } else {
        console.log(`[Email Log - Sales Team Notification] To: ${companyEmail} | Subject: ${salesSubject} | Ref: ${quoteReference}`);
        salesEmailSent = true;
      }
    } catch (err) {
      console.error(`[Email Error - Sales] Failed sending to sales team (${companyEmail}):`, err);
    }

    return { customerEmailSent, salesEmailSent };
  }

  /**
   * Send Contact / Details Sharing Notifications:
   * 1. Confirmation email to client from no-reply@dkmedical.co.za with subject "DK Medical Sales Request"
   * 2. Full notification to internal sales team with customer message
   */
  public async sendContactInquiryNotifications(params: SendContactInquiryParams): Promise<{ customerEmailSent: boolean; salesEmailSent: boolean }> {
    const { reference, customer, subject, message, appUrl } = params;
    const companyEmail = process.env.COMPANY_EMAIL || 'sales@dkmedical.co.za';
    const authUser = process.env.EMAIL_USERNAME || 'sales@dkmedical.co.za';
    const senderEmail = process.env.EMAIL_NO_REPLY || process.env.EMAIL_FROM || authUser;
    const clientFrom = formatSender(senderEmail, authUser, 'DK Medical');
    const emailSubject = 'DK Medical Sales Request';
    const baseUrl = appUrl || process.env.APP_URL || 'https://dkmedical.co.za';
    const logoUrl = `${baseUrl}/images/dk-medical-logo.svg`;

    const { html: customerHtml, text: customerText } = this.buildClientEmail({
      customer,
      reference,
      appUrl
    });

    // Sales Team Notification HTML for Contact Message
    const salesHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background-color: #0178A2; padding: 24px; text-align: center; }
          .content { padding: 32px 28px; }
          .section-title { font-size: 16px; font-weight: 700; color: #0178A2; border-bottom: 2px solid #4EC2B5; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; }
          .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          .info-grid td { padding: 8px 0; font-size: 14px; }
          .info-label { width: 160px; font-weight: 600; color: #64748b; }
          .message-box { background-color: #f8fafc; border-left: 4px solid #0178A2; padding: 16px; margin: 15px 0; font-size: 14px; color: #1e293b; }
          .logo-img { max-height: 45px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">NEW SALES ENQUIRY / DETAILS SHARED</h1>
          </div>
          <div class="content">
            <div style="background-color: #f0fdf4; border-left: 4px solid #4EC2B5; padding: 12px 16px; margin-bottom: 20px;">
              <strong style="color: #0178A2; font-size: 16px;">Reference: ${reference}</strong>
            </div>

            <div class="section-title">Client Contact Details</div>
            <table class="info-grid">
              <tr>
                <td class="info-label">Name and Surname:</td>
                <td><strong>${customer.first_name} ${customer.surname}</strong></td>
              </tr>
              <tr>
                <td class="info-label">Company:</td>
                <td>${customer.company || '<em>Not provided</em>'}</td>
              </tr>
              <tr>
                <td class="info-label">Email Address:</td>
                <td><a href="mailto:${customer.email}" style="color: #0178A2;">${customer.email}</a></td>
              </tr>
              <tr>
                <td class="info-label">Cell Phone Number:</td>
                <td><a href="tel:${customer.phone}" style="color: #0178A2;">${customer.phone}</a></td>
              </tr>
              <tr>
                <td class="info-label">Subject:</td>
                <td><strong>${subject || 'General Enquiry'}</strong></td>
              </tr>
            </table>

            <div class="section-title">Message / Request Details</div>
            <div class="message-box">
              ${message ? message.replace(/\n/g, '<br>') : '<em>No additional message details</em>'}
            </div>

            <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
              <img src="${logoUrl}" alt="DK Medical Logo" class="logo-img" onerror="this.style.display='none'" />
              <p style="font-size: 12px; color: #94a3b8; margin-top: 10px;">DK Medical Inquiry &amp; Sales Management Engine</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    let customerEmailSent = false;
    let salesEmailSent = false;
    const transporter = this.getTransporter();

    // 1. Send Separate Customer Confirmation Email (From: no-reply@dkmedical.co.za | Subject: DK Medical Sales Request)
    try {
      if (transporter && this.isConfigured) {
        console.log(`[Email] Dispatching client confirmation to ${customer.email} from ${clientFrom}...`);
        const info = await transporter.sendMail({
          from: clientFrom,
          envelope: {
            from: authUser,
            to: [customer.email]
          },
          replyTo: companyEmail,
          to: customer.email,
          subject: emailSubject,
          html: customerHtml,
          text: customerText,
          attachments: this.getLogoAttachment(appUrl)
        });
        customerEmailSent = true;
        console.log(`[Email] Customer confirmation successfully sent to ${customer.email} (MessageId: ${info.messageId})`);
      } else {
        console.log(`[Email Log - Customer Confirmation] From: ${clientFrom} | To: ${customer.email} | Subject: ${emailSubject} | Ref: ${reference}`);
        console.log(`[Email Log - Content Preview]:\n${customerText}`);
        customerEmailSent = true;
      }
    } catch (err) {
      console.error(`[Email Error - Customer Contact] Failed sending to client (${customer.email}):`, err);
    }

    // 2. Send Sales Team Notification Email (To: sales@dkmedical.co.za)
    try {
      const salesSubject = `New Contact Inquiry - ${customer.first_name} ${customer.surname} (${reference})`;
      if (transporter && this.isConfigured) {
        console.log(`[Email] Dispatching sales inquiry notification to ${companyEmail}...`);
        const info = await transporter.sendMail({
          from: formatSender(authUser, 'sales@dkmedical.co.za', 'DK Medical System'),
          envelope: {
            from: authUser,
            to: [companyEmail]
          },
          replyTo: customer.email,
          to: companyEmail,
          subject: salesSubject,
          html: salesHtml,
          text: `New Client Details / Sales Enquiry\n\nReference: ${reference}\nCustomer: ${customer.first_name} ${customer.surname}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nCompany: ${customer.company || 'N/A'}\nSubject: ${subject || 'General'}\nMessage:\n${message}`,
          attachments: this.getLogoAttachment(appUrl)
        });
        salesEmailSent = true;
        console.log(`[Email] Sales team notification successfully sent to ${companyEmail} (MessageId: ${info.messageId})`);
      } else {
        console.log(`[Email Log - Sales Team Notification] To: ${companyEmail} | Subject: ${salesSubject} | Ref: ${reference}`);
        salesEmailSent = true;
      }
    } catch (err) {
      console.error(`[Email Error - Sales Contact] Failed sending to sales team (${companyEmail}):`, err);
    }

    return { customerEmailSent, salesEmailSent };
  }
}

export const emailService = new EmailService();
