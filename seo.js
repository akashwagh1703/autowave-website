/**
 * Sync canonical, Open Graph, and Twitter URLs with API websiteUrl when available.
 */
(function initSeo() {
    const DEFAULT_ORIGIN = 'https://autowave.playltp.in';

    function originFromConfig(config) {
        const raw = config?.websiteUrl || DEFAULT_ORIGIN;
        return String(raw).replace(/\/$/, '');
    }

    function setMetaContent(selector, value) {
        const el = document.querySelector(selector);
        if (el && value) el.setAttribute('content', value);
    }

    window.applyWebsiteSeo = function applyWebsiteSeo(config) {
        const origin = originFromConfig(config);
        const canonical = `${origin}/`;
        const ogImage = `${origin}/content/og-image.svg`;

        const canonicalEl = document.getElementById('canonicalUrl');
        if (canonicalEl) canonicalEl.setAttribute('href', canonical);

        setMetaContent('meta[property="og:url"]#ogUrl', canonical);
        setMetaContent('meta[property="og:url"]', canonical);
        setMetaContent('meta[property="og:image"]#ogImage', ogImage);
        setMetaContent('meta[property="og:image"]', ogImage);
        setMetaContent('meta[name="twitter:image"]#twitterImage', ogImage);
        setMetaContent('meta[name="twitter:image"]', ogImage);

        const trialDays = config?.pricing?.trial?.days ?? 14;
        const schemaEl = document.getElementById('schemaOrg');
        if (schemaEl && config?.pricing?.plans?.length) {
            try {
                const data = JSON.parse(schemaEl.textContent);
                const monthly = config.pricing.plans.find((p) => p.id === 'monthly') || config.pricing.plans[0];
                const app = data['@graph']?.find((n) => n['@type'] === 'SoftwareApplication');
                if (app && monthly?.price != null) {
                    app.offers = {
                        '@type': 'Offer',
                        price: String(monthly.price),
                        priceCurrency: monthly.currency || 'INR',
                        description: `${trialDays}-day free trial available`,
                    };
                }
                data['@graph']?.forEach((node) => {
                    if (node['@id']?.includes(DEFAULT_ORIGIN)) {
                        Object.keys(node).forEach((key) => {
                            if (typeof node[key] === 'string' && node[key].includes(DEFAULT_ORIGIN)) {
                                node[key] = node[key].replace(DEFAULT_ORIGIN, origin);
                            }
                        });
                    }
                });
                schemaEl.textContent = JSON.stringify(data);
            } catch {
                /* keep static schema */
            }
        }
    };
})();
