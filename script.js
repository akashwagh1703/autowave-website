// Mobile Menu
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');

mobileMenuToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('active');
    mobileMenuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

// Floating Form
const floatingForm = document.getElementById('floatingForm');
const formClose = document.getElementById('formClose');
const demoForm = document.getElementById('demoForm');
const demoFormSuccess = document.getElementById('demoFormSuccess');
const demoFormTitle = document.getElementById('demoFormTitle');
const demoFormDesc = document.getElementById('demoFormDesc');
const DISMISS_KEY = 'autowave_demo_form_dismissed';

const DEFAULT_API_BASE = 'https://api.autowave.playltp.in';
const DEFAULT_PORTAL_URL = 'https://app.autowave.playltp.in';
let API_BASE_URL = DEFAULT_API_BASE;
let API_URL = `${API_BASE_URL}/api/website/leads/capture-demo`;
let websiteConfig = null;
let chatConversation = [];
let chatReplayStarted = false;
let chatReplayTimeout = null;

const IS_LOCAL = ['localhost', '127.0.0.1'].includes(window.location.hostname);

function applyApiBaseFromConfig(config) {
    let base = String(config?.apiUrl || DEFAULT_API_BASE).trim().replace(/\/$/, '');
    if (base.toLowerCase().endsWith('/api')) {
        base = base.slice(0, -4);
    }
    API_BASE_URL = base;
    API_URL = `${API_BASE_URL}/api/website/leads/capture-demo`;
}

function showDemoFormError(message) {
    const el = document.getElementById('demoFormError');
    if (!el) return;
    if (message) {
        el.textContent = message;
        el.hidden = false;
    } else {
        el.textContent = '';
        el.hidden = true;
    }
}

async function parseResponseBody(response) {
    const text = await response.text();
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch {
        return { message: text.slice(0, 240) };
    }
}

function formatApiError(result, status) {
    if (result?.errors && typeof result.errors === 'object') {
        const parts = Object.values(result.errors).flat().filter(Boolean);
        if (parts.length) return parts.join('\n');
    }
    if (result?.message) return String(result.message);
    return `Request failed (${status}). Please try again or email support@autowave.in`;
}

function portalBase() {
    return String(websiteConfig?.portalUrl || DEFAULT_PORTAL_URL).replace(/\/$/, '');
}

function registerUrl() {
    return `${portalBase()}/register`;
}

function loginUrl() {
    return `${portalBase()}/login`;
}

function privacyUrl() {
    return `${portalBase()}/privacy`;
}

function formatInr(amount) {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
}

const DEFAULT_FALLBACK_PRICING = {
    trial: { days: 14, price: 0 },
    plans: [
        {
            id: 'monthly',
            name: 'Monthly',
            price: 499,
            currency: 'INR',
            periodLabel: '/month',
            featured: false,
            features: [
                'Unlimited WhatsApp automation',
                'Create & use workflows',
                'Advanced analytics dashboard',
                'Any business type support',
            ],
            ctaLabel: 'Get Started',
        },
        {
            id: 'yearly',
            name: 'Yearly',
            price: 4999,
            currency: 'INR',
            periodLabel: '/year',
            featured: true,
            badge: 'Best Value',
            savings: 'Save ₹989/year',
            features: [
                'Unlimited WhatsApp automation',
                'Create & use workflows',
                'Advanced analytics dashboard',
                'Any business type support',
                'Priority support',
            ],
            ctaLabel: 'Start Free Trial',
        },
    ],
};

const DEFAULT_FALLBACK_INDUSTRIES = [
    { id: 'salon', label: 'Salon / Spa' },
    { id: 'healthcare', label: 'Healthcare Clinic' },
    { id: 'retail', label: 'Retail Shop' },
    { id: 'coaching', label: 'Coaching Center' },
    { id: 'other', label: 'Other Business' },
];

function resetDemoFormPanel() {
    if (demoForm) {
        demoForm.hidden = false;
        demoForm.reset();
    }
    if (demoFormSuccess) demoFormSuccess.hidden = true;
    if (demoFormTitle) demoFormTitle.hidden = false;
    if (demoFormDesc) demoFormDesc.hidden = false;
    showDemoFormError('');
    floatingForm?.classList.remove('is-success', 'is-closing');
}

