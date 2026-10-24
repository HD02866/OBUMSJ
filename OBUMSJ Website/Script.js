// Script.js - Clean and organized with NEW FEATURES

// ================= FLOATING SOCIAL MEDIA SIDEBAR =================
const socialSidebar = document.getElementById('socialSidebar');
const socialToggle = document.getElementById('socialToggle');

if (socialToggle && socialSidebar) {
    const isMobile = window.innerWidth <= 768;
    const savedState = localStorage.getItem('obumsj_social_collapsed');
    
    // Default to collapsed on mobile or if user explicitly chose collapsed
    let isSocialCollapsed = savedState !== null ? (savedState === 'true') : isMobile;
    
    function updateSocialUI() {
        if (isSocialCollapsed) {
            socialSidebar.classList.add('collapsed');
            socialToggle.innerHTML = '<i class="fas fa-share-alt"></i>';
            socialToggle.setAttribute('aria-expanded', 'false');
            socialToggle.title = 'Show social channels';
        } else {
            socialSidebar.classList.remove('collapsed');
            socialToggle.innerHTML = '<i class="fas fa-times"></i>';
            socialToggle.setAttribute('aria-expanded', 'true');
            socialToggle.title = 'Hide social channels';
        }
    }
    
    updateSocialUI();

    socialToggle.addEventListener('click', function(e) {
        e.preventDefault();
        isSocialCollapsed = !isSocialCollapsed;
        updateSocialUI();
        localStorage.setItem('obumsj_social_collapsed', isSocialCollapsed ? 'true' : 'false');
    });
}

// ================= ANIMATED COUNTER (DELEGATED TO OBUMSJ_MOTION) =================
function animateCounter() {
    if (window.OBUMSJ_MOTION && window.OBUMSJ_MOTION.animateAllCounters) {
        window.OBUMSJ_MOTION.animateAllCounters();
    }
}

// ================= LOGIN/LOGOUT FUNCTIONALITY =================
function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    
    if (currentUser && loginBtn && userMenu) {
        loginBtn.style.display = 'none';
        userMenu.style.display = 'flex';
        userMenu.style.gap = '10px';
        userMenu.style.alignItems = 'center';
        
        // Update dashboard link
        const dashboardLink = document.getElementById('dashboardLink');
        if (dashboardLink) {
            dashboardLink.href = 'Dashboard.html';
            dashboardLink.innerHTML = `<i class="fas fa-tachometer-alt"></i> ${formatRole(currentUser.role)} Dashboard`;
        }
        
        // Add logout functionality
        const logoutBtn = userMenu.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.reload();
            });
        }
    }
}

function formatRole(role) {
    const roleMap = {
        'admin': 'Admin',
        'main_amir': 'Main Amir',
        'amir': 'Amir',
        'sector_member': 'Sector Member',
        'female_member': 'Female Member',
        'blog_manager': 'Blog Manager'
    };
    return roleMap[role] || role;
}

// ================= IMPROVED COUNTER TRIGGER FOR MOBILE COMPATIBILITY =================
let counterObserver;
let isCounterRunning = false;

function setupCounterObserver() {
    if (window.OBUMSJ_MOTION && window.OBUMSJ_MOTION.initCounters) {
        window.OBUMSJ_MOTION.initCounters();
    }
}

// ================= FALLBACK COUNTER FOR MOBILE TOUCH/SCROLL =================
function setupMobileCounterFallback() {
    let hasScrolledToCounters = false;
    
    function checkCounterPosition() {
        const aboutSection = document.getElementById('about');
        if (!aboutSection) return;
        
        const rect = aboutSection.getElementsByClassName('stats')[0]?.getBoundingClientRect();
        if (!rect) return;
        
        // Check if counters section is in viewport
        const isInViewport = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
        
        // Check if at least part of the counters are visible (for mobile)
        const isPartiallyVisible = (
            rect.top < window.innerHeight && 
            rect.bottom > 0
        );
        
        if ((isInViewport || isPartiallyVisible) && !hasScrolledToCounters && !isCounterRunning) {
            // Trigger counter animation
            setTimeout(() => {
                animateCounter();
                hasScrolledToCounters = true;
                isCounterRunning = true;
            }, 500);
        }
    }
    
    // Check on scroll
    window.addEventListener('scroll', checkCounterPosition);
    
    // Initial check on page load
    setTimeout(checkCounterPosition, 1000);
}

