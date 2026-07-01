// Mobile Menu
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');

mobileMenuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Floating Form
const floatingForm = document.getElementById('floatingForm');
const formClose = document.getElementById('formClose');
const demoForm = document.getElementById('demoForm');
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

function portalBase() {
    return String(websiteConfig?.portalUrl || DEFAULT_PORTAL_URL).replace(/\/$/, '');
}

function registerUrl() {
    return `${portalBase()}/register`;
}

function formatInr(amount) {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function openDemoForm() {
    floatingForm.style.display = 'block';
}

document.querySelectorAll('#bookDemoHeader, #bookDemoPricing, #bookDemoCTA, #bookDemoHero').forEach((btn) => {
    btn.addEventListener('click', openDemoForm);
});

formClose.addEventListener('click', () => {
    floatingForm.style.display = 'none';
    sessionStorage.setItem(DISMISS_KEY, '1');
});

setTimeout(() => {
    if (!sessionStorage.getItem(DISMISS_KEY)) {
        floatingForm.style.display = 'block';
    }
}, 5000);

function populateIndustrySelect(industries) {
    const select = document.getElementById('businessTypeSelect');
    if (!select || !Array.isArray(industries)) return;

    industries.forEach((industry) => {
        const option = document.createElement('option');
        option.value = industry.id;
        option.textContent = industry.label;
        select.appendChild(option);
    });
}

function applyTrialLinks() {
    const register = registerUrl();
    ['startTrialHero', 'startTrialCTA'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('href', register);
    });
}

function renderPricing(config) {
    const grid = document.getElementById('pricingGrid');
    const banner = document.getElementById('trialBanner');
    const pricing = config?.pricing;
    if (!pricing) return;

    if (banner) {
        const trialDays = pricing.trial?.days ?? 14;
        const span = banner.querySelector('span');
        if (span) {
            span.innerHTML = `Start with a <strong>${trialDays}-day free trial</strong> - No credit card required`;
        }
    }

    if (!grid || !Array.isArray(pricing.plans)) return;

    const register = registerUrl();
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
        if (!res.ok) return;
        const config = await res.json();
        websiteConfig = config;

        const apiUrl = String(config.apiUrl || '').replace(/\/$/, '');
        if (apiUrl) {
            API_BASE_URL = apiUrl;
            API_URL = `${API_BASE_URL}/api/website/leads/capture-demo`;
        }

        populateIndustrySelect(config.industries);
        renderPricing(config);
        applyTrialLinks();
        chatConversation = buildChatConversation(config);

        if (!chatReplayStarted) {
            chatReplayStarted = true;
            setTimeout(startChatReplay, 1000);
        }
    } catch {
        chatConversation = buildChatConversation(null);
        if (!chatReplayStarted) {
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

    const email = String(data.email ?? '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Please enter a valid email address');
    }

    const digits = String(data.phone ?? '').replace(/\D/g, '');
    let mobile = digits;
    if (mobile.length === 12 && mobile.startsWith('91')) {
        mobile = mobile.slice(2);
    } else if (mobile.length === 11 && mobile.startsWith('0')) {
        mobile = mobile.slice(1);
    } else if (mobile.length > 10) {
        mobile = mobile.slice(-10);
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
        errors.push('Please enter a valid 10-digit Indian phone number');
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

demoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(demoForm);
    const data = Object.fromEntries(formData);

    const errors = validateForm(data);
    if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
    }

    data.source = 'website';
    data.companyName = String(data.company).trim();
    delete data.company;

    const phoneDigits = String(data.phone).replace(/\D/g, '');
    let mobile = phoneDigits;
    if (mobile.length === 12 && mobile.startsWith('91')) mobile = mobile.slice(2);
    else if (mobile.length === 11 && mobile.startsWith('0')) mobile = mobile.slice(1);
    else if (mobile.length > 10) mobile = mobile.slice(-10);
    data.phone = `+91${mobile}`;

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
            },
            body: JSON.stringify(data),
        });

        if (IS_LOCAL) {
            console.log('Response status:', response.status);
        }

        let result;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            result = await response.json();
        } else {
            throw new Error(`Unexpected response (${response.status}). Please try again later.`);
        }

        if (IS_LOCAL) {
            console.log('Response data:', result);
        }

        if (response.ok && result.success) {
            alert('Thank you! Our team will contact you shortly.');
            demoForm.reset();
            floatingForm.style.display = 'none';

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
            const errorMsg = result.message || result.error || 'Something went wrong. Please try again.';
            alert(`Error: ${errorMsg}`);
        }
    } catch (error) {
        if (IS_LOCAL) {
            console.error('Demo request error:', error);
        }
        alert(`Network error: ${error.message}. Please try again or contact us directly at support@autowave.in`);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
});

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
    const header = document.querySelector('.header');
    header.classList.toggle('scrolled', window.scrollY > 10);
});

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