function closeDemoForm() {
    if (!floatingForm) return;
    floatingForm.classList.add('is-closing');
    window.setTimeout(() => {
        floatingForm.style.display = 'none';
        floatingForm.classList.remove('is-visible', 'is-success', 'is-closing');
        resetDemoFormPanel();
    }, 380);
}

function showDemoFormSuccess(message) {
    const text =
        message ||
        'Our team will reach out within one business day.';
    const msgEl = document.getElementById('demoSuccessMessage');
    if (msgEl) msgEl.textContent = text;

    showDemoFormError('');
    if (demoForm) demoForm.hidden = true;
    if (demoFormTitle) demoFormTitle.hidden = true;
    if (demoFormDesc) demoFormDesc.hidden = true;
    if (demoFormSuccess) demoFormSuccess.hidden = false;
    floatingForm?.classList.add('is-success');
    sessionStorage.setItem(DISMISS_KEY, '1');

    window.setTimeout(() => {
        closeDemoForm();
    }, 3400);
}

function openDemoForm() {
    if (!floatingForm) return;
    resetDemoFormPanel();
    floatingForm.style.display = 'block';
    floatingForm.classList.add('is-visible');
}

document.querySelectorAll(
    '#bookDemoHeader, #bookDemoPricing, #bookDemoCTA, #bookDemoHero, #bookDemoMobile, #bookDemoNavMobile, #bookDemoFooterBtn',
).forEach((btn) => {
    btn.addEventListener('click', () => {
        openDemoForm();
        navMenu?.classList.remove('active');
        mobileMenuToggle?.setAttribute('aria-expanded', 'false');
    });
});

formClose?.addEventListener('click', () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    closeDemoForm();
});

setTimeout(() => {
    if (!sessionStorage.getItem(DISMISS_KEY) && window.matchMedia('(min-width: 769px)').matches) {
        openDemoForm();
    }
}, 12000);

function populateIndustrySelect(industries) {
    const select = document.getElementById('businessTypeSelect');
    if (!select || !Array.isArray(industries)) return;

    while (select.options.length > 1) {
        select.remove(1);
    }

    industries.forEach((industry) => {
        const option = document.createElement('option');
        option.value = industry.id;
        option.textContent = industry.label;
        select.appendChild(option);
    });
}

function applyTrialLinks() {
    const register = registerUrl();
    const login = loginUrl();
    const privacy = privacyUrl();

    [
        'startTrialHero', 'startTrialCTA', 'startTrialHeader', 'startTrialMobile',
        'startTrialNavMobile', 'startTrialFooter', 'footerRegister',
    ].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('href', register);
    });

    ['loginHeader', 'loginNavMobile', 'footerLogin'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('href', login);
    });

    document.querySelectorAll('.site-footer__links a[href*="privacy"], .site-footer__bottom-links a[href*="privacy"], .aw-footer__links a[href*="privacy"], .aw-footer__bar-inner a[href*="privacy"]').forEach((el) => {
        el.setAttribute('href', privacy);
    });
}

function applyTrialDaysCopy(days) {
    const d = days ?? 14;
    const ids = ['trialDaysText', 'footerTrialDays', 'heroTrialDays'];
    ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = String(d);
    });
}