// ================= MOBILE NAVIGATION & ACCESSIBILITY =================
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

// Ensure backdrop overlay exists
let navBackdrop = document.querySelector('.nav-backdrop');
if (!navBackdrop && navLinks) {
    navBackdrop = document.createElement('div');
    navBackdrop.className = 'nav-backdrop';
    document.body.appendChild(navBackdrop);
}

function openMobileNav() {
    if (!navLinks || !mobileMenu) return;
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.classList.add('menu-open');
    navLinks.classList.add('active');
    mobileMenu.classList.add('active');
    mobileMenu.setAttribute('aria-expanded', 'true');
    if (navBackdrop) navBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
    if (!navLinks || !mobileMenu) return;
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.classList.remove('menu-open');
    navLinks.classList.remove('active');
    mobileMenu.classList.remove('active');
    mobileMenu.setAttribute('aria-expanded', 'false');
    if (navBackdrop) navBackdrop.classList.remove('active');
    document.body.style.overflow = '';
}

if (mobileMenu && navLinks) {
    mobileMenu.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-label', 'Toggle navigation menu');

    mobileMenu.addEventListener('click', function(e) {
        e.stopPropagation();
        if (navLinks.classList.contains('active')) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    });

    mobileMenu.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (navLinks.classList.contains('active')) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        }
    });

    if (navBackdrop) {
        navBackdrop.addEventListener('click', function() {
            closeMobileNav();
        });
    }

    window.addEventListener('resize', function() {
        if (window.innerWidth > 992 && navLinks.classList.contains('active')) {
            closeMobileNav();
        }
    });
}

// ================= LANGUAGE DROPDOWN =================
const langBtn = document.querySelector('.lang-btn');
const langDropdown = document.querySelector('.lang-dropdown');

if (langBtn && langDropdown) {
    langBtn.setAttribute('aria-haspopup', 'true');
    langBtn.setAttribute('aria-expanded', 'false');

    langBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var isActive = langDropdown.classList.toggle('active');
        langBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });
    
    // Close when clicking outside
    document.addEventListener('click', function(e) {
        if (!langDropdown.contains(e.target)) {
            langDropdown.classList.remove('active');
            langBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// Global Keyboard Escape Handler for Menus & Drawers
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (langDropdown && langDropdown.classList.contains('active')) {
            langDropdown.classList.remove('active');
            if (langBtn) {
                langBtn.setAttribute('aria-expanded', 'false');
                langBtn.focus();
            }
        }
        if (navLinks && navLinks.classList.contains('active')) {
            closeMobileNav();
            if (mobileMenu) mobileMenu.focus();
        }
    }
});

// ================= SECTORS DROPDOWN =================
const dropdown = document.querySelector('.dropdown');
const dropdownContent = document.querySelector('.dropdown-content');

if (dropdown && dropdownContent) {
    // Desktop hover handled via CSS; touch/click toggle for mobile
    const dropdownToggle = dropdown.querySelector('a');
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', function(e) {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    }
}

// Close drawer when clicking on standard links inside nav
const navLinksList = document.querySelectorAll('.nav-links a:not(.dropdown > a)');
navLinksList.forEach(link => {
    link.addEventListener('click', function() {
        if (window.innerWidth <= 992) {
            closeMobileNav();
        }
    });
});

// ================= SLIDESHOW =================
let slideIndex = 0;
const slides = document.getElementsByClassName("slide");

function showSlides() {
    if (slides.length === 0) return;
    
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove("fade");
    }
    
    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1;
    }
    
    slides[slideIndex - 1].classList.add("fade");
    setTimeout(showSlides, 5000);
}

