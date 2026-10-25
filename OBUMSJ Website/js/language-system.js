<<<<<<< HEAD
// language-system.js - Enhanced with Flag Icons & High-Reliability Translation Engine
const LanguageSystem = {
    currentLang: 'en',
    translations: {},

    flags: {
        en: '<svg class="flag-icon" viewBox="0 0 60 30" width="20" height="14" aria-hidden="true"><clipPath id="uk-c"><path d="M0 0v30h60V0z"/></clipPath><clipPath id="uk-d"><path d="M30 15h30v15zv15H30zh-30v-15zv-15h30z"/></clipPath><g clip-path="url(#uk-c)"><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0l60 30m0-30L0 30" clip-path="url(#uk-d)" stroke="#C8102E" stroke-width="4"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></g></svg>',
        am: '<svg class="flag-icon" viewBox="0 0 60 30" width="20" height="14" aria-hidden="true"><rect width="60" height="10" fill="#078930"/><rect y="10" width="60" height="10" fill="#FCDD09"/><rect y="20" width="60" height="10" fill="#DA121A"/><circle cx="30" cy="15" r="7" fill="#0F47AF"/><polygon points="30,9.5 31.6,13.8 36,13.8 32.4,16.4 33.8,20.5 30,17.8 26.2,20.5 27.6,16.4 24,13.8 28.4,13.8" fill="#FCDD09"/></svg>',
        om: '<svg class="flag-icon" viewBox="0 0 60 30" width="20" height="14" aria-hidden="true"><rect width="60" height="10" fill="#DA121A"/><rect y="10" width="60" height="10" fill="#FFFFFF"/><rect y="20" width="60" height="10" fill="#000000"/><path d="M29 19.5h2v-2.5h-2z" fill="#078930"/><path d="M30 11.5c-3.2 0-5.5 1.8-5.5 3.8c0 1 0.8 1.8 1.8 2.3c-0.8 0.5-0.8 1.4 0.2 1.8c1.2 0.1 2.2-0.5 3.5-1c1.3 0.5 2.3 1.1 3.5 1c1-0.4 1-1.3 0.2-1.8c1-0.5 1.8-1.3 1.8-2.3c0-2-2.3-3.8-5.5-3.8z" fill="#078930"/></svg>',
        ar: '<svg class="flag-icon" viewBox="0 0 60 30" width="20" height="14" aria-hidden="true"><rect width="60" height="30" fill="#006C35"/><path d="M14 11h32M16 8h8M28 8h10M40 8h4M18 13.5h24" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/><path d="M16 17.5h26M16 16v3M14 17.5h2M38 17.5l4-1.5l-2 1.5l2 1.5z" stroke="#FFFFFF" stroke-width="1.4" fill="#FFFFFF"/></svg>'
    },
=======
// language-system.js - Simple and working version
const LanguageSystem = {
    currentLang: 'en',
    translations: {},
>>>>>>> origin/main
    
    init: function() {
        // Load saved language
        const savedLang = localStorage.getItem('siteLang') || 'en';
        this.loadLanguage(savedLang);
        
        // Make setLang available globally
        window.setLang = (lang) => this.loadLanguage(lang);
        
        console.log('Language system initialized');
    },
    
    loadLanguage: function(lang) {
        fetch(`./js/${lang}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Language file not found: ${lang}.json`);
                }
                return response.json();
            })
            .then(translations => {
                this.translations[lang] = translations;
                this.currentLang = lang;
                this.applyTranslations();
                this.updateLanguageUI(lang);
                localStorage.setItem('siteLang', lang);
                
                // Handle RTL for Arabic
                if (lang === 'ar') {
                    document.documentElement.setAttribute('dir', 'rtl');
                    document.body.classList.add('rtl');
                } else {
                    document.documentElement.setAttribute('dir', 'ltr');
                    document.body.classList.remove('rtl');
                }
                
<<<<<<< HEAD
                // Dispatch event so other components (e.g. scroll reveal, typewriter) know
                window.dispatchEvent(new CustomEvent('obumsj:languageChanged', { detail: { lang: lang } }));
=======
>>>>>>> origin/main
                console.log(`Language changed to: ${lang}`);
            })
            .catch(error => {
                console.error('Error loading language:', error);
                // Fallback to English
                if (lang !== 'en') {
                    console.log('Falling back to English');
                    this.loadLanguage('en');
                }
            });
    },
    
    applyTranslations: function() {
        const translations = this.translations[this.currentLang];
        if (!translations) return;
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translations[key];
                } else if (element.tagName === 'IMG') {
                    element.alt = translations[key];
                } else if (element.tagName === 'OPTION') {
                    element.textContent = translations[key];
                } else {
                    element.textContent = translations[key];
                }
            }
        });
        
        // Update page title
        if (translations['page_title']) {
            document.title = translations['page_title'];
        }
    },
    
    updateLanguageUI: function(lang) {
<<<<<<< HEAD
        // Update language code elements
=======
>>>>>>> origin/main
        const langCodeElements = document.querySelectorAll('.lang-code');
        langCodeElements.forEach(element => {
            element.textContent = lang.toUpperCase();
        });
<<<<<<< HEAD

        // Update selected flag container inside button
        const flagContainers = document.querySelectorAll('.selected-flag-icon');
        if (this.flags[lang]) {
            flagContainers.forEach(container => {
                container.innerHTML = this.flags[lang];
            });
        }

        // Highlight active language option in dropdown
        document.querySelectorAll('.lang-menu .lang-option').forEach(option => {
            const optLang = option.getAttribute('data-lang');
            if (optLang === lang) {
                option.classList.add('active');
                option.setAttribute('aria-selected', 'true');
            } else {
                option.classList.remove('active');
                option.setAttribute('aria-selected', 'false');
            }
        });
=======
>>>>>>> origin/main
        
        // Close language dropdown
        const langDropdown = document.querySelector('.lang-dropdown');
        if (langDropdown) {
            langDropdown.classList.remove('active');
<<<<<<< HEAD
            const langBtn = langDropdown.querySelector('.lang-btn');
            if (langBtn) langBtn.setAttribute('aria-expanded', 'false');
=======
>>>>>>> origin/main
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    LanguageSystem.init();
});

// Make available globally
window.LanguageSystem = LanguageSystem;