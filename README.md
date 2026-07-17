# AutoWave Marketing Website

Static marketing site for [AutoWave](https://autowave.playltp.in) — demo lead capture, pricing, and product overview.

**Live:** https://autowave.playltp.in

## Stack

- Plain HTML, CSS (`landing-base.css`, `landing-pro.css`), vanilla JS (`script.js`, `landing-motion.js`)
- No build step — deploy files as-is
- Font Awesome + Google Fonts via CDN

## How it connects to the API

On page load, `script.js` fetches public config:

```
GET https://api.autowave.playltp.in/api/website/config
```

Config provides:

- `apiUrl` — demo form POST target
- `portalUrl` — trial/register links
- `industries` — populates the demo form industry dropdown
- `pricing` — renders pricing cards and chat replay prices

Demo submissions:

```
POST {apiUrl}/api/website/leads/capture-demo
```

Demo confirmation (from email link):

```
autowave-website/demo/confirm/index.html?token=...
  → GET {apiUrl}/api/website/leads/confirm/:token
```

## Local development

```bash
# From this directory
npx serve .
# or
python -m http.server 8080
```

Open `http://localhost:3000` (or your port). The form uses the production API unless config loads successfully from your local API.

To test against a local API, run `micro-saas-api` on port 3000 and ensure `CORS_ORIGINS` includes your local origin (e.g. `http://localhost:8080`).

## Deploy

1. Upload all files to the web root (`index.html`, `robots.txt`, `sitemap.xml`, `seo.js`, CSS/JS, `content/` including **`autowave-marketing.png`** and **`autowave-icon.png`**, `demo/`)
2. Ensure `content/autowave-icon.png` is present
3. Confirm the site origin matches `CORS_ORIGINS` on the API
4. In [Google Search Console](https://search.google.com/search-console), submit `https://autowave.playltp.in/sitemap.xml`

No environment file is required on the website itself — configuration is loaded from the API at runtime.

## File overview

| File / folder | Purpose |
|---------------|---------|
| `index.html` | Landing page structure |
| `landing-base.css` | Reset, buttons, demo form shell |
| `landing-pro.css` | Full landing design system |
| `landing-polish.css` | Final polish: motion, focus, loading states |
| `landing-motion.js` | WhatsApp demo animation, hero tilt |
| `script.js` | Config load, demo form, pricing render |
| `style.css` | Legacy (not used by current `index.html`) |
| `seo.js` | Canonical / OG URLs from API `websiteUrl`; pricing in schema |
| `robots.txt` | Crawler rules + sitemap pointer |
| `sitemap.xml` | Homepage URL for search engines |
| `content/autowave-marketing.png` | Open Graph / Twitter / schema marketing image |
| `content/autowave-icon.png` | Favicon, apple-touch-icon, schema logo, UI branding |
| `demo/confirm/` | Demo confirmation page |

## SEO

The landing page includes:

- **Title & meta description** tuned for WhatsApp booking keywords
- **Canonical URL**, `robots` index/follow, `lang="en-IN"`
- **Open Graph** and **Twitter Card** tags
- **JSON-LD**: Organization, WebSite, SoftwareApplication, HowTo
- **`robots.txt`** and **`sitemap.xml`** (update domain in both if not using `autowave.playltp.in`)
- **`seo.js`** updates canonical/OG from API `websiteUrl` and refreshes offer price in schema when pricing loads
- Demo confirm page uses **`noindex`** so token URLs are not indexed

After deploy, verify with [Rich Results Test](https://search.google.com/test/rich-results) and share debuggers (Facebook Sharing Debugger, Twitter Card Validator).

## Analytics

Google Analytics and Facebook Pixel blocks were removed until real tracking IDs are configured. Re-add scripts in `index.html` when IDs are available; `script.js` already calls `fbq('track', 'Lead')` on successful submit when `fbq` is defined.
