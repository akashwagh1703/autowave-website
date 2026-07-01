# AutoWave Marketing Website

Static marketing site for [AutoWave](https://autowave.playltp.in) — demo lead capture, pricing, and product overview.

**Live:** https://autowave.playltp.in

## Stack

- Plain HTML, CSS (`style.css`), vanilla JS (`script.js`)
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

1. Upload all files to the web root (`index.html`, `style.css`, `script.js`, `content/`, `demo/`)
2. Ensure `content/autowave-icon.png` is present
3. Confirm the site origin matches `CORS_ORIGINS` on the API

No environment file is required on the website itself — configuration is loaded from the API at runtime.

## File overview

| File / folder | Purpose |
|---------------|---------|
| `index.html` | Landing page structure |
| `script.js` | Config load, demo form, pricing render, chat replay |
| `style.css` | Layout and components |
| `content/` | Logo and image assets |
| `demo/confirm/` | Demo confirmation page |

## Analytics

Google Analytics and Facebook Pixel blocks were removed until real tracking IDs are configured. Re-add scripts in `index.html` when IDs are available; `script.js` already calls `fbq('track', 'Lead')` on successful submit when `fbq` is defined.
