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
const bookDemoButtons = document.querySelectorAll('#bookDemoHeader, #bookDemoPricing, #bookDemoCTA');

bookDemoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        floatingForm.style.display = 'block';
    });
});

formClose.addEventListener('click', () => {
    floatingForm.style.display = 'none';
});

setTimeout(() => {
    floatingForm.style.display = 'block';
}, 5000);

// Form validation
function validateForm(data) {
    const errors = [];
    
    if (!data.name || data.name.length < 2) {
        errors.push('Please enter a valid name (at least 2 characters)');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = data.phone.replace(/\D/g, '');
    if (!data.phone || !phoneRegex.test(cleanPhone)) {
        errors.push('Please enter a valid 10-digit phone number');
    }
    
    if (!data.company || data.company.length < 2) {
        errors.push('Please enter your business/website name');
    }
    
    return errors;
}

// API configuration - update this to match your API deployment
const API_BASE_URL = 'https://api.autowave.playltp.in';
const API_URL = `${API_BASE_URL}/api/website/leads/capture-demo`;

demoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(demoForm);
    const data = Object.fromEntries(formData);
    
    // Add required fields
    data.businessType = 'General Business';
    data.source = 'website';
    
    // Validate form
    const errors = validateForm(data);
    if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
    }
    
    const submitButton = demoForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    try {
        console.log('Submitting to API:', API_URL);
        console.log('Payload:', data);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response data:', result);
        
        if (response.ok && result.success) {
            alert('Thank you! Our team will contact you shortly.');
            demoForm.reset();
            floatingForm.style.display = 'none';
            
            // Track conversion if Google Analytics is available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'generate_lead', {
                    'event_category': 'engagement',
                    'event_label': 'demo_request'
                });
            }
        } else {
            console.error('API Error:', result);
            const errorMsg = result.message || result.error || 'Something went wrong. Please try again.';
            alert(`Error: ${errorMsg}`);
        }
    } catch (error) {
        console.error('Demo request error:', error);
        alert(`Network error: ${error.message}. Please try again or contact us directly at support@autowave.in`);
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
            navMenu.classList.remove('active');
        }
    });
});

// Header Scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    header.classList.toggle('scrolled', window.scrollY > 10);
});

// FAQ Accordion
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .pricing-card, .integration-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// WhatsApp Chat Replay - Real Lead Generation Agent
const chatConversation = [
    { type: 'user', message: 'Hi' },
    { type: 'bot', message: 'Hi there! 👋' },
    { type: 'bot', message: 'Welcome to AutoWave!\n\nWe help businesses automate WhatsApp conversations.' },
    { type: 'user', message: 'That sounds interesting.\n\nWhat can it do for my business?' },
    { type: 'bot', message: 'Great question! 🎯\n\nHere\'s what AutoWave does:' },
    { type: 'bot', message: '✅ Respond to inquiries 24/7\n\n✅ Capture & qualify leads\n\n✅ Send catalogs & offers\n\n✅ Schedule appointments' },
    { type: 'user', message: 'How much does it cost?' },
    { type: 'bot', message: 'Great question!\n\nWe have flexible pricing:\n\n💰 Starter: ₹999/month\n\n📊 Professional: ₹2,999/month (Most Popular)\n\n🚀 Enterprise: Custom pricing' },
    { type: 'bot', message: 'Professional plan includes:\n\n• Up to 10,000 conversations/month\n\n• Advanced automation\n\n• Priority 24/7 support' },
    { type: 'user', message: 'Can I try before buying?' },
    { type: 'bot', message: 'Absolutely! 🚀\n\nWe offer a completely FREE trial.\n\nNo credit card required!' },
    { type: 'bot', message: 'You can set up in just 2 minutes and start automating right away.' },
    { type: 'bot', message: 'By the way, what type of business do you run?\n\nI can share specific results for your industry 😊' },
    { type: 'user', message: 'We run an e-commerce store' },
    { type: 'bot', message: 'Perfect! 🛍️\n\nE-commerce stores love AutoWave!' },
    { type: 'bot', message: 'Here\'s what our clients see:\n\n📈 3x faster customer responses\n\n📈 45% increase in conversions\n\n📈 60% less support time needed' },
    { type: 'bot', message: 'Real example:\n\nOne store got 150+ qualified leads in first month!\n\nWith just 2 hours of setup 🎯' },
    { type: 'bot', message: 'Ready to grow your sales? 🚀\n\nClick "Start Free Trial" above.\n\nNo commitment needed!' },
    { type: 'bot', message: 'Or book a quick demo with our team.\n\nWe\'ll show you exactly how it works for your store.' }
];

let chatReplayRunning = false;
let chatReplayTimeout = null;

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
    return typingEl;
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
    
    // Add read receipt for user messages
    if (isUser) {
        const timeEl = document.createElement('div');
        timeEl.className = 'message-time';
        timeEl.innerHTML = `<span class="read-receipt">✓✓</span>`;
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
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    updateChatStatus('Online');
    chatReplayRunning = true;
    
    let messageIndex = 0;
    
    function playNextMessage() {
        if (messageIndex >= chatConversation.length) {
            // Restart replay after a delay
            updateChatStatus('Online');
            chatReplayTimeout = setTimeout(() => {
                startChatReplay();
            }, 8000);
            return;
        }
        
        const msg = chatConversation[messageIndex];
        
        if (msg.type === 'bot') {
            // Show typing indicator first
            showTypingIndicator();
            
            // Simulate typing time based on message length
            const typingTime = Math.max(600, msg.message.length * 25);
            
            chatReplayTimeout = setTimeout(() => {
                removeTypingIndicator();
                addChatMessage(msg.message, false);
                messageIndex++;
                
                // Delay before next message
                chatReplayTimeout = setTimeout(playNextMessage, 1200);
            }, typingTime);
        } else {
            // User message appears instantly with read receipt
            addChatMessage(msg.message, true);
            messageIndex++;
            
            // Delay before bot responds
            chatReplayTimeout = setTimeout(playNextMessage, 2200);
        }
    }
    
    // Start the conversation
    playNextMessage();
}

// Start chat replay when page loads
setTimeout(() => {
    startChatReplay();
}, 1000);