function renderPricing(config) {
    const grid = document.getElementById('pricingGrid');
    const banner = document.getElementById('trialBanner');
    const pricing = config?.pricing;
    if (!pricing) {
        if (grid) grid.classList.remove('is-loading');
        return;
    }

    if (banner) {
        const trialDays = pricing.trial?.days ?? 14;
        applyTrialDaysCopy(trialDays);
        const span = banner.querySelector('span');
        if (span) {
            span.innerHTML = `Start with a <strong>${trialDays}-day free trial</strong> — No credit card required`;
        }
    }

    if (!grid || !Array.isArray(pricing.plans)) {
        grid?.classList.remove('is-loading');
        return;
    }

    const register = registerUrl();
    grid.classList.remove('is-loading');
    grid.innerHTML = '';

    pricing.plans.forEach((plan) => {
        const card = document.createElement('div');
        card.className = `pricing-card${plan.featured ? ' featured' : ''}`;

        const featuresHtml = (plan.features || [])
            .map((feature) => `<li><i class="fas fa-check"></i> ${feature}</li>`)
            .join('');

        card.innerHTML = `
            ${plan.badge ? `<div class="badge-popular">${plan.badge}</div>` : ''}
            <h3>${plan.name}</h3>
            <div class="price">${formatInr(plan.price)}<span>${plan.periodLabel || ''}</span></div>
            ${plan.savings ? `<div class="savings">${plan.savings}</div>` : ''}
            <ul>${featuresHtml}</ul>
            <a href="${register}" class="btn ${plan.featured ? 'btn-primary' : 'btn-secondary-outline'} btn-block">${plan.ctaLabel || 'Get Started'}</a>
        `;

        grid.appendChild(card);
    });

    document.querySelectorAll('#pricingGrid .pricing-card').forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

function buildChatConversation(config) {
    const plans = config?.pricing?.plans || [];
    const monthly = plans.find((p) => p.id === 'monthly') || plans[0];
    const yearly = plans.find((p) => p.id === 'yearly') || plans[1];
    const trialDays = config?.pricing?.trial?.days ?? 14;

    const monthlyPrice = monthly ? formatInr(monthly.price) : '₹499';
    const yearlyPrice = yearly ? formatInr(yearly.price) : '₹4,999';
    const yearlyLabel = yearly?.periodLabel || '/year';

    return [
        { type: 'user', message: 'Hi' },
        { type: 'bot', message: 'Hi there! 👋' },
        { type: 'bot', message: 'Welcome to AutoWave!\n\nWe help businesses automate WhatsApp conversations.' },
        { type: 'user', message: 'That sounds interesting.\n\nWhat can it do for my business?' },
        { type: 'bot', message: 'Great question! 🎯\n\nHere\'s what AutoWave does:' },
        { type: 'bot', message: '✅ Respond to inquiries 24/7\n\n✅ Capture & qualify leads\n\n✅ Send catalogs & offers\n\n✅ Schedule appointments' },
        { type: 'user', message: 'How much does it cost?' },
        {
            type: 'bot',
            message: `Great question!\n\nWe have simple pricing:\n\n💰 Monthly: ${monthlyPrice}/month\n\n📊 Yearly: ${yearlyPrice}${yearlyLabel} (Best Value)`,
        },
        { type: 'bot', message: 'Both plans include:\n\n• Unlimited WhatsApp automation\n\n• Workflows & analytics\n\n• Priority support on yearly' },
        { type: 'user', message: 'Can I try before buying?' },
        { type: 'bot', message: `Absolutely! 🚀\n\nWe offer a ${trialDays}-day FREE trial.\n\nNo credit card required!` },
        { type: 'bot', message: 'You can set up in just 2 minutes and start automating right away.' },
        { type: 'bot', message: 'By the way, what type of business do you run?\n\nI can share specific results for your industry 😊' },
        { type: 'user', message: 'We run an e-commerce store' },
        { type: 'bot', message: 'Perfect! 🛍️\n\nE-commerce stores love AutoWave!' },
        { type: 'bot', message: 'Here\'s what our clients see:\n\n📈 3x faster customer responses\n\n📈 45% increase in conversions\n\n📈 60% less support time needed' },
        { type: 'bot', message: 'Real example:\n\nOne store got 150+ qualified leads in first month!\n\nWith just 2 hours of setup 🎯' },
        { type: 'bot', message: 'Ready to grow your sales? 🚀\n\nClick "Start Free Trial" above.\n\nNo commitment needed!' },
        { type: 'bot', message: 'Or book a quick demo with our team.\n\nWe\'ll show you exactly how it works for your store.' },
    ];
}

async function loadWebsiteConfig() {
    try {
        const res = await fetch(`${DEFAULT_API_BASE}/api/website/config`);
        if (!res.ok) {
            applyApiBaseFromConfig({ apiUrl: DEFAULT_API_BASE });
            populateIndustrySelect(DEFAULT_FALLBACK_INDUSTRIES);
            renderPricing({ pricing: DEFAULT_FALLBACK_PRICING });
            applyTrialDaysCopy(DEFAULT_FALLBACK_PRICING.trial.days);
            applyTrialLinks();
            return;
        }
        const config = await res.json();
        websiteConfig = config;

        const apiUrl = String(config.apiUrl || '').replace(/\/$/, '');
        if (apiUrl) {
            applyApiBaseFromConfig(config);
        } else {
            applyApiBaseFromConfig({ apiUrl: DEFAULT_API_BASE });
        }

        populateIndustrySelect(config.industries);
        renderPricing(config);
        applyTrialLinks();
        if (typeof applyWebsiteSeo === 'function') applyWebsiteSeo(config);
        const trialDays = config?.pricing?.trial?.days ?? 14;
        applyTrialDaysCopy(trialDays);

        if (document.getElementById('chatMessages') && !chatReplayStarted) {
            chatConversation = buildChatConversation(config);
            chatReplayStarted = true;
            setTimeout(startChatReplay, 1000);
        }
    } catch {
        applyApiBaseFromConfig({ apiUrl: DEFAULT_API_BASE });
        populateIndustrySelect(DEFAULT_FALLBACK_INDUSTRIES);
        renderPricing({ pricing: DEFAULT_FALLBACK_PRICING });
        applyTrialDaysCopy(DEFAULT_FALLBACK_PRICING.trial.days);
        applyTrialLinks();
        if (document.getElementById('chatMessages') && !chatReplayStarted) {
            chatConversation = buildChatConversation(null);
            chatReplayStarted = true;
            setTimeout(startChatReplay, 1000);
        }
    }
}

loadWebsiteConfig();

function validateForm(data) {
    const errors = [];

    const name = String(data.name ?? '').trim();
    if (name.length < 2) {
        errors.push('Please enter a valid name (at least 2 characters)');
    }

    const email = String(data.email ?? '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!email || email.length > 254 || !emailRegex.test(email)) {
        errors.push('Please enter a valid email address');
    }

    const digits = String(data.phone ?? '').replace(/\D/g, '');
    if (digits.length !== 10 || !/^[6-9]\d{9}$/.test(digits)) {
        errors.push('Please enter exactly 10 digits (Indian mobile, starting with 6–9)');
    }

    const businessType = String(data.businessType ?? '').trim();
    if (!businessType) {
        errors.push('Please select your industry');
    }

    const company = String(data.company ?? data.companyName ?? '').trim();
    if (company.length < 2) {
        errors.push('Please enter your business/website name');
    }

    return errors;
}

if (demoForm) {
demoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showDemoFormError('');

    const formData = new FormData(demoForm);
    const data = Object.fromEntries(formData);

    const errors = validateForm(data);
    if (errors.length > 0) {
        showDemoFormError(errors.join(' '));
        return;
    }

    data.source = 'website';
    data.companyName = String(data.company).trim();
    delete data.company;

    data.email = String(data.email ?? '').trim().toLowerCase();
    data.phone = String(data.phone ?? '').replace(/\D/g, '');

    const submitButton = demoForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    try {
        if (IS_LOCAL) {
            console.log('Submitting to API:', API_URL);
            console.log('Payload:', data);
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(data),
            mode: 'cors',
        });

        const result = await parseResponseBody(response);

        if (IS_LOCAL) {
            console.log('Response status:', response.status, result);
        }

        const isSuccess =
            response.ok &&
            (result.success === true || typeof result.leadId === 'number');

        if (isSuccess) {
            showDemoFormSuccess(result.message);

            if (typeof gtag !== 'undefined') {
                gtag('event', 'generate_lead', {
                    event_category: 'engagement',
                    event_label: 'demo_request',
                });
            }

            if (typeof fbq !== 'undefined') {
                fbq('track', 'Lead');
            }
        } else {
            if (IS_LOCAL) {
                console.error('API Error:', result);
            }
            showDemoFormError(formatApiError(result, response.status));
        }
    } catch (error) {
        if (IS_LOCAL) {
            console.error('Demo request error:', error);
        }
        const msg = error instanceof TypeError && String(error.message).includes('fetch')
            ? 'Could not reach the server. Check your connection or try again later.'
            : (error.message || 'Network error');
        showDemoFormError(`${msg} You can also email support@autowave.in`);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
});
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function onAnchorClick(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
            navMenu.classList.remove('active');
        }
    });
});

