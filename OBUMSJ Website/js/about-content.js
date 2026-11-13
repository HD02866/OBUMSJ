/**
 * OBUMSJ Website - About Us & Executive Leadership Dynamic Synchronization Module
 * Connects About Us page (Hero, Who We Are, Vision, Mission, Objectives, Values, History, Leadership)
 * to Firestore CMS settings and leaders collection with seamless offline fallback,
 * injection-safe DOM construction, and 4-language support.
 */

import { db, doc, collection, query, where, orderBy, onSnapshot } from "./firebase.js";
import { sanitizeUrl } from "./site-content.js";

// Cached CMS data store
let aboutContent = null;
let publishedLeaders = [];

const DEFAULT_LEADER_FALLBACK = "./IMAGE/We are visted.jpg";

/**
 * Apply CMS About Us content and leadership profiles to DOM
 * @param {string} lang - 'en', 'am', 'om', 'ar'
 */
export function applyAboutContent(lang = "en") {
    const validLang = ["en", "am", "om", "ar"].includes(lang) ? lang : "en";

    // 1. HERO & INTRODUCTION
    if (aboutContent && aboutContent.intro) {
        const intro = aboutContent.intro;

        // Hero Title
        const heroTitleEl = document.querySelector("[data-i18n='about_page.hero_title'], .typewriter-title");
        if (heroTitleEl && intro.heroTitle && intro.heroTitle[validLang]) {
            heroTitleEl.textContent = intro.heroTitle[validLang];
            const sub = intro.heroSubtitle && intro.heroSubtitle[validLang] ? intro.heroSubtitle[validLang] : "Faith, Unity & Knowledge";
            heroTitleEl.setAttribute("data-typewriter-phrases", JSON.stringify([
                intro.heroTitle[validLang],
                sub,
                "Serving Muslim Students"
            ]));
        }

        // Hero Subtitle
        const heroSubEl = document.querySelector("[data-i18n='about_page.hero_subtitle']");
        if (heroSubEl && intro.heroSubtitle && intro.heroSubtitle[validLang]) {
            heroSubEl.textContent = intro.heroSubtitle[validLang];
        }

        // Who We Are Title
        const whoTitleEl = document.querySelector("[data-i18n='about_page.who_title']");
        if (whoTitleEl && intro.whoTitle && intro.whoTitle[validLang]) {
            whoTitleEl.textContent = intro.whoTitle[validLang];
        }

        // Who We Are Text
        const whoTextEl = document.querySelector("[data-i18n='about_page.who_text']");
        if (whoTextEl && intro.whoText && intro.whoText[validLang]) {
            whoTextEl.textContent = intro.whoText[validLang];
        }
    }

    // 2. VISION & MISSION
    if (aboutContent) {
        // Vision
        if (aboutContent.vision) {
            const vTitleEl = document.querySelector("[data-i18n='about_page.vision_title']");
            if (vTitleEl && aboutContent.vision.title && aboutContent.vision.title[validLang]) {
                const icon = vTitleEl.querySelector("i");
                vTitleEl.textContent = " " + aboutContent.vision.title[validLang];
                if (icon) vTitleEl.prepend(icon);
            }
            const vTextEl = document.querySelector("[data-i18n='about_page.vision_text']");
            if (vTextEl && aboutContent.vision.text && aboutContent.vision.text[validLang]) {
                vTextEl.textContent = aboutContent.vision.text[validLang];
            }
        }

        // Mission
        if (aboutContent.mission) {
            const mTitleEl = document.querySelector("[data-i18n='about_page.mission_title']");
            if (mTitleEl && aboutContent.mission.title && aboutContent.mission.title[validLang]) {
                const icon = mTitleEl.querySelector("i");
                mTitleEl.textContent = " " + aboutContent.mission.title[validLang];
                if (icon) mTitleEl.prepend(icon);
            }
            const mTextEl = document.querySelector("[data-i18n='about_page.mission_text']");
            if (mTextEl && aboutContent.mission.text && aboutContent.mission.text[validLang]) {
                mTextEl.textContent = aboutContent.mission.text[validLang];
            }
        }

        // Objectives & Values (Optional dynamic boxes)
        const objectivesGrid = document.getElementById("cmsObjectivesValuesGrid");
        const objectivesBox = document.getElementById("cmsObjectivesBox");
        const objectivesText = document.getElementById("cmsObjectivesText");
        const valuesBox = document.getElementById("cmsValuesBox");
        const valuesText = document.getElementById("cmsValuesText");

        let hasObjectives = false;
        let hasValues = false;

        if (aboutContent.objectives && aboutContent.objectives.text && aboutContent.objectives.text[validLang]) {
            if (objectivesText && objectivesBox) {
                objectivesText.textContent = aboutContent.objectives.text[validLang];
                objectivesBox.style.display = "block";
                hasObjectives = true;
            }
        } else if (objectivesBox) {
            objectivesBox.style.display = "none";
        }

        if (aboutContent.values && aboutContent.values.text && aboutContent.values.text[validLang]) {
            if (valuesText && valuesBox) {
                valuesText.textContent = aboutContent.values.text[validLang];
                valuesBox.style.display = "block";
                hasValues = true;
            }
        } else if (valuesBox) {
            valuesBox.style.display = "none";
        }

        if (objectivesGrid) {
            objectivesGrid.style.display = (hasObjectives || hasValues) ? "grid" : "none";
        }

        // History Timeline
        if (aboutContent.history && Array.isArray(aboutContent.history.timeline)) {
            aboutContent.history.timeline.forEach(item => {
                if (item.year) {
                    const descEl = document.querySelector(`[data-i18n='about_page.history_${item.year}']`);
                    if (descEl && item.desc && item.desc[validLang]) {
                        descEl.textContent = item.desc[validLang];
                    }
                    if (item.title && item.title[validLang]) {
                        const entryCard = descEl ? descEl.closest('.timeline-card') : null;
                        const titleEl = entryCard ? entryCard.querySelector('.timeline-title') : null;
                        if (titleEl) titleEl.textContent = item.title[validLang];
                    }
                }
            });
        }
    }

    // 3. EXECUTIVE LEADERSHIP PROFILES
    if (Array.isArray(publishedLeaders) && publishedLeaders.length > 0) {
        const leadersContainer = document.querySelector(".leaders");
        if (leadersContainer) {
            // Render published leadership cards safely via DOM methods (No innerHTML for CMS text)
            leadersContainer.replaceChildren();
            publishedLeaders.forEach((leader, idx) => {
                const card = document.createElement("div");
                card.className = `leader-card card-animated-border reveal-horizontal stagger-${(idx % 3) + 1}`;

                // Image
                const img = document.createElement("img");
                const safeImg = sanitizeUrl(leader.image) || DEFAULT_LEADER_FALLBACK;
                img.src = safeImg;
                img.alt = typeof leader.name === 'string' ? leader.name : (leader.name?.[validLang] || "Leader");
                img.loading = "lazy";
                img.decoding = "async";
                img.onerror = function() {
                    if (this.src !== DEFAULT_LEADER_FALLBACK) {
                        this.src = DEFAULT_LEADER_FALLBACK;
                    }
                };
                card.appendChild(img);

                // Name
                const nameEl = document.createElement("h4");
                const nameText = typeof leader.name === 'string' ? leader.name : (leader.name?.[validLang] || leader.name?.en || "");
                nameEl.textContent = nameText;
                card.appendChild(nameEl);

                // Title / Position
                const titleEl = document.createElement("p");
                const titleText = typeof leader.title === 'string' ? leader.title : (leader.title?.[validLang] || leader.title?.en || "");
                titleEl.textContent = titleText;
                card.appendChild(titleEl);

                // Biography (if provided)
                const bioText = typeof leader.bio === 'string' ? leader.bio : (leader.bio?.[validLang] || leader.bio?.en || "");
                if (bioText) {
                    const bioEl = document.createElement("div");
                    bioEl.className = "leader-bio";
                    bioEl.style.fontSize = "0.82rem";
                    bioEl.style.color = "#64748b";
                    bioEl.style.marginTop = "6px";
                    bioEl.textContent = bioText;
                    card.appendChild(bioEl);
                }

                leadersContainer.appendChild(card);
            });
        }
    }
}

