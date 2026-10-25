// language-system.js - Simple and working version
const LanguageSystem = {
    currentLang: 'en',
    translations: {},
    
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
        const langCodeElements = document.querySelectorAll('.lang-code');
        langCodeElements.forEach(element => {
            element.textContent = lang.toUpperCase();
        });
        
        // Close language dropdown
        const langDropdown = document.querySelector('.lang-dropdown');
        if (langDropdown) {
            langDropdown.classList.remove('active');
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    LanguageSystem.init();
});

// Make available globally
window.LanguageSystem = LanguageSystem;