window.addEventListener('scroll', () => {
    const header = document.querySelector('.aw-header') || document.querySelector('.site-header') || document.querySelector('.header');
    if (header) header.classList.toggle('scrolled', window.scrollY > 10);
});

(function initSectionNavHighlight() {
    const navLinks = document.querySelectorAll('.aw-nav .nav-link[href^="#"]');
    if (!navLinks.length) return;

    const sections = [...navLinks]
        .map((link) => {
            const id = link.getAttribute('href');
            const el = id && id.length > 1 ? document.querySelector(id) : null;
            return el ? { id, el, link } : null;
        })
        .filter(Boolean);

    if (!sections.length) return;

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const match = sections.find((s) => s.el === entry.target);
                if (!match) return;
                navLinks.forEach((l) => l.classList.remove('is-active'));
                match.link.classList.add('is-active');
            });
        },
        { rootMargin: '-40% 0px -45% 0px', threshold: 0 },
    );

    sections.forEach((s) => io.observe(s.el));
})();

document.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');

        document.querySelectorAll('.faq-item').forEach((item) => {
            item.classList.remove('active');
        });

        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-on-scroll, .reveal-stagger, .benefit-block.reveal-stagger, .aw-reveal').forEach((el) => {
    revealObserver.observe(el);
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .integration-card').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingEl = document.createElement('div');
    typingEl.className = 'chat-message message-bot';
    typingEl.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    typingEl.id = 'typing-indicator';
    chatMessages.appendChild(typingEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) typingEl.remove();
}

