/**
 * OBUMSJ Website - Dynamic CMS Site Content Synchronization Module
 * Connects public website components (hero, visit, about, general info, footer)
 * to Firestore CMS settings with seamless fallback to static HTML, strict URL sanitization,
 * injection-safe DOM bindings, and 4-language support.
 */

import { db, doc, onSnapshot } from "./firebase.js";

// Cached CMS data store
let cmsContent = {
    general: null,
    homepage: null
};

/**
 * Validate and sanitize URLs to prevent script injection (e.g. javascript:, data:, vbscript:)
 * @param {string} url - Candidate URL or path
 * @returns {string} Sanitized URL or empty string if invalid/unsafe
 */
export function sanitizeUrl(url) {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (/^(javascript|data|vbscript):/i.test(trimmed)) {
        return "";
    }
    if (trimmed.startsWith("./") || trimmed.startsWith("../") || trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) {
        return trimmed;
    }
    try {
        const parsed = new URL(trimmed, window.location.origin);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            return trimmed;
        }
    } catch (_) {
        return "";
    }
    return "";
}

/**
 * Apply CMS content to DOM elements according to the active language
 * @param {string} lang - 'en', 'am', 'om', 'ar'
 */
export function applyCmsContent(lang = "en") {
    const validLang = ["en", "am", "om", "ar"].includes(lang) ? lang : "en";

    // 1. HOMEPAGE HERO SECTION
    if (cmsContent.homepage && cmsContent.homepage.hero) {
        const hero = cmsContent.homepage.hero;

        // Hero Title
        const titleEl = document.querySelector(".header-title");
        if (titleEl && hero.title && hero.title[validLang]) {
            titleEl.textContent = hero.title[validLang];
            // If typewriter phrases exist, update with the new title
            titleEl.setAttribute("data-typewriter-phrases", JSON.stringify([
                hero.title[validLang],
                hero.subtitle && hero.subtitle[validLang] ? hero.subtitle[validLang] : "Faith, Unity & Knowledge"
            ]));
        }

        // Hero Subtitle
        const subtitleEl = document.querySelector(".header-subtitle");
        if (subtitleEl && hero.subtitle && hero.subtitle[validLang]) {
            subtitleEl.textContent = hero.subtitle[validLang];
        }

        // Hero Action Buttons
        const heroBtns = document.querySelectorAll(".header-btns a");
        if (heroBtns.length >= 2) {
            // Button 1 (Learn More)
            if (hero.btn1Text && hero.btn1Text[validLang]) {
                heroBtns[0].textContent = hero.btn1Text[validLang];
            }
            if (hero.btn1Link) {
                const safeUrl = sanitizeUrl(hero.btn1Link);
                if (safeUrl) heroBtns[0].setAttribute("href", safeUrl);
            }

            // Button 2 (Donate Now)
            if (hero.btn2Text && hero.btn2Text[validLang]) {
                heroBtns[1].textContent = hero.btn2Text[validLang];
            }
            if (hero.btn2Link) {
                const safeUrl = sanitizeUrl(hero.btn2Link);
                if (safeUrl) heroBtns[1].setAttribute("href", safeUrl);
            }
        }
    }

    // 2. DISTINGUISHED VISIT SECTION
    if (cmsContent.homepage && cmsContent.homepage.visit) {
        const visit = cmsContent.homepage.visit;

        // Badge - injection-safe DOM construction without raw innerHTML interpolation
        const badgeEl = document.querySelector(".visit-badge");
        if (badgeEl && visit.badge && visit.badge[validLang]) {
            const icon = badgeEl.querySelector("i");
            badgeEl.textContent = " " + visit.badge[validLang];
            if (icon) {
                badgeEl.prepend(icon);
            } else {
                const newIcon = document.createElement("i");
                newIcon.className = "fas fa-star-and-crescent";
                newIcon.setAttribute("aria-hidden", "true");
                badgeEl.prepend(newIcon);
            }
        }

        // Title
        const visitTitleEl = document.querySelector(".visit-section .text-column h2, .visit-section [data-i18n='visit.title']");
        if (visitTitleEl && visit.title && visit.title[validLang]) {
            visitTitleEl.textContent = visit.title[validLang];
        }

        // Description
        const visitDescEl = document.querySelector(".visit-section .visit-description, .visit-section [data-i18n='visit.description']");
        if (visitDescEl && visit.description && visit.description[validLang]) {
            visitDescEl.textContent = visit.description[validLang];
        }

        // Image with safe URL sanitization and automatic fallback
        const visitImgEl = document.querySelector(".visit-section .featured-image");
        if (visitImgEl && visit.image) {
            const safeImg = sanitizeUrl(visit.image);
            if (safeImg) {
                const defaultFallback = "./IMAGE/Ustaz Abubakar.jpg";
                visitImgEl.onerror = function() {
                    if (this.src !== defaultFallback) {
                        this.src = defaultFallback;
                    }
                };
                visitImgEl.src = safeImg;
            }
        }
    }

    // 3. ABOUT / WELCOME SECTION (HOMEPAGE)
    if (cmsContent.homepage && cmsContent.homepage.about) {
        const about = cmsContent.homepage.about;

        // Section Title
        const aboutTitleEl = document.querySelector(".about-section .section-title, [data-i18n='about.title']");
        if (aboutTitleEl && about.title && about.title[validLang]) {
            aboutTitleEl.textContent = about.title[validLang];
        }

        // Subtitle / Mission
        const aboutSubEl = document.querySelector(".about-section .section-subtitle, [data-i18n='about.mission']");
        if (aboutSubEl && about.subtitle && about.subtitle[validLang]) {
            aboutSubEl.textContent = about.subtitle[validLang];
        }

        // Paragraphs
        const aboutParagraphs = document.querySelectorAll(".about-section .about-text p, .about-section [data-i18n='about.text1'], .about-section [data-i18n='about.text2']");
        if (aboutParagraphs.length >= 1 && about.text1 && about.text1[validLang]) {
            aboutParagraphs[0].textContent = about.text1[validLang];
        }
        if (aboutParagraphs.length >= 2 && about.text2 && about.text2[validLang]) {
            aboutParagraphs[1].textContent = about.text2[validLang];
        }

        // Action Button
        const aboutBtn = document.querySelector(".about-section .about-btn a, .about-section a[data-i18n='about.read_more']");
        if (aboutBtn) {
            if (about.btnText && about.btnText[validLang]) {
                aboutBtn.textContent = about.btnText[validLang];
            }
            if (about.btnLink) {
                const safeUrl = sanitizeUrl(about.btnLink);
                if (safeUrl) aboutBtn.setAttribute("href", safeUrl);
            }
        }
    }

    // 4. GENERAL WEBSITE & CONTACT INFORMATION (FOOTER & SHARED AREAS)
    if (cmsContent.general) {
        const gen = cmsContent.general;

        // Footer / About Text
        const footerAboutEl = document.querySelector("p[data-i18n='footer.about_text']");
        if (footerAboutEl && gen.footerText && gen.footerText[validLang]) {
            footerAboutEl.textContent = gen.footerText[validLang];
        }

        // Physical Address
        const addressEl = document.querySelector("span[data-i18n='footer.address']");
        if (addressEl && gen.address && gen.address[validLang]) {
            addressEl.textContent = gen.address[validLang];
        }

        // Contact Phone
        const phoneEl = document.querySelector("span[data-i18n='footer.phone']");
        if (phoneEl && gen.phone) {
            phoneEl.textContent = gen.phone;
        }

        // Contact Email
        const emailEl = document.querySelector("span[data-i18n='footer.email']");
        if (emailEl && gen.email) {
            emailEl.textContent = gen.email;
        }

        // Copyright Notice
        const copyrightEl = document.querySelector(".footer-bottom p, p[data-i18n='footer.copyright']");
        if (copyrightEl && gen.footerCopyright && gen.footerCopyright[validLang]) {
            copyrightEl.textContent = gen.footerCopyright[validLang];
        }

        // Social Links with safe URL sanitization
        const updateSocialLink = (selector, rawUrl) => {
            const safeUrl = sanitizeUrl(rawUrl);
            if (safeUrl) {
                document.querySelectorAll(selector).forEach(a => a.href = safeUrl);
            }
        };

        if (gen.telegram) updateSocialLink(".footer-social a[title='Telegram']", gen.telegram);
        if (gen.facebook) updateSocialLink(".footer-social a[title='Facebook']", gen.facebook);
        if (gen.whatsapp) updateSocialLink(".footer-social a[title='WhatsApp']", gen.whatsapp);
        if (gen.youtube) updateSocialLink(".footer-social a[title='YouTube']", gen.youtube);
        if (gen.tiktok) updateSocialLink(".footer-social a[title='TikTok']", gen.tiktok);
    }
}

