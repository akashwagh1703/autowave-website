// Smooth Scroll for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href') !== '#') {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Mobile Menu Toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('active');
}

// Demo Form Submission
const demoForm = document.getElementById('demo-form');
if (demoForm) {
    demoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you! Your demo request has been received. Our team will contact you shortly.');
        this.reset();
    });
}

// Button Actions
function startTrial() {
    alert('Redirecting to free trial signup... (Demo)');
    // In real app: window.location.href = '/signup';
}

function bookDemo() {
    const floatingDemo = document.querySelector('.floating-demo');
    if (floatingDemo) {
        floatingDemo.scrollIntoView({ behavior: 'smooth' });
    } else {
        alert('Demo booking form opened!');
    }
}

// Fake live stats animation
function animateStats() {
    const stats = document.querySelectorAll('.stat-value');
    stats.forEach((stat, index) => {
        let target = parseFloat(stat.textContent);
        let current = 0;
        const increment = target / 60;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                clearInterval(timer);
                if (stat.textContent.includes('%')) {
                    stat.textContent = target.toFixed(1) + '%';
                } else {
                    stat.textContent = Math.floor(target).toLocaleString();
                }
            } else {
                if (stat.textContent.includes('%')) {
                    stat.textContent = current.toFixed(1) + '%';
                } else {
                    stat.textContent = Math.floor(current).toLocaleString();
                }
            }
        }, 30);
    });
}

// Trigger animations when in view
function handleScrollAnimations() {
    const cards = document.querySelectorAll('.feature-card, .integration-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    cards.forEach(card => {
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        observer.observe(card);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) searchInput.focus();
    }
});

// Initialize everything
window.onload = function() {
    console.log('%cAutoWave Landing Page Loaded Successfully 🚀', 'color: #00D084; font-size: 16px; font-weight: bold');
    
    // Animate stats after load
    setTimeout(() => {
        animateStats();
    }, 1200);
    
    handleScrollAnimations();
    
    // Close mobile menu when clicking links
    const mobileLinks = document.querySelectorAll('.mobile-menu a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('mobile-menu').classList.remove('active');
        });
    });
    
    // Add subtle header shadow on scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
    });
};