function addChatMessage(msg, isUser = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message message-${isUser ? 'user' : 'bot'}`;

    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'message-bubble';
    bubbleEl.innerHTML = msg;

    messageEl.appendChild(bubbleEl);

    if (isUser) {
        const timeEl = document.createElement('div');
        timeEl.className = 'message-time';
        timeEl.innerHTML = '<span class="read-receipt">✓✓</span>';
        messageEl.appendChild(timeEl);
    }

    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateChatStatus(status) {
    const statusEl = document.getElementById('chatStatus');
    if (statusEl) {
        statusEl.textContent = status;
    }
}

function startChatReplay() {
    if (!chatConversation.length) {
        chatConversation = buildChatConversation(null);
    }

    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    updateChatStatus('Online');

    let messageIndex = 0;

    function playNextMessage() {
        if (messageIndex >= chatConversation.length) {
            updateChatStatus('Online');
            chatReplayTimeout = setTimeout(() => {
                startChatReplay();
            }, 8000);
            return;
        }

        const msg = chatConversation[messageIndex];

        if (msg.type === 'bot') {
            showTypingIndicator();
            const typingTime = Math.max(600, msg.message.length * 25);

            chatReplayTimeout = setTimeout(() => {
                removeTypingIndicator();
                addChatMessage(msg.message, false);
                messageIndex += 1;
                chatReplayTimeout = setTimeout(playNextMessage, 1200);
            }, typingTime);
        } else {
            addChatMessage(msg.message, true);
            messageIndex += 1;
            chatReplayTimeout = setTimeout(playNextMessage, 2200);
        }
    }

    playNextMessage();
}

function initLandingWhatsAppDemo() {
    /* Handled by landing-motion.js */
}

function initPhoneTilt() {
    /* Handled by landing-motion.js */
}

function initDemoApprovePlay() {
    /* Handled by landing-motion.js */
}

initLandingWhatsAppDemo();
initPhoneTilt();
initDemoApprovePlay();