/**
 * Initialize real-time synchronization with Firestore settings
 */
function initSiteContentSync() {
    try {
        // Listen to General website settings
        onSnapshot(doc(db, "settings", "general"), (snap) => {
            if (snap.exists()) {
                cmsContent.general = snap.data();
                const activeLang = localStorage.getItem("siteLang") || "en";
                applyCmsContent(activeLang);
            }
        }, (err) => {
            console.warn("Public settings/general read notice (using static fallbacks):", err.message);
        });

        // Listen to Homepage CMS settings
        onSnapshot(doc(db, "settings", "homepage"), (snap) => {
            if (snap.exists()) {
                cmsContent.homepage = snap.data();
                const activeLang = localStorage.getItem("siteLang") || "en";
                applyCmsContent(activeLang);
            }
        }, (err) => {
            console.warn("Public settings/homepage read notice (using static fallbacks):", err.message);
        });
    } catch (e) {
        console.warn("CMS initialization offline fallback active:", e);
    }
}

// React to language change events dispatched by LanguageSystem
window.addEventListener("obumsj:languageChanged", (e) => {
    const lang = (e && e.detail && e.detail.lang) || localStorage.getItem("siteLang") || "en";
    applyCmsContent(lang);
});

// Initialize on DOM load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSiteContentSync);
} else {
    initSiteContentSync();
}

// Expose globally for testing and diagnostic inspection
window.applyCmsContent = applyCmsContent;
window.sanitizeUrl = sanitizeUrl;
window.getCmsContentStore = () => cmsContent;