// ================= THEME SYSTEM INTEGRATION =================
const darkToggle = document.getElementById('darkModeToggle');
if (window.OBUMSJ_THEME) {
    window.OBUMSJ_THEME.refreshButtons();
} else if (darkToggle) {
    var savedTheme = localStorage.getItem('obumsj_theme') || localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'night') {
        document.body.classList.add('dark-mode');
        document.documentElement.setAttribute('data-theme', 'night');
    }
    darkToggle.addEventListener('click', function(e) {
        e.preventDefault();
        if (window.OBUMSJ_THEME) {
            window.OBUMSJ_THEME.toggleTheme();
        } else {
            var isDark = document.body.classList.toggle('dark-mode');
            document.documentElement.setAttribute('data-theme', isDark ? 'night' : 'day');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        }
    });
}


// ================= SCROLL REVEAL ANIMATIONS =================
function initScrollReveal() {
    if (window.OBUMSJ_MOTION && window.OBUMSJ_MOTION.initScrollReveal) {
        window.OBUMSJ_MOTION.initScrollReveal();
    }
}

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded, initializing...');
    
    // Check login status
    checkLoginStatus();
    initScrollReveal();
    
    // Start slideshow
    if (slides.length > 0) {
        showSlides();
    }
    
    // Setup counter observers
    setupCounterObserver();
    
    // Setup mobile fallback (for devices with IntersectionObserver issues)
    if ('IntersectionObserver' in window) {
        console.log('IntersectionObserver is supported');
    } else {
        console.log('IntersectionObserver not supported, using fallback');
        setupMobileCounterFallback();
    }
    
    // Also setup fallback for mobile regardless (double insurance)
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        console.log('Mobile device detected, enabling additional counter triggers');
        setupMobileCounterFallback();
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#home') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 80;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu
                if (window.innerWidth <= 768) {
                    if (navLinks) navLinks.classList.remove('active');
                    if (mobileMenu) mobileMenu.classList.remove('active');
                }
            }
        });
    });
    
    // Form submissions
    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your donation!');
            donationForm.reset();
        });
    }
    
    // ================= TESTIMONIALS CAROUSEL (Requirement 4) =================
    function initTestimonialCarousel() {
        const carousel = document.getElementById('testimonialsCarousel');
        if (!carousel) return;

        const slides = carousel.querySelectorAll('.testimonial-slide');
        const dots = carousel.querySelectorAll('.testimonial-dots .dot');
        const prevBtn = document.getElementById('prevTestimonialBtn');
        const nextBtn = document.getElementById('nextTestimonialBtn');

        if (slides.length === 0) return;

        let currentIndex = 0;
        let timer = null;
        const AUTO_INTERVAL = 10000; // 10 seconds per requirement

        const isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function updateSlide(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            currentIndex = index;

            slides.forEach((slide, idx) => {
                if (idx === currentIndex) {
                    slide.classList.add('active');
                    slide.setAttribute('aria-hidden', 'false');
                } else {
                    slide.classList.remove('active');
                    slide.setAttribute('aria-hidden', 'true');
                }
            });

            dots.forEach((dot, idx) => {
                if (idx === currentIndex) {
                    dot.classList.add('active');
                    dot.setAttribute('aria-selected', 'true');
                } else {
                    dot.classList.remove('active');
                    dot.setAttribute('aria-selected', 'false');
                }
            });
        }

        function nextSlide() {
            updateSlide(currentIndex + 1);
        }

        function prevSlide() {
            updateSlide(currentIndex - 1);
        }

        function startTimer() {
            if (isReduced) return;
            stopTimer();
            timer = setInterval(nextSlide, AUTO_INTERVAL);
        }

        function stopTimer() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                prevSlide();
                startTimer(); // reset auto-timer on manual interaction
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                nextSlide();
                startTimer();
            });
        }

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', function(e) {
                e.preventDefault();
                updateSlide(idx);
                startTimer();
            });
        });

        // Pause automatic advancement on hover or focus
        carousel.addEventListener('mouseenter', stopTimer);
        carousel.addEventListener('mouseleave', startTimer);
        carousel.addEventListener('focusin', stopTimer);
        carousel.addEventListener('focusout', startTimer);

        // Mobile touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
            stopTimer();
        }, { passive: true });

        carousel.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchEndX - touchStartX;
            const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

            if (Math.abs(diff) > 45) {
                if ((diff < 0 && !isRTL) || (diff > 0 && isRTL)) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
            startTimer();
        }, { passive: true });

        // Initialize state & start auto timer
        updateSlide(0);
        startTimer();
    }

    initTestimonialCarousel();

    // ================= HOMEPAGE DONATION ACCOUNT COPYING (Requirement 2) =================
    function initDonationCopyButtons() {
        const copyButtons = document.querySelectorAll('.btn-copy-acc');
        const toast = document.getElementById('copyToast');
        const toastMsg = document.getElementById('copyToastMsg');
        let toastTimer = null;

        copyButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-copy-target');
                const label = this.getAttribute('data-label') || 'Account Number';
                const targetEl = document.getElementById(targetId);
                if (!targetEl) return;

                const textToCopy = targetEl.textContent.trim();

                function showCopyFeedback() {
                    btn.classList.add('copied');
                    const copyTextSpan = btn.querySelector('.copy-text');
                    const originalText = copyTextSpan ? copyTextSpan.textContent : 'Copy';
                    if (copyTextSpan) copyTextSpan.textContent = 'Copied!';

                    if (toast && toastMsg) {
                        toastMsg.textContent = `${label} (${textToCopy}) copied to clipboard!`;
                        toast.style.display = 'flex';
                        if (toastTimer) clearTimeout(toastTimer);
                        toastTimer = setTimeout(() => {
                            toast.style.display = 'none';
                        }, 4000);
                    }

                    setTimeout(() => {
                        btn.classList.remove('copied');
                        if (copyTextSpan) copyTextSpan.textContent = originalText;
                    }, 2500);
                }

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(textToCopy).then(showCopyFeedback).catch(() => {
                        fallbackCopyText(textToCopy, showCopyFeedback);
                    });
                } else {
                    fallbackCopyText(textToCopy, showCopyFeedback);
                }
            });
        });

        function fallbackCopyText(text, callback) {
            const tempInput = document.createElement('textarea');
            tempInput.value = text;
            tempInput.setAttribute('readonly', '');
            tempInput.style.position = 'absolute';
            tempInput.style.left = '-9999px';
            document.body.appendChild(tempInput);
            tempInput.select();
            try {
                document.execCommand('copy');
                callback();
            } catch (err) {
                alert(`Please manually copy: ${text}`);
            }
            document.body.removeChild(tempInput);
        }
    }

    initDonationCopyButtons();

    // ================= PWA INSTALLATION SYSTEM & SAFE UPDATE LIFECYCLE (Phase 3) =================
    function initPwaInstall() {
        let swRegistration = null;
        let isRefreshing = false;

        // Controllerchange listener: safe single reload upon activation
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (isRefreshing) return;
                isRefreshing = true;
                console.log('[OBUMSJ PWA] Controller changed; safely reloading into updated version...');
                window.location.reload();
            });
        }

        // Register Service Worker on localhost or HTTPS
        if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            navigator.serviceWorker.register('./sw.js').then(reg => {
                swRegistration = reg;
                console.log('[OBUMSJ PWA] Service Worker registered successfully with scope:', reg.scope);

                // If a new worker is already waiting, present update toast
                if (reg.waiting && navigator.serviceWorker.controller) {
                    showUpdateToast(reg.waiting);
                }

                // Listen for new worker updates
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('[OBUMSJ PWA] New update installed and ready for safe activation.');
                                showUpdateToast(newWorker);
                            }
                        });
                    }
                });
            }).catch(err => {
                console.warn('[OBUMSJ PWA] Service Worker registration skipped or failed:', err);
            });
        }

        // Reconnection & Offline awareness
        window.addEventListener('online', () => {
            console.log('[OBUMSJ PWA] Device returned online.');
            showConnectionBadge(true);
            if (swRegistration && typeof swRegistration.update === 'function') {
                swRegistration.update().catch(err => {
                    console.warn('[OBUMSJ PWA] Reconnection update check failed:', err);
                });
            }
        });

        window.addEventListener('offline', () => {
            console.log('[OBUMSJ PWA] Device is offline.');
            showConnectionBadge(false);
        });

        // Discrete Update Notification Toast
        function showUpdateToast(worker) {
            if (document.getElementById('obumsjUpdateToast')) return;
            const toast = document.createElement('div');
            toast.id = 'obumsjUpdateToast';
            toast.className = 'obumsj-update-toast';
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'polite');
            toast.innerHTML = `
                <div class="obumsj-update-toast-header">
                    <i class="fas fa-arrow-circle-up obumsj-update-toast-icon" aria-hidden="true"></i>
                    <h4 class="obumsj-update-toast-title">Update Available</h4>
                </div>
                <p class="obumsj-update-toast-body">A newer version of OBUMSJ is ready with fresh content and offline enhancements.</p>
                <div class="obumsj-update-toast-actions">
                    <button type="button" class="obumsj-dismiss-btn" id="obumsjDismissUpdate">Later</button>
                    <button type="button" class="obumsj-update-btn" id="obumsjApplyUpdate">Update Now</button>
                </div>
            `;
            document.body.appendChild(toast);

            const applyBtn = document.getElementById('obumsjApplyUpdate');
            const dismissBtn = document.getElementById('obumsjDismissUpdate');

            if (applyBtn) {
                applyBtn.addEventListener('click', () => {
                    if (worker && worker.postMessage) {
                        worker.postMessage({ action: 'skipWaiting' });
                    }
                    toast.remove();
                });
            }

            if (dismissBtn) {
                dismissBtn.addEventListener('click', () => {
                    toast.remove();
                });
            }
        }

        // Subtle Connection Status Badge
        let connectionBadgeTimeout = null;
        function showConnectionBadge(isOnline) {
            let badge = document.getElementById('obumsjConnectionBadge');
            if (!badge) {
                badge = document.createElement('div');
                badge.id = 'obumsjConnectionBadge';
                badge.className = 'obumsj-connection-badge';
                badge.setAttribute('role', 'status');
                badge.setAttribute('aria-live', 'polite');
                document.body.appendChild(badge);
            }
            if (connectionBadgeTimeout) {
                clearTimeout(connectionBadgeTimeout);
                connectionBadgeTimeout = null;
            }
            if (!isOnline) {
                badge.className = 'obumsj-connection-badge is-offline';
                badge.innerHTML = '<i class="fas fa-wifi-slash" aria-hidden="true"></i> <span>Offline Mode &bull; Viewing Cached Content</span>';
                badge.style.display = 'inline-flex';
                badge.style.opacity = '1';
            } else {
                badge.className = 'obumsj-connection-badge is-online';
                badge.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i> <span>Connection Restored</span>';
                badge.style.display = 'inline-flex';
                badge.style.opacity = '1';
                connectionBadgeTimeout = setTimeout(() => {
                    badge.style.opacity = '0';
                    setTimeout(() => { badge.style.display = 'none'; }, 300);
                }, 3500);
            }
        }

        let deferredPrompt = null;
        const installBtn = document.getElementById('pwaInstallBtn');
        const mobileNavInstallBtn = document.getElementById('mobileNavInstallBtn');
        const feedbackEl = document.getElementById('pwaInstallFeedback');

        const isInstalled = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;

        if (isInstalled) {
            if (installBtn) {
                installBtn.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i> <span>App Installed</span>';
                installBtn.style.opacity = '0.75';
                installBtn.disabled = true;
            }
            if (mobileNavInstallBtn) {
                mobileNavInstallBtn.style.display = 'none';
            }
            return;
        }

        window.addEventListener('beforeinstallprompt', e => {
            e.preventDefault();
            deferredPrompt = e;
            console.log('[OBUMSJ PWA] beforeinstallprompt captured and ready');

            if (feedbackEl) {
                feedbackEl.textContent = 'App ready to install on your device.';
                feedbackEl.style.display = 'block';
            }
        });

        window.addEventListener('appinstalled', () => {
            deferredPrompt = null;
            console.log('[OBUMSJ PWA] App was successfully installed!');
            if (installBtn) {
                installBtn.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i> <span>App Installed</span>';
                installBtn.disabled = true;
            }
            if (feedbackEl) {
                feedbackEl.textContent = 'Thank you! OBUMSJ has been installed on your device.';
                feedbackEl.style.display = 'block';
            }
            if (mobileNavInstallBtn) {
                mobileNavInstallBtn.style.display = 'none';
            }
        });

        function triggerInstallPrompt() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(choiceResult => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('[OBUMSJ PWA] User accepted the installation prompt');
                        if (feedbackEl) {
                            feedbackEl.textContent = 'Installing OBUMSJ App...';
                            feedbackEl.style.display = 'block';
                        }
                    } else {
                        console.log('[OBUMSJ PWA] User dismissed the installation prompt');
                        if (feedbackEl) {
                            feedbackEl.textContent = 'Installation was dismissed. You can install anytime.';
                            feedbackEl.style.display = 'block';
                        }
                    }
                    deferredPrompt = null;
                });
            } else {
                showPwaFallbackInstructions();
            }
        }

        function showPwaFallbackInstructions() {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            let message = '';
            if (isIOS) {
                message = 'To install OBUMSJ on iPhone / iPad:\n1. Tap the Share button in Safari (square with arrow up)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" at the top right.';
            } else {
                message = 'To install OBUMSJ:\n1. Open your browser menu (three dots or settings)\n2. Select "Install App" or "Add to Home Screen".';
            }
            alert(message);
        }

        if (installBtn) {
            installBtn.addEventListener('click', e => {
                e.preventDefault();
                triggerInstallPrompt();
            });
        }

        if (mobileNavInstallBtn) {
            mobileNavInstallBtn.addEventListener('click', e => {
                e.preventDefault();
                triggerInstallPrompt();
            });
        }
    }

    initPwaInstall();

    // ================= ENHANCED SCROLL-TRIGGERED ANIMATIONS (Requirement 8) =================
    function initScrollRevealObserver() {
        const isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Mark DOM as JS reveal-ready for progressive enhancement
        document.documentElement.classList.add('js-reveal-ready');

        const targets = document.querySelectorAll('.reveal-horizontal, .reveal-image-up, .reveal-on-scroll, .reveal-description');
        if (targets.length === 0) return;

        if (isReduced || !('IntersectionObserver' in window)) {
            targets.forEach(el => el.classList.add('is-revealed'));
            return;
        }

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target); // Animate once only
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        targets.forEach(el => revealObserver.observe(el));
    }

    initScrollRevealObserver();

    // Scroll animations (legacy backward compatibility)
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        scrollObserver.observe(el);
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        
        // Check counters on scroll (extra mobile fallback)
        if (!isCounterRunning) {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                const rect = aboutSection.getBoundingClientRect();
                // If about section is in view
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    setTimeout(() => {
                        if (!isCounterRunning) {
                            animateCounter();
                            isCounterRunning = true;
                        }
                    }, 800);
                }
            }
        }
    });
    
    // Window resize handler
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Reset mobile menu on desktop
            if (navLinks) navLinks.classList.remove('active');
            if (mobileMenu) mobileMenu.classList.remove('active');
            if (dropdownContent) dropdownContent.style.display = 'none';
        }
    });
    
    // Force counter animation after 3 seconds if still not triggered (safety net)
    setTimeout(() => {
        if (!isCounterRunning) {
            console.log('Safety net: Forcing counter animation');
            animateCounter();
            isCounterRunning = true;
        }
    }, 3000);
    
    console.log('Initialization complete');
});
