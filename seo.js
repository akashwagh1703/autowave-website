/**
 * Sync canonical, Open Graph, Twitter, and schema asset URLs with API websiteUrl when available.
 */
(function initSeo() {
    const DEFAULT_ORIGIN = 'https://autowave.playltp.in';
    const LOGO_PATH = '/content/autowave-icon.png';
    const MARKETING_PATH = '/content/autowave-marketing.png';

    function originFromConfig(config) {
        const raw = config?.websiteUrl || DEFAULT_ORIGIN;
        return String(raw).replace(/\/$/, '');
    }

    function setMetaContent(selector, value) {
        const el = document.querySelector(selector);
        if (el && value) el.setAttribute('content', value);
    }

    function replaceOriginDeep(value, from, to) {
        if (typeof value === 'string') {
            return value.split(from).join(to);
        }
        if (Array.isArray(value)) {
            return value.map((item) => replaceOriginDeep(item, from, to));
        }
        if (value && typeof value === 'object') {
            const next = {};
            Object.keys(value).forEach((key) => {
                next[key] = replaceOriginDeep(value[key], from, to);
            });
            return next;
        }
        return value;
    }

    window.applyWebsiteSeo = function applyWebsiteSeo(config) {
        const origin = originFromConfig(config);
        const canonical = `${origin}/`;
        const logoUrl = `${origin}${LOGO_PATH}`;
        const marketingUrl = `${origin}${MARKETING_PATH}`;

        const canonicalEl = document.getElementById('canonicalUrl');
        if (canonicalEl) canonicalEl.setAttribute('href', canonical);

        setMetaContent('meta[property="og:url"]#ogUrl', canonical);
        setMetaContent('meta[property="og:url"]', canonical);
        setMetaContent('meta[property="og:image"]#ogImage', marketingUrl);
        setMetaContent('meta[property="og:image"]', marketingUrl);
        setMetaContent('meta[name="twitter:image"]#twitterImage', marketingUrl);
        setMetaContent('meta[name="twitter:image"]', marketingUrl);

        const trialDays = config?.pricing?.trial?.days ?? 14;
        const schemaEl = document.getElementById('schemaOrg');
        if (!schemaEl) return;

        try {
            let data = JSON.parse(schemaEl.textContent);
            if (origin !== DEFAULT_ORIGIN) {
                data = replaceOriginDeep(data, DEFAULT_ORIGIN, origin);
            }

            const org = data['@graph']?.find((n) => n['@type'] === 'Organization');
            if (org) {
                org.logo = {
                    '@type': 'ImageObject',
                    url: logoUrl,
                    caption: 'AutoWave logo',
                };
                org.image = marketingUrl;
            }

            const app = data['@graph']?.find((n) => n['@type'] === 'SoftwareApplication');
            if (app) {
                app.image = marketingUrl;
                if (window.AUTOWAVE_SHOW_PRICING !== false && config?.pricing?.plans?.length) {
                    const monthly = config.pricing.plans.find((p) => p.id === 'monthly') || config.pricing.plans[0];
                    if (monthly?.price != null) {
                        app.offers = {
                            '@type': 'Offer',
                            price: String(monthly.price),
                            priceCurrency: monthly.currency || 'INR',
                            description: `${trialDays}-day free trial available`,
                        };
                    }
                } else if (app.offers) {
                    delete app.offers;
                }
            }

            schemaEl.textContent = JSON.stringify(data);
        } catch {
            /* keep static schema */
        }
    };

    window.applyWebsiteSeo({});
})();
