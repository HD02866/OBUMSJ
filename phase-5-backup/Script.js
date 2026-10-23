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

// ================= MOBILE MENU =================
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu && navLinks) {
    mobileMenu.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });
}

// ================= LANGUAGE DROPDOWN =================
const langBtn = document.querySelector('.lang-btn');
const langDropdown = document.querySelector('.lang-dropdown');

if (langBtn && langDropdown) {
    langBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        langDropdown.classList.toggle('active');
    });
    
    // Close when clicking outside
    document.addEventListener('click', function(e) {
        if (!langDropdown.contains(e.target)) {
            langDropdown.classList.remove('active');
        }
    });
}

// ================= SECTORS DROPDOWN =================
const dropdown = document.querySelector('.dropdown');
const dropdownContent = document.querySelector('.dropdown-content');

if (dropdown && dropdownContent) {
    // Desktop - hover
    dropdown.addEventListener('mouseenter', function() {
        if (window.innerWidth > 768) {
            dropdownContent.style.display = 'block';
        }
    });
    
    dropdown.addEventListener('mouseleave', function() {
        if (window.innerWidth > 768) {
            dropdownContent.style.display = 'none';
        }
    });
    
    // Mobile - click
    const dropdownToggle = dropdown.querySelector('a');
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
            }
        });
    }
}

// Close dropdowns when clicking on nav links (for mobile)
const navLinksList = document.querySelectorAll('.nav-links a');
navLinksList.forEach(link => {
    link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            if (navLinks) navLinks.classList.remove('active');
            if (mobileMenu) mobileMenu.classList.remove('active');
            if (dropdownContent) dropdownContent.style.display = 'none';
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
    
    // Scroll animations
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