/**
 * Initialize real-time synchronization with Firestore
 */
function initAboutSync() {
    try {
        // 1. Listen to About Us CMS settings
        onSnapshot(doc(db, "settings", "about"), (snap) => {
            if (snap.exists()) {
                aboutContent = snap.data();
                const activeLang = localStorage.getItem("siteLang") || "en";
                applyAboutContent(activeLang);
            }
        }, (err) => {
            console.warn("Public settings/about read notice (using static fallbacks):", err.message);
        });

        // 2. Listen to published executive leaders (ordered by display order)
        const leadersQuery = query(
            collection(db, "leaders"),
            where("published", "==", true),
            orderBy("order", "asc")
        );

        onSnapshot(leadersQuery, (snapshot) => {
            const list = [];
            snapshot.forEach(docSnap => {
                list.push({ id: docSnap.id, ...docSnap.data() });
            });
            if (list.length > 0) {
                publishedLeaders = list;
                const activeLang = localStorage.getItem("siteLang") || "en";
                applyAboutContent(activeLang);
            }
        }, (err) => {
            console.warn("Public leaders collection read notice (using static fallbacks):", err.message);
        });

    } catch (e) {
        console.warn("About Us CMS synchronization fallback active:", e);
    }
}

// React to language change events dispatched by LanguageSystem
window.addEventListener("obumsj:languageChanged", (e) => {
    const lang = (e && e.detail && e.detail.lang) || localStorage.getItem("siteLang") || "en";
    applyAboutContent(lang);
});

// Initialize on DOM load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAboutSync);
} else {
    initAboutSync();
}

// Expose globally for diagnostics and testing
window.applyAboutContent = applyAboutContent;
window.getAboutContentStore = () => ({ aboutContent, publishedLeaders });
