/**
 * Product demo animation + subtle hero 3D tilt (desktop)
 */
(function initLandingMotion() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const thread = document.getElementById('waChatBody');
    const typing = document.getElementById('waTyping');
    const approveBtn = document.getElementById('demoApprove');
    const heroStage = document.querySelector('.aw-hero__stage');
    const heroScene = document.getElementById('heroScene');

    let timer = null;

    if (heroStage && heroScene && !reduced && window.matchMedia('(pointer: fine)').matches) {
        heroScene.addEventListener('mousemove', (e) => {
            const rect = heroScene.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            heroStage.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateZ(12px)`;
        });
        heroScene.addEventListener('mouseleave', () => {
            heroStage.style.transform = '';
        });
    }

    if (!thread) return;

    const steps = [...thread.querySelectorAll('.wa-step')];

    if (reduced) {
        steps.forEach((s) => s.classList.add('is-visible'));
    }

    function showTyping(ms) {
        return new Promise((resolve) => {
            if (!typing) {
                resolve();
                return;
            }
            typing.hidden = false;
            thread.appendChild(typing);
            thread.scrollTop = thread.scrollHeight;
            timer = setTimeout(() => {
                typing.hidden = true;
                resolve();
            }, ms);
        });
    }

    function reset() {
        steps.forEach((s) => s.classList.remove('is-visible'));
        thread.scrollTop = 0;
    }

    async function runSequence() {
        reset();
        for (let i = 0; i < steps.length; i += 1) {
            if (i > 0) await showTyping(400);
            steps[i].classList.add('is-visible');
            thread.scrollTop = thread.scrollHeight;
            await new Promise((r) => { timer = setTimeout(r, i === 0 ? 350 : 700); });
        }
        timer = setTimeout(runSequence, 5000);
    }

    if (!reduced) {
        const scene = document.getElementById('devicesScene');
        if (scene) {
            const io = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) {
                        clearTimeout(timer);
                        runSequence();
                    }
                },
                { threshold: 0.2 },
            );
            io.observe(scene);
        } else {
            runSequence();
        }
    }

    if (approveBtn) {
        approveBtn.addEventListener('click', () => {
            approveBtn.classList.add('is-done');
            approveBtn.textContent = 'Confirmed';
            const status = thread.querySelector('.wa-bubble--status p');
            if (status) {
                status.textContent = 'Your appointment is confirmed for tomorrow at 10:30 AM.';
            }
            setTimeout(() => {
                approveBtn.classList.remove('is-done');
                approveBtn.textContent = 'Confirm';
            }, 2800);
        });
    }
})();
