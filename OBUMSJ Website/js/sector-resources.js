/**
 * OBUMSJ Website - Public Sector Educational Resource Delivery Module (Task 6)
 * Fetches, filters, and renders published educational resources for Qirat, Ruqiya, and Academy
 * Complies with strict published-only Firestore queries, audio playback coordination, and PDF preview modals.
 */

import { db, collection, onSnapshot, query, where } from "./firebase.js";

// Multi-language UI dictionaries
const UI_TEXTS = {
    en: {
        sectionTitle: "Educational Resources & Materials",
        sectionSubtitle: "Authentic recitations, study materials, and reference documents published by OBUMSJ.",
        searchPlaceholder: "Search resources by title...",
        allFilter: "All Resources",
        audioFilter: "Audio / Recitation",
        documentFilter: "Documents",
        bookFilter: "Books",
        videoFilter: "Videos",
        otherFilter: "Other Materials",
        noResources: "No published resources available at this time.",
        noResourcesSub: "New recitations and educational materials are published regularly. Please check back soon.",
        loading: "Loading sector educational resources...",
        error: "Unable to load sector resources. Please verify your connection.",
        audioUnavailable: "Streaming playback unavailable. Click Open in Drive or Download below.",
        previewPdf: "Preview PDF",
        download: "Download",
        openDrive: "Open in Drive",
        closeModal: "Close Preview",
        sizeLabel: "Size",
        formatLabel: "Format"
    },
    am: {
        sectionTitle: "የትምህርት መረጃዎችና ቁሳቁሶች",
        sectionSubtitle: "በኦቡምስጅ የተዘጋጁ ትክክለኛ የቅራት፣ የጥናትና የማጣቀሻ ሰነዶች።",
        searchPlaceholder: "የትምህርት ቁሳቁሶችን በስም ይፈልጉ...",
        allFilter: "ሁሉም",
        audioFilter: "ድምጽ / ቅራት",
        documentFilter: "ሰነዶች",
        bookFilter: "ኪታቦችና መጻሕፍት",
        videoFilter: "ቪዲዮዎች",
        otherFilter: "ሌሎች ቁሳቁሶች",
        noResources: "በአሁኑ ጊዜ የታተመ የትምህርት መረጃ አልተገኘም።",
        noResourcesSub: "አዳዲስ ቅራቶችና መረጃዎች በቅርቡ ይጫናሉ። እባክዎን ትንሽ ቆይተው ይመልከቱ።",
        loading: "የትምህርት መረጃዎችን በማምጣት ላይ...",
        error: "መረጃዎችን መጫን አልተቻለም። እባክዎ የበይነመረብ ግንኙነትዎን ያረጋግጡ።",
        audioUnavailable: "ቀጥታ ማጫወት አልተቻለም። ከታች ባለው 'በድራይቭ ክፈት' ወይም 'አውርድ' ይጠቀሙ።",
        previewPdf: "ፒዲኤፍ እይ",
        download: "አውርድ",
        openDrive: "በድራይቭ ክፈት",
        closeModal: "ዝጋ",
        sizeLabel: "መጠን",
        formatLabel: "ቅርጸት"
    },
    om: {
        sectionTitle: "Qabeenya Barnootaa fi Ragaalee",
        sectionSubtitle: "Qiraatiiwwan, waraqaalee barnootaa fi kitaabban OBUMSJ qophaa'an.",
        searchPlaceholder: "Mata dureen barbaadi...",
        allFilter: "Hundaa",
        audioFilter: "Sagalee / Qiraatii",
        documentFilter: "Waraqaalee",
        bookFilter: "Kitaabban",
        videoFilter: "Viidiyoowwan",
        otherFilter: "Kan biroo",
        noResources: "Yeroo ammaa qabeenyi maxxanfame hin jiru.",
        noResourcesSub: "Qiraatii fi kitaabban haaraan yeroo dhiyootti ni fe'amu. Yeroo dhiyootti deebi'aa ilaalaa.",
        loading: "Qabeenya barnootaa fe'aa jira...",
        error: "Qabeenya fe'uu hin dandeenye. Maaloo intarneetii keessan mirkaneeffadhaa.",
        audioUnavailable: "Qiraatii kallattiin taphachiisuun hin danda'amne. Asii gadiitti 'Drive irratti bani' ykn 'Buufadhu' fayyadamaa.",
        previewPdf: "PDF Ilaali",
        download: "Buufadhu",
        openDrive: "Drive irratti bani",
        closeModal: "Cufi",
        sizeLabel: "Hamma",
        formatLabel: "Boca"
    },
    ar: {
        sectionTitle: "الموارد التعليمية والمواد العلمية",
        sectionSubtitle: "تلاوات موثوقة ومواد دراسية ومراجع علمية صادرة عن جمعية أوبومسج.",
        searchPlaceholder: "ابحث عن الموارد بالعنوان...",
        allFilter: "جميع الموارد",
        audioFilter: "صوتيات وتلاوات",
        documentFilter: "وثائق ومستندات",
        bookFilter: "كتب ومؤلفات",
        videoFilter: "مرئيات",
        otherFilter: "مواد أخرى",
        noResources: "لا توجد موارد منشورة حالياً في هذا القطاع.",
        noResourcesSub: "يتم نشر التلاوات والمواد العلمية بانتظام. يُرجى مراجعة الصفحة قريباً.",
        loading: "جارٍ تحميل الموارد التعليمية...",
        error: "تعذر تحميل الموارد. يُرجى التحقق من اتصالك بالإنترنت.",
        audioUnavailable: "البث المباشر غير متوفر حالياً. يُرجى استخدام 'فتح في درايف' أو 'تنزيل' أدناه.",
        previewPdf: "معاينة الملف",
        download: "تنزيل",
        openDrive: "فتح في درايف",
        closeModal: "إغلاق المعاينة",
        sizeLabel: "الحجم",
        formatLabel: "الصيغة"
    }
};

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatFileSize(bytes) {
    const b = parseInt(bytes, 10) || 0;
    if (b <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return (b / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
}

function getCurrentLang() {
    return window.LanguageSystem?.currentLang || document.documentElement.lang || 'en';
}

function getLocalizedField(fieldMap, lang) {
    if (!fieldMap || typeof fieldMap !== 'object') return '';
    if (fieldMap[lang] && typeof fieldMap[lang] === 'string' && fieldMap[lang].trim()) {
        return fieldMap[lang].trim();
    }
    // Fallback cascade: en -> am -> om -> ar -> any available
    const cascade = ['en', 'am', 'om', 'ar'];
    for (const l of cascade) {
        if (fieldMap[l] && typeof fieldMap[l] === 'string' && fieldMap[l].trim()) {
            return fieldMap[l].trim();
        }
    }
    for (const k of Object.keys(fieldMap)) {
        if (typeof fieldMap[k] === 'string' && fieldMap[k].trim()) {
            return fieldMap[k].trim();
        }
    }
    return '';
}

function isArabicText(text) {
    return /[\u0600-\u06FF]/.test(text || '');
}

/**
 * Initialize public sector educational resource delivery
 * @param {Object} options
 * @param {string} options.sectorSlug - "qirat" | "ruqiya" | "academy"
 * @param {string} options.containerId - DOM element ID for container
 */
export function initSectorResources({ sectorSlug, containerId }) {
    if (!sectorSlug || !containerId) {
        console.error("[SectorResources] Missing required options:", { sectorSlug, containerId });
        return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`[SectorResources] Container #${containerId} not found in DOM.`);
        return;
    }

    let resourcesData = [];
    let activeFilter = 'all';
    let searchQuery = '';
    let unsubscribe = null;

    // Render skeleton loading state initially
    renderLoadingState();

    // Ensure PDF preview modal exists in the document
    ensurePdfModalExists();

    // Build the strict Firestore query: sector == sectorSlug AND published == true
    try {
        const q = query(
            collection(db, "sector_resources"),
            where("sector", "==", sectorSlug),
            where("published", "==", true)
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
            const list = [];
            snapshot.forEach(docSnap => {
                list.push({ id: docSnap.id, ...docSnap.data() });
            });

            // In-memory sort by order ascending, then createdAt
            list.sort((a, b) => {
                const orderDiff = (a.order ?? 0) - (b.order ?? 0);
                if (orderDiff !== 0) return orderDiff;
                const aSec = a.createdAt?.seconds ?? 0;
                const bSec = b.createdAt?.seconds ?? 0;
                return aSec - bSec;
            });

            resourcesData = list;
            renderResourcesUI();
        }, (err) => {
            console.error("[SectorResources] Snapshot listener error:", err);
            renderErrorState(err.message);
        });
    } catch (initErr) {
        console.error("[SectorResources] Initialization error:", initErr);
        renderErrorState(initErr.message);
    }

    // React to live language changes across the site
    window.addEventListener('obumsj:languageChanged', () => {
        renderResourcesUI();
    });

    // Cleanup on window unload if applicable
    window.addEventListener('beforeunload', () => {
        if (typeof unsubscribe === 'function') unsubscribe();
    });

    function renderLoadingState() {
        const lang = getCurrentLang();
        const t = UI_TEXTS[lang] || UI_TEXTS.en;
        container.innerHTML = `
            <div style="text-align:center; padding: 60px 20px;">
                <div style="display:inline-block; width:44px; height:44px; border:4px solid rgba(27,94,32,0.15); border-top-color:var(--primary, #1b5e20); border-radius:50%; animation: spin 0.9s linear infinite;"></div>
                <p style="margin-top:16px; color:var(--text-secondary, #64748b); font-size:0.95rem;">${t.loading}</p>
            </div>
            <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        `;
    }

    function renderErrorState(msg) {
        const lang = getCurrentLang();
        const t = UI_TEXTS[lang] || UI_TEXTS.en;
        container.innerHTML = `
            <div style="text-align:center; padding: 50px 20px; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 14px; margin: 30px 0;">
                <i class="fas fa-exclamation-triangle" style="font-size:2rem; color:#dc2626; margin-bottom:12px;"></i>
                <h4 style="color:#991b1b; margin-bottom:6px;">${t.error}</h4>
                <p style="color:#7f1d1d; font-size:0.85rem; font-family:monospace;">${escapeHtml(msg || '')}</p>
            </div>
        `;
    }

    function renderResourcesUI() {
        const lang = getCurrentLang();
        const t = UI_TEXTS[lang] || UI_TEXTS.en;
        const isRtl = lang === 'ar';

        // Filter by category
        let filtered = resourcesData.filter(r => {
            if (activeFilter !== 'all' && r.type !== activeFilter) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const titleMatch = ['en', 'am', 'om', 'ar'].some(l => (r.title?.[l] || '').toLowerCase().includes(q));
                const descMatch = ['en', 'am', 'om', 'ar'].some(l => (r.description?.[l] || '').toLowerCase().includes(q));
                const fileMatch = (r.fileName || '').toLowerCase().includes(q);
                return titleMatch || descMatch || fileMatch;
            }
            return true;
        });

        // Main Shell with Filters and Search Bar
        let html = `
            <div class="sector-resources-header" style="text-align:center; max-width:800px; margin:0 auto 40px;" ${isRtl ? 'dir="rtl"' : ''}>
                <div style="display:inline-flex; align-items:center; gap:8px; padding:6px 16px; background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.3); border-radius:30px; font-size:0.82rem; font-weight:700; color:var(--gold-primary, #b48a28); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:12px;">
                    <i class="fas fa-book-reader"></i>
                    <span>${escapeHtml(sectorSlug.toUpperCase())} RESOURCES</span>
                </div>
                <h2 style="font-size:2.1rem; color:var(--secondary, #0f3d2e); font-family:var(--font-heading, serif); margin-bottom:12px;">${t.sectionTitle}</h2>
                <p style="font-size:1.02rem; color:var(--text-secondary, #64748b); line-height:1.6;">${t.sectionSubtitle}</p>
            </div>

            <!-- Filter Pills & Search Input -->
            <div class="sector-resources-controls" style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:16px; margin-bottom:32px;">
                <div class="filter-pills-bar" style="display:flex; flex-wrap:wrap; gap:8px;" ${isRtl ? 'dir="rtl"' : ''}>
                    <button type="button" class="res-filter-pill ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
                        <i class="fas fa-layer-group"></i> ${t.allFilter}
                    </button>
                    <button type="button" class="res-filter-pill ${activeFilter === 'audio' ? 'active' : ''}" data-filter="audio">
                        <i class="fas fa-headphones"></i> ${t.audioFilter}
                    </button>
                    <button type="button" class="res-filter-pill ${activeFilter === 'document' ? 'active' : ''}" data-filter="document">
                        <i class="fas fa-file-alt"></i> ${t.documentFilter}
                    </button>
                    <button type="button" class="res-filter-pill ${activeFilter === 'book' ? 'active' : ''}" data-filter="book">
                        <i class="fas fa-book"></i> ${t.bookFilter}
                    </button>
                    <button type="button" class="res-filter-pill ${activeFilter === 'video' ? 'active' : ''}" data-filter="video">
                        <i class="fas fa-video"></i> ${t.videoFilter}
                    </button>
                    <button type="button" class="res-filter-pill ${activeFilter === 'other' ? 'active' : ''}" data-filter="other">
                        <i class="fas fa-folder"></i> ${t.otherFilter}
                    </button>
                </div>

                <div class="search-box-wrapper" style="position:relative; min-width:260px; flex:1; max-width:340px;">
                    <i class="fas fa-search" style="position:absolute; ${isRtl ? 'right:14px;' : 'left:14px;'} top:50%; transform:translateY(-50%); color:#94a3b8; font-size:0.9rem;"></i>
                    <input type="text" id="resSearchInput" placeholder="${t.searchPlaceholder}" value="${escapeHtml(searchQuery)}"
                        style="width:100%; padding:${isRtl ? '10px 40px 10px 14px' : '10px 14px 10px 40px'}; border:1px solid rgba(160,113,45,0.25); border-radius:30px; font-size:0.9rem; background:#fff; outline:none; transition:border-color 0.2s;"
                        ${isRtl ? 'dir="rtl"' : ''}>
                </div>
            </div>
        `;

        if (filtered.length === 0) {
            html += `
                <div style="text-align:center; background:#fff; border:1px dashed #cbd5e1; border-radius:14px; padding:60px 24px; margin:20px 0;">
                    <div style="width:70px; height:70px; margin:0 auto 16px; background:rgba(212,175,55,0.1); border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--gold-primary, #d4af37); font-size:1.8rem;">
                        <i class="fas fa-folder-open"></i>
                    </div>
                    <h4 style="color:var(--secondary, #0f3d2e); font-size:1.25rem; margin-bottom:8px;">${t.noResources}</h4>
                    <p style="color:var(--text-secondary, #64748b); font-size:0.92rem; max-width:500px; margin:0 auto;">${t.noResourcesSub}</p>
                </div>
            `;
        } else {
            html += `<div class="sector-resources-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:24px;">`;
            filtered.forEach(r => {
                html += renderResourceCard(r, lang, t);
            });
            html += `</div>`;
        }

        // Inject styles
        html += `
            <style>
                .res-filter-pill {
                    padding: 8px 16px;
                    border-radius: 20px;
                    border: 1px solid rgba(160, 113, 45, 0.2);
                    background: #fff;
                    color: var(--text-primary, #334155);
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s ease;
                }
                .res-filter-pill:hover {
                    border-color: var(--primary, #1b5e20);
                    color: var(--primary, #1b5e20);
                    transform: translateY(-1px);
                }
                .res-filter-pill.active {
                    background: var(--primary, #1b5e20);
                    color: #fff;
                    border-color: var(--primary, #1b5e20);
                    box-shadow: 0 4px 10px rgba(27, 94, 32, 0.2);
                }
                .sector-resource-card {
                    background: rgba(255, 255, 255, 0.95);
                    border: 1px solid rgba(160, 113, 45, 0.2);
                    border-radius: 14px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    box-shadow: 0 4px 16px rgba(18, 38, 63, 0.05);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .sector-resource-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 28px rgba(18, 38, 63, 0.12);
                    border-color: var(--gold-primary, #d4af37);
                }
                .resource-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    border-radius: 6px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                }
                .res-btn-primary {
                    background: var(--primary, #1b5e20);
                    color: #fff;
                }
                .res-btn-primary:hover {
                    background: #144818;
                    color: #fff;
                }
                .res-btn-outline {
                    background: #f8fafc;
                    color: #334155;
                    border: 1px solid #cbd5e1;
                }
                .res-btn-outline:hover {
                    background: #e2e8f0;
                    color: #0f172a;
                }
                .sector-audio-element {
                    width: 100%;
                    height: 38px;
                    border-radius: 20px;
                    outline: none;
                    margin: 12px 0 6px;
                }
            </style>
        `;

        container.innerHTML = html;

        // Attach Filter Listeners
        container.querySelectorAll('.res-filter-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                activeFilter = btn.getAttribute('data-filter') || 'all';
                renderResourcesUI();
            });
        });

        // Attach Search Listener
        const sInput = container.querySelector('#resSearchInput');
        if (sInput) {
            sInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim();
                // Debounce slightly or render directly
                renderResourcesUI();
                const newInput = container.querySelector('#resSearchInput');
                if (newInput) {
                    newInput.focus();
                    newInput.selectionStart = newInput.selectionEnd = newInput.value.length;
                }
            });
        }

        // Attach Audio Playback Coordination & Error Detection
        container.querySelectorAll('audio').forEach(audioEl => {
            audioEl.addEventListener('play', () => {
                // Pause all other audio players on the page immediately
                document.querySelectorAll('audio').forEach(other => {
                    if (other !== audioEl && !other.paused) {
                        other.pause();
                    }
                });
            });

            audioEl.addEventListener('error', () => {
                const notice = audioEl.parentElement?.querySelector('.audio-error-notice');
                if (notice) notice.style.display = 'block';
            });
        });

        // Attach PDF Preview Click Handlers
        container.querySelectorAll('.btn-preview-pdf').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const fileId = btn.getAttribute('data-file-id');
                const fileName = btn.getAttribute('data-file-name') || 'PDF Document';
                openPdfModal(fileId, fileName);
            });
        });
    }

    function renderResourceCard(r, lang, t) {
        const title = getLocalizedField(r.title, lang) || r.fileName || 'Untitled Resource';
        const description = getLocalizedField(r.description, lang);
        const isRtl = lang === 'ar' || isArabicText(title);

        const fileId = r.fileId || '';
        const isPdf = (r.mimeType === 'application/pdf') || (r.fileName && r.fileName.toLowerCase().endsWith('.pdf'));
        const isAudio = r.type === 'audio' || (r.mimeType && r.mimeType.startsWith('audio/'));
        const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
        const directStreamUrl = `https://docs.google.com/uc?export=open&id=${encodeURIComponent(fileId)}`;
        const driveViewUrl = `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view`;

        // Type badge details
        let badgeColor = '#1b5e20';
        let badgeBg = 'rgba(27,94,32,0.1)';
        let typeIcon = 'fa-file';
        let typeLabel = r.type ? r.type.toUpperCase() : 'RESOURCE';

        if (r.type === 'audio') {
            badgeColor = '#0284c7';
            badgeBg = 'rgba(2,132,199,0.1)';
            typeIcon = 'fa-headphones';
            typeLabel = 'AUDIO';
        } else if (r.type === 'book') {
            badgeColor = '#854d0e';
            badgeBg = 'rgba(202,138,4,0.12)';
            typeIcon = 'fa-book';
            typeLabel = 'BOOK';
        } else if (r.type === 'video') {
            badgeColor = '#b91c1c';
            badgeBg = 'rgba(185,28,28,0.1)';
            typeIcon = 'fa-video';
            typeLabel = 'VIDEO';
        } else if (r.type === 'document') {
            badgeColor = '#4338ca';
            badgeBg = 'rgba(67,56,202,0.1)';
            typeIcon = 'fa-file-pdf';
            typeLabel = 'DOCUMENT';
        }

        return `
            <div class="sector-resource-card card-animated-border reveal-horizontal" ${isRtl ? 'dir="rtl"' : ''}>
                <div>
                    <!-- Card Top Header -->
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                        <span style="background:${badgeBg}; color:${badgeColor}; font-size:0.75rem; font-weight:700; padding:4px 10px; border-radius:20px; display:inline-flex; align-items:center; gap:5px;">
                            <i class="fas ${typeIcon}"></i> ${typeLabel}
                        </span>
                        <span style="font-size:0.78rem; color:#64748b; font-family:monospace;">
                            ${formatFileSize(r.fileSize)}
                        </span>
                    </div>

                    <!-- Title & Description -->
                    <h3 style="color:var(--secondary, #0f3d2e); font-size:1.15rem; font-family:var(--font-heading, serif); margin-bottom:8px; line-height:1.4;">
                        ${escapeHtml(title)}
                    </h3>
                    ${description ? `
                        <p style="color:var(--text-primary, #334155); font-size:0.88rem; line-height:1.55; margin-bottom:14px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
                            ${escapeHtml(description)}
                        </p>
                    ` : ''}

                    <!-- Audio Player Section (if Audio) -->
                    ${isAudio ? `
                        <div class="audio-player-wrapper" style="margin: 10px 0 14px;">
                            <audio controls preload="none" class="sector-audio-element">
                                <source src="${directStreamUrl}" type="${escapeHtml(r.mimeType || 'audio/mpeg')}">
                                <source src="${directDownloadUrl}" type="${escapeHtml(r.mimeType || 'audio/mpeg')}">
                                Your browser does not support audio playback.
                            </audio>
                            <div class="audio-error-notice" style="display:none; font-size:0.78rem; color:#b91c1c; background:#fef2f2; border:1px solid #fecaca; border-radius:6px; padding:6px 10px; margin-top:6px;">
                                <i class="fas fa-info-circle"></i> ${t.audioUnavailable}
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Card Bottom Actions -->
                <div style="margin-top:16px; padding-top:14px; border-top:1px solid rgba(160,113,45,0.12); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        ${isPdf ? `
                            <button type="button" class="resource-action-btn res-btn-primary btn-preview-pdf" data-file-id="${escapeHtml(fileId)}" data-file-name="${escapeHtml(title)}">
                                <i class="fas fa-eye"></i> ${t.previewPdf}
                            </button>
                        ` : ''}

                        <a href="${directDownloadUrl}" target="_blank" rel="noopener noreferrer" class="resource-action-btn res-btn-outline" title="${t.download}">
                            <i class="fas fa-download"></i> ${t.download}
                        </a>
                    </div>

                    <a href="${driveViewUrl}" target="_blank" rel="noopener noreferrer" style="font-size:0.8rem; color:#0284c7; text-decoration:none; display:inline-flex; align-items:center; gap:4px; font-weight:600;">
                        <i class="fab fa-google-drive"></i> ${t.openDrive} <i class="fas fa-external-link-alt" style="font-size:0.7rem;"></i>
                    </a>
                </div>
            </div>
        `;
    }

    function ensurePdfModalExists() {
        if (document.getElementById('sectorPdfModal')) return;

        const modalDiv = document.createElement('div');
        modalDiv.id = 'sectorPdfModal';
        modalDiv.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 99999;
            align-items: center;
            justify-content: center;
            padding: 20px;
            box-sizing: border-box;
        `;

        modalDiv.innerHTML = `
            <div style="background:#fff; width:100%; max-width:960px; height:85vh; border-radius:12px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
                <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; background:#0f3d2e; color:#fff;">
                    <div style="display:flex; align-items:center; gap:10px; overflow:hidden;">
                        <i class="fas fa-file-pdf" style="color:#d4af37; font-size:1.2rem;"></i>
                        <h4 id="sectorPdfModalTitle" style="margin:0; font-size:1.05rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">PDF Document Preview</h4>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <a id="sectorPdfModalDownloadBtn" href="#" target="_blank" rel="noopener noreferrer" style="color:#fff; background:rgba(255,255,255,0.15); padding:6px 12px; border-radius:6px; font-size:0.8rem; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
                            <i class="fas fa-download"></i> Download
                        </a>
                        <button type="button" id="sectorPdfModalCloseBtn" style="background:transparent; border:none; color:#fff; font-size:1.4rem; cursor:pointer; line-height:1;" aria-label="Close">
                            &times;
                        </button>
                    </div>
                </div>
                <div style="flex:1; background:#f1f5f9; position:relative;">
                    <iframe id="sectorPdfModalIframe" src="" allow="autoplay" style="width:100%; height:100%; border:none;"></iframe>
                </div>
            </div>
        `;

        document.body.appendChild(modalDiv);

        const closeBtn = modalDiv.querySelector('#sectorPdfModalCloseBtn');
        if (closeBtn) closeBtn.addEventListener('click', closePdfModal);

        modalDiv.addEventListener('click', (e) => {
            if (e.target === modalDiv) closePdfModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalDiv.style.display === 'flex') {
                closePdfModal();
            }
        });
    }

    function openPdfModal(fileId, title) {
        const modal = document.getElementById('sectorPdfModal');
        const iframe = document.getElementById('sectorPdfModalIframe');
        const titleEl = document.getElementById('sectorPdfModalTitle');
        const downloadBtn = document.getElementById('sectorPdfModalDownloadBtn');

        if (!modal || !iframe) return;

        if (titleEl) titleEl.textContent = title;
        if (downloadBtn) downloadBtn.href = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
        iframe.src = `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closePdfModal() {
        const modal = document.getElementById('sectorPdfModal');
        const iframe = document.getElementById('sectorPdfModalIframe');
        if (!modal) return;

        modal.style.display = 'none';
        if (iframe) iframe.src = '';
        document.body.style.overflow = '';
    }
}
