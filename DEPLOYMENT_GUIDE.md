# DK Medical & General Supplies — GitHub Deployment & Custom Domain Guide

This guide explains why your website showed a blank screen on GitHub and provides step-by-step instructions to get it running live on **https://dkmedical.co.za**.

---

## 1. Why Was the Screen Blank?

When deploying a modern React + Vite application to GitHub Pages, a blank screen typically occurs due to three common factors:

1. **Deploying Source Files Instead of the Production Build**:
   GitHub Pages serves static files (`.html`, `.js`, `.css`). By default, if GitHub Pages is pointed to your `main` branch root, it serves `index.html` which contains `<script type="module" src="/src/main.tsx"></script>`. Browsers cannot run TypeScript JSX (`.tsx`) directly without Vite bundling it first.
2. **Missing Relative Base Path in Vite**:
   Without `base: './'`, Vite builds absolute paths (like `/assets/index.js`), which 404 on GitHub repository subpaths (`username.github.io/repo/`).
3. **No Active Node.js Backend on GitHub Pages**:
   GitHub Pages only hosts static files. If the app tries to fetch `/api/products` or `/api/categories` and has no static fallback, it could throw an uncaught error.

---

## 2. What We Fixed in the Code

1. **Vite Relative Base Path**: Configured `base: './'` in `vite.config.ts` so all scripts, styles, and assets resolve correctly on any domain or subfolder.
2. **CNAME in `public/`**: Created `public/CNAME` with `dkmedical.co.za`. Whenever Vite builds, it automatically copies this into `dist/CNAME` so GitHub Pages never loses your custom domain.
3. **Pre-Bundled Static Catalogue Fallback**: Added `src/data/catalog.ts` containing all 32 products (including Body Bags with full LYSA specifications) and categories. If running statically on GitHub Pages, the full catalogue loads instantly without relying on a backend server.
4. **Resilient Enquiries & Quote Requests**: If a client submits a quote on GitHub Pages, the site generates a reference (e.g., `DKQ-2026-XXXX`), saves the submission locally, and provides 1-click direct **WhatsApp** and **Email** action buttons prefilled with the enquiry details so no client request is ever lost.
5. **Automated GitHub Actions Workflow**: Added `.github/workflows/deploy.yml` which automatically builds and publishes the website to GitHub Pages every time you push code to GitHub.
6. **404 Fallback**: Added `public/404.html` so direct page refreshes redirect cleanly without 404 errors.

---

## 3. Step-by-Step Deployment Guide

### Step 1: Push the Updated Code to GitHub
On your computer, open your terminal / command prompt in this project folder and run:

```bash
git add .
git commit -m "Configure automated GitHub Pages build and custom domain"
git push origin main
```
*(If your primary branch is named `master`, use `git push origin master`)*

---

### Step 2: Enable GitHub Pages with GitHub Actions
1. Open your repository on **GitHub.com**.
2. Click **Settings** (tab at the top right of the repository).
3. In the left-hand sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment** -> **Source**, change the dropdown from *"Deploy from a branch"* to **GitHub Actions**.
5. That’s it! GitHub will automatically trigger the workflow defined in `.github/workflows/deploy.yml`.
6. Go to the **Actions** tab at the top of your repository to watch the build finish (usually takes under 1 minute). Once complete, you will see a green checkmark with your live website URL!

---

### Step 3: Link Your Custom Domain (`dkmedical.co.za`)

#### In GitHub:
1. Go back to **Settings** -> **Pages**.
2. Under **Custom domain**, type:
   ```
   dkmedical.co.za
   ```
3. Click **Save**.
4. Check the box for **Enforce HTTPS** (GitHub will automatically request and renew a free SSL certificate for your domain).

#### In Your Domain Registrar (e.g., Afrihost, Domains.co.za, 1-grid, GoDaddy):
Log into your domain DNS management control panel and add the following standard DNS records:

1. **Four `A` Records for the root domain (`@` or `dkmedical.co.za`)** pointing to GitHub Pages servers:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`

2. **One `CNAME` Record for `www`**:
   - Host/Name: `www`
   - Target/Points to: `<your-github-username>.github.io` (or `dkmedical.co.za`)

*(DNS records typically propagate within 15 minutes to a few hours).*

---

## 4. Verification
Once the GitHub Action completes and DNS has propagated, open:
- **https://dkmedical.co.za**

Your site will display with all medical equipment, consumables (including Body Bags), full quote cart system, responsive navigation, and direct WhatsApp contact integration.
