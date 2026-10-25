# OBUMSJ HOMEPAGE UI DEVELOPMENT HISTORY & ARCHITECTURAL SPECIFICATION

> **Authoritative Project Documentation & Source of Truth**<br>
> **Repository:** `C:\Users\gsd\Desktop\OBUMSJ-main`<br>
> **Remote Origin:** `https://github.com/HD02866/OBUMSJ.git`<br>
> **Active Branch:** `main` (HEAD commit: `2a17f24`)<br>
> **Status:** Active / Production-Ready Homepage Architecture<br>
> **Document Purpose:** Preserve all historical development decisions, UI requirements, Git merge lineage, architectural invariants, and verification statuses to prevent accidental degradation or regression in future development.

---

## TABLE OF CONTENTS
1. [Executive Summary & Core Directives](#1-executive-summary--core-directives)
2. [Git Repository Architecture & Merge Lineage](#2-git-repository-architecture--merge-lineage)
3. [Five-Tier Verification Framework](#3-five-tier-verification-framework)
4. [Comprehensive Homepage Feature Specification & Verification Matrix](#4-comprehensive-homepage-feature-specification--verification-matrix)
   - [4.1 Global Navigation & Mobile Header](#41-global-navigation--mobile-header)
   - [4.2 Hero Section & Primary Call-to-Actions](#42-hero-section--primary-call-to-actions)
   - [4.3 Two-Column Visit Section](#43-two-column-visit-section)
   - [4.4 About Us Section](#44-about-us-section)
   - [4.5 Vision & Mission Section](#45-vision--mission-section)
   - [4.6 All Sectors Section & Real Routing](#46-all-sectors-section--real-routing)
   - [4.7 Blog Section](#47-blog-section)
   - [4.8 Testimonials Section & Carousel Engine](#48-testimonials-section--carousel-engine)
   - [4.9 Donation Section & Payment-Method Cards](#49-donation-section--payment-method-cards)
   - [4.10 Day / Night Theme Engine & Geometric Canvas](#410-day--night-theme-engine--geometric-canvas)
   - [4.11 Multilingual Translation Engine (4 Languages & RTL)](#411-multilingual-translation-engine-4-languages--rtl)
   - [4.12 Progressive Web App (PWA) & Offline Suite](#412-progressive-web-app-pwa--offline-suite)
   - [4.13 Motion, Scroll-Reveal & Directional Animations](#413-motion-scroll-reveal--directional-animations)
5. [Backend, Authentication & Role-Based Access Control (RBAC)](#5-backend-authentication--role-based-access-control-rbac)
6. [Shared Dependencies, Subpages & Asset Inventory](#6-shared-dependencies-subpages--asset-inventory)
7. [Backup Inventory & Non-Destructive Protection Strategy](#7-backup-inventory--non-destructive-protection-strategy)
8. [Known Issues, Edge Cases & Unresolved Inquiries](#8-known-issues-edge-cases--unresolved-inquiries)
9. [Safe Testing, Verification & GitHub Release Protocol](#9-safe-testing-verification--github-release-protocol)

---

## 1. EXECUTIVE SUMMARY & CORE DIRECTIVES

The **OBUMSJ (Oda Bultum University Muslim Students Jama'ah)** web platform is a community and educational portal serving university students, alumni, and supporters. The platform combines public-facing informational sections, multilingual content delivery, instant financial donation gateways, an installable Progressive Web App (PWA), and authenticated role-based member/administrative portals backed by Firebase.

### Core Directives for All Future Engineering Sessions:
1. **Preserve the Latest Homepage UI**: The visual architecture represented in `OBUMSJ Website/index.html` at commit `2a17f24` is the hard-won product of extensive visual and responsive optimization. It must never be reverted to earlier barebones templates or simplified replacements.
2. **Strict Scope Isolation**: Changes to the homepage must never break or alter subpages, Firebase authentication, Firestore security rules, role permissions, or database operations.
3. **No Unilateral Overwriting**: Before editing any shared CSS (`style.css`, `css/design-system.css`) or shared JavaScript (`Script.js`, `js/language-system.js`), create a dated safety backup copy and verify that styles do not degrade existing subpages.
4. **Adherence to Grounded Evidence**: Features must be classified accurately according to the five-tier verification framework established below. Never claim an unverified feature is operational without static or runtime proof.

---

## 2. GIT REPOSITORY ARCHITECTURE & MERGE LINEAGE

### 2.1 The Two Unrelated Histories
The local Git repository at `C:\Users\gsd\Desktop\OBUMSJ-main` originally emerged from two historically unrelated development branches:

```
[Remote origin/main Lineage]                     [Local master Lineage]
f03adf9 ("first commit")                                c11e380 ("Home Page UI")
   │                                                           │
   ▼                                                           │
4a01348 ("Centralize Firebase, enforce role security...")      │
   │                                                           │
   ▼                                                           │
84117f9 ("Login Fix")                                          │
   │                                                           │
   ▼                                                           │
39ebe13 ("UI Upgrade")                                         │
   │                                                           │
   └───────────────────────────┬───────────────────────────────┘
                               │
                               ▼
        2a17f24 ("Merge main into master and preserve Home Page UI")
               (HEAD -> main, origin/main)
```

### 2.2 Merge Commit Details (`2a17f24`)
- **Commit Hash:** `2a17f24419999be7815cfb2a60965d1d6cb582be`
- **Date:** Sat Oct 24 17:53:56 2026 -0700
- **Author:** Hamdi Seid `<hamdiseid58@gmail.com>`
- **Parent 1 (`c11e380`):** Local `master` branch. Contained the modern homepage UI, responsive layout containers, donation card enhancements, PWA configuration, and four-language translation dictionaries.
- **Parent 2 (`39ebe13`):** GitHub `origin/main` branch. Contained centralized Firebase architecture (`firebase-config.js`), Firestore security rules (`firestore.rules`), Vercel deployment configuration (`vercel.json`), login authentication fixes (`Login.html`), and role-based access portals (`member.html`, `female-member.html`).
- **Merge Strategy Rationale:** The merge was executed using `--allow-unrelated-histories`. The local homepage version of `OBUMSJ Website/index.html` was deliberately and completely preserved from Parent 1 (`c11e380`), leaving **0 diff lines** between Parent 1's `index.html` and the merge commit. Parent 2's backend security rules and subpage structures were successfully incorporated.

### 2.3 Preserved Branch References
To guarantee zero data loss, two immutable backup branches were established prior to the merge:
- `backup-master-before-merge` (pointing directly to `c11e380`)
- `backup-main-before-merge` (pointing directly to `39ebe13`)

---

## 3. FIVE-TIER VERIFICATION FRAMEWORK

To prevent assumptions from being mistaken for facts, all features and requirements in this project are tracked across five strict verification tiers:

1. **Requested (`REQ`)**: The feature was formally requested by the project owner or master prompt.
2. **Found in Code (`CODE`)**: Relevant source code, HTML markup, CSS classes, or JS functions exist in the project files.
3. **Statically Checked (`STAT`)**: Implementation syntax, file existence, AST structure, JSON validity, or CSS selectors have been confirmed via static analysis without executing the browser runtime.
4. **Runtime Tested (`RUN`)**: The feature has been exercised in a live browser engine, Chrome DevTools Protocol (CDP) session, local web server, or Node.js environment with observed outputs.
5. **Not Verified (`UNVER`)**: The feature has not been subjected to empirical testing in its intended target environment (e.g., live cloud backend, specific mobile hardware, SMS payment APIs).

---

## 4. COMPREHENSIVE HOMEPAGE FEATURE SPECIFICATION & VERIFICATION MATRIX

| Section / Feature | Tier Status | Key Files Involved | Summary of Intended Behavior |
| :--- | :--- | :--- | :--- |
| **4.1 Mobile Navbar & Hamburger Menu** | `RUN` | `index.html`, `style.css`, `Script.js` | 3-line hamburger menu remains visible and touch-accessible (>=44x44px) alongside responsive "App"/"Get App" button down to 320px viewport without overlapping. |
| **4.2 Hero Section & Primary CTAs** | `STAT` | `index.html`, `style.css` | Prominent title, mission tagline, dual CTA buttons ("Explore Sectors", "Donate Now") with dynamic border animation and smooth scrolling. |
| **4.3 Two-Column Visit Section** | `RUN` | `index.html`, `style.css` | Desktop 2-column balanced grid; mobile vertical stack where image maintains constrained responsive height (`object-fit: cover`) and text never squishes image. Glassmorphic card over geometric background. |
| **4.4 About Us Section** | `STAT` | `index.html`, `style.css`, `Script.js` | Comprehensive organizational overview, animated statistical counters (`data-target`), and direct navigation link to `About-Us.html`. |
| **4.5 Vision & Mission Section** | `STAT` | `index.html`, `style.css` | Side-by-side interactive vision and mission cards with subtle border illumination, hover transforms, and dark-mode contrast. |
| **4.6 All Sectors Section & Real Routing** | `STAT` | `index.html`, `style.css` | Grid of official Jama'ah sectors linking to actual subpages: Education, Health, Economy, Da'wah, Public Relations, Research, Social Affairs, and Charity. |
| **4.7 Blog Section** | `STAT` | `index.html`, `style.css` | 3-card responsive editorial grid displaying article thumbnails, publication dates, category badges, and read-more targets. |
| **4.8 Testimonials Section & Carousel** | `STAT` | `index.html`, `style.css`, `Script.js` | 3-slide rotating carousel with active slide indicators, previous/next buttons, authentic student quotes, and link to community leadership. |
| **4.9 Donation Section & Payment Cards** | `RUN` | `index.html`, `donate.html`, `Script.js` | Official Ethiopian banking details (CBE `1000442820604`, CBO `1000096071338`, E-birr `0915404018`) with 1-click clipboard copy, visual toast confirmation, and bank logos. |
| **4.10 Day / Night Theme Engine** | `RUN` | `Script.js`, `style.css`, `design-system.css` | Persisted theme toggle via `body.dark-mode` and `localStorage`, updating color tokens, shadows, geometric canvas, and sun/moon UI icon. |
| **4.11 Multilingual Translation Engine** | `RUN` | `language-system.js`, `en.json`, `am.json`, `om.json`, `ar.json` | 4-language support (English, Amharic, Afaan Oromoo, Arabic) via asynchronous JSON bundle loading, `data-i18n` DOM scanning, and RTL directionality for Arabic. |
| **4.12 PWA & Offline Support** | `STAT` | `manifest.webmanifest`, `sw.js`, `offline.html` | Installable Web App with standalone display mode, caching service worker for core assets, offline fallback page, and custom install prompt hook. |
| **4.13 Motion & Directional Animations** | `STAT` | `style.css`, `design-system.css`, `Script.js` | IntersectionObserver scroll reveal, button border gradient rotation, counter increments, and RTL-aware entrance directionality. |

---

### Detailed Section Analyses:

### 4.1 Global Navigation & Mobile Header
- **Requirements (`REQ`)**: Navbar must accommodate the OBUMSJ logo, navigation links, Day/Night toggle, language selector, "Download App" button, and a 3-line hamburger toggle on mobile. On narrow phone screens (320px–412px), the hamburger button must never be hidden, cut off, or covered by the Download App button.
- **Code Implementation (`CODE`)**: Located in `index.html` lines 72–148. Uses flexbox container `.navbar` with `.nav-brand`, `.nav-actions`, and `.hamburger`.
- **Static Check (`STAT`)**: CSS media queries at `@media (max-width: 900px)` and `@media (max-width: 480px)` establish flexible shrinking for the Download App button (`padding: 0.4rem 0.65rem`, `font-size: 0.8rem`), hiding non-essential text on ultranarrow viewports (`< 360px`) while preserving the hamburger button with a guaranteed `44px x 44px` minimum touch target and `z-index: 1002`.
- **Runtime Verification (`RUN`)**: Verified across viewport dimensions (320px, 375px, 412px, 768px, 1280px) via browser rendering and CDP emulation. All three lines of the hamburger icon remain visible, click-responsive, and free of overlap.

### 4.2 Hero Section & Primary Call-to-Actions
- **Requirements (`REQ`)**: Atmospheric hero banner establishing identity, core values, and immediate pathways to Explore Sectors and Donate.
- **Code Implementation (`CODE`)**: `index.html` lines 152–185 (`section.hero-section`).
- **Static Check (`STAT`)**: Utilizes `.hero-content`, `.hero-title`, `.hero-description`, and dual action buttons `.btn-primary` and `.btn-secondary` with `.btn-animated-border`. Background combines hero imagery with semi-transparent dark gradients to ensure WCAG AA text contrast.

### 4.3 Two-Column Visit Section
- **Requirements (`REQ`)**: Balanced two-column presentation on desktop; stacked column on mobile. Mobile image must not be compressed or crushed by accompanying text. Background must showcase the global geometric theme rather than an opaque black/white block.
- **Code Implementation (`CODE`)**: `index.html` lines 190–248 (`section.visit-section`).
- **Static Check (`STAT`)**: CSS in `style.css` defines `.visit-container` as a CSS Grid (`grid-template-columns: 1fr 1fr` on desktop, stacking to `1fr` at `<= 992px`). Image container uses `min-height: 280px`, `max-height: 420px`, and `img { object-fit: cover; width: 100%; height: 100%; border-radius: var(--radius-lg); }`. Glassmorphic card styling utilizes `background: var(--card-bg-translucent)` with `backdrop-filter: blur(8px)`.
- **Runtime Verification (`RUN`)**: Rendered in browser; confirmed that on viewport widths from 320px to 480px, the image sits cleanly above the text card with fixed proportional height, avoiding textual compression.

### 4.4 About Us Section
- **Requirements (`REQ`)**: Highlight the mission, organizational roots, leadership ethos, and quantitative metrics (members, active sectors, community programs).
- **Code Implementation (`CODE`)**: `index.html` lines 252–315 (`section#about-us`).
- **Static Check (`STAT`)**: Features counter grid `.stats-grid` with `.stat-card` elements containing `data-target="1500+"`, `data-target="8"`, etc. Interactive counter animation logic exists in `Script.js` lines 340–385, triggered by `IntersectionObserver`. Link points to `./About-Us.html`.

### 4.5 Vision & Mission Section
- **Requirements (`REQ`)**: Present clear institutional vision and mission statements in side-by-side dedicated containers with modern card styling and theme adaptation.
- **Code Implementation (`CODE`)**: `index.html` lines 320–380 (`section#vision-mission`).
- **Static Check (`STAT`)**: Uses `.vision-mission-grid` with `.vm-card` elements. Includes subtle glowing borders via `box-shadow: var(--card-glow)` and hover elevations (`transform: translateY(-6px)`).

### 4.6 All Sectors Section & Real Routing
- **Requirements (`REQ`)**: Showcase all functional Jama'ah sectors with accurate descriptive text and real hyperlinks to existing sector pages. Must not use dead `#` anchors.
- **Code Implementation (`CODE`)**: `index.html` lines 385–480 (`section#sectors`).
- **Static Check (`STAT`)**: Verified that sector card links point to genuine files:
  - Education Sector -> `sector-education.html`
  - Health Sector -> `sector-health.html`
  - Economy Sector -> `sector-economy.html`
  - Da'wah Sector -> `sector-dawah.html`
  - Public Relations -> `sector-pr.html`
  - Research & Development -> `sector-research.html`
  - Social Affairs -> `sector-social.html`
  - Charity Sector -> `sector-charity.html`

### 4.7 Blog Section
- **Requirements (`REQ`)**: Responsive grid displaying current Jama'ah announcements, religious insights, and student articles.
- **Code Implementation (`CODE`)**: `index.html` lines 485–540 (`section#blog`).
- **Static Check (`STAT`)**: `.blog-grid` contains three `.blog-card` articles with thumbnail images (`loading="lazy"`), date metadata, author tags, and read-more links.

### 4.8 Testimonials Section & Carousel Engine
- **Requirements (`REQ`)**: Display authentic feedback from students and alumni with a smoothly rotating or controllable carousel, star ratings, and links to detailed community stories.
- **Code Implementation (`CODE`)**: `index.html` lines 650–760 (`section.testimonials-section`) and `Script.js` lines 410–520.
- **Static Check (`STAT`)**: Contains three complete testimonial slides:
  - Slide 1: Ahmed Mohamed (Avatar: `./IMAGE/Abdulmenan.jpg`, Qirat/Academic growth)
  - Slide 2: Fatima Abdallah (Avatar: `./IMAGE/trial.jpg`, Qirat sector excellence)
  - Slide 3: Yusuf Hassan (Avatar: `./IMAGE/Baba kenya 1.jpg`, Da'wah sector leadership)
  Includes carousel track `.testimonials-track`, previous/next buttons (`#prevTestimonialBtn`, `#nextTestimonialBtn`), and pagination dots (`.testimonial-dots`). Navigation CTA links to `./About-Us.html`.

### 4.9 Donation Section & Payment-Method Cards
- **Requirements (`REQ`)**: Make donating straightforward and trustworthy. Display real Ethiopian banking details for CBE, CBO, and E-birr. Provide 1-click copy-to-clipboard functionality with clear visual feedback toast. Do not invent fake account numbers.
- **Code Implementation (`CODE`)**: `index.html` lines 545–622 (`section#donate`) and `donate.html`.
- **Static Check (`STAT`)**: Real accounts verified in code:
  - **Commercial Bank of Ethiopia (CBE)**: Account No: `1000442820604` (Swift: `CBETETAA`, Account Name: OBUMSJ Organization)
  - **Cooperative Bank of Oromia (CBO)**: Account No: `1000096071338` (Account Name: OBUMSJ Organization)
  - **E-birr Mobile Banking**: Mobile No: `0915404018` (Account Name: OBUMSJ Organization)
  - Copy buttons use `data-copy-target` pointing to ID elements; `Script.js` registers clipboard API with visual toast `#copyToast` and aria-live status update.
- **Runtime Verification (`RUN`)**: Clipboard interaction tested and verified; clicking copy triggers `navigator.clipboard.writeText` and presents the toast notification `#copyToast`.

### 4.10 Day / Night Theme Engine & Geometric Canvas
- **Requirements (`REQ`)**: Complete dark and light theme switching. Theme must persist across sessions, smoothly transform typography, card backgrounds, and borders, and adjust the geometric background.
- **Code Implementation (`CODE`)**: `css/design-system.css`, `style.css`, and `Script.js` lines 45–110.
- **Static Check (`STAT`)**: CSS variables define `--bg-primary`, `--text-primary`, `--card-bg`, and `--border-color` under `:root` and `body.dark-mode`. Theme toggle button `#themeToggle` triggers `toggleTheme()` in `Script.js` which saves state in `localStorage.setItem('obumsj_theme', ...)`.
- **Runtime Verification (`RUN`)**: Verified toggle operation in browser. Body class dynamically toggles between light and `dark-mode`, icons switch between sun (`fa-sun`) and moon (`fa-moon`), and local storage correctly retains preference across reloads.

### 4.11 Multilingual Translation Engine (4 Languages & RTL)
- **Requirements (`REQ`)**: Support English (`en`), Amharic (`am`), Afaan Oromoo (`om`), and Arabic (`ar`). Text must update dynamically without full page reload. Arabic must set layout direction to Right-to-Left (`dir="rtl"`).
- **Code Implementation (`CODE`)**: `js/language-system.js` and JSON dictionary files (`js/en.json`, `js/am.json`, `js/om.json`, `js/ar.json`).
- **Static Check (`STAT`)**: Node.js JSON validation confirms all four dictionaries are syntactically valid JSON and share identical key hierarchies. `js/language-system.js` scans DOM elements with `data-i18n` attributes, replaces text content, and toggles `document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr'`.
- **Runtime Verification (`RUN`)**: Verified language switching in browser. Selecting Amharic, Oromo, or Arabic successfully updates navigation headers, section titles, and button labels in real time.

### 4.12 Progressive Web App (PWA) & Offline Suite
- **Requirements (`REQ`)**: Website must be installable as a standalone app on Android, iOS, and desktop browsers. Must include manifest, icons, service worker, and offline fallback.
- **Code Implementation (`CODE`)**: `manifest.webmanifest`, `sw.js`, `offline.html`, and `Script.js` lines 180–245.
- **Static Check (`STAT`)**:
  - `manifest.webmanifest`: Valid JSON, `display: "standalone"`, `start_url: "/index.html"`, theme color `#1a5d1a`, icon definitions at `192x192` and `512x512` pointing to `./IMAGE/icon-192.png` and `./IMAGE/icon-512.png`.
  - `sw.js`: Service worker caches static assets during `install` event and handles network-first / cache-fallback during `fetch` events, serving `offline.html` on network failure.
  - Custom install prompt handler catches `beforeinstallprompt` event and wires up `#installAppBtn` and `.btn-download-app`.

### 4.13 Motion, Scroll-Reveal & Directional Animations
- **Requirements (`REQ`)**: Elements should reveal smoothly as the user scrolls. Animation directions must be respectful of language directionality (LTR vs RTL). Buttons should feature dynamic glowing border animations.
- **Code Implementation (`CODE`)**: `css/design-system.css` (`@keyframes borderRotate`), `style.css` (`.reveal-on-scroll`, `.reveal-horizontal`), and `Script.js`.
- **Static Check (`STAT`)**: `IntersectionObserver` in `Script.js` adds `.is-revealed` class when elements cross viewport threshold. CSS handles transform translations and opacity transitions smoothly (`transition: transform 0.6s ease-out, opacity 0.6s ease-out`).

---

## 5. BACKEND, AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)

The project includes authenticated portals originally integrated in Parent 2 (`39ebe13`) and fully preserved in `main` (`2a17f24`):

### 5.1 Centralized Firebase Configuration
- **File:** `OBUMSJ Website/firebase-config.js`
- **Architecture (`STAT`)**: Exports single initialized instances of `firebase.auth()` and `firebase.firestore()`. Replaces legacy fragmented inline credentials with centralized initialization.

### 5.2 Role-Based Portals & Access Control
- **Administrative Portal:** `admin.html` (Member management, announcements, event creation, role elevation).
- **General Member Portal:** `member.html` & `member.js` (Member profile, event attendance, internal announcements).
- **Female Member Portal:** `female-member.html` & `female-member.js` (Dedicated space for female student affairs, programs, and communications).
- **Login Controller:** `Login.html` (Email/password authentication with role verification redirecting to appropriate portal).

### 5.3 Firestore Security Rules
- **File:** `firestore.rules`
- **Implementation (`STAT`)**: Enforces document-level permissions based on `request.auth != null` and user role claims in `/databases/{database}/documents/users/$(request.auth.uid)`. Prevents unauthorized modifications to administrative collections.

### 5.4 Vercel Deployment Configuration
- **File:** `vercel.json`
- **Implementation (`STAT`)**: Directs static routing, clean URLs, and custom header security policies.

---

## 6. SHARED DEPENDENCIES, SUBPAGES & ASSET INVENTORY

### 6.1 Subpages Dependent on Shared CSS/JS
Modifications to `style.css` or `Script.js` directly impact the following subpages:
- `OBUMSJ Website/donate.html` (Dedicated donation page)
- `OBUMSJ Website/About-Us.html` (Extended history and organizational structure)
- `OBUMSJ Website/Login.html` (Authentication gateway)
- `OBUMSJ Website/member.html` & `female-member.html`
- `OBUMSJ Website/admin.html`
- All sector pages (`sector-*.html`)

### 6.2 Key Assets in `OBUMSJ Website/IMAGE/`
- Bank logos: `Commercial Bank of Ethiopia.png`, `Cooperative Bank of Oromia.png`, `E-birr.png`, `Telebirr.png`
- App icons: `icon-192.png`, `icon-512.png`, `OBUMSJ Logo.jpg`
- Hero & community imagery: `Abdulmenan.jpg`, `trial.jpg`, `Baba kenya 1.jpg`, `Oda Bultum.jpg`

---

## 7. BACKUP INVENTORY & NON-DESTRUCTIVE PROTECTION STRATEGY

### 7.1 Preserved Git Branches
1. `backup-master-before-merge` (`c11e380`): Complete snapshot of the local master branch before merging.
2. `backup-main-before-merge` (`39ebe13`): Complete snapshot of GitHub remote main before merging.

### 7.2 Working-Tree Non-Git Backups (`.bak-*`)
The following files exist in `OBUMSJ Website/` and must be preserved until formal archiving:
- `index.html.bak-phase2`, `index.html.bak-refine`, `index.html.bak-mobile-nav`
- `style.css.bak-phase2`, `style.css.bak-refine`, `style.css.bak-mobile-nav`
- `css/design-system.css.bak-phase2`, `css/design-system.css.bak-refine`, `css/design-system.css.bak-mobile-nav`
- `Script.js.bak-phase2`, `Script.js.bak-refine`, `Script.js.bak-mobile-nav`
- `donate.html.bak-refine`
- `js/language-system.js.bak-phase2`, `js/theme-engine.js.bak-phase2`

### 7.3 Protection Protocol
- **Rule 1**: Never perform `git reset --hard`, `git clean -fd`, or force pushes (`git push --force`).
- **Rule 2**: When consolidating or cleaning files, copy `.bak-*` files into a dedicated non-deployed folder (e.g., `_backups/`) rather than permanently deleting them.
- **Rule 3**: Always create a new dated backup before modifying `index.html`, `style.css`, or `Script.js`.

---

## 8. KNOWN ISSUES, EDGE CASES & UNRESOLVED INQUIRIES

1. **Linux / Host Filepath Casing Sensitivity (`UNVER`)**:
   - Local Windows filesystem is case-insensitive, while remote hosts (Vercel, GitHub Pages, Linux servers) enforce strict case matching.
   - Example: Paths referencing `./IMAGE/Commercial Bank of Ethiopia.png` must match the exact case of the filesystem. All image and script tags should be systematically audited for casing consistency before production deployment.
2. **Production Firebase Firestore Live Connectivity (`UNVER`)**:
   - `firebase-config.js` and `firestore.rules` are syntactically sound, but live user registration, token refresh, and role claim evaluation must be verified against an active Firebase project with valid credentials.
3. **CSS Specificity Redundancy (`STAT`)**:
   - `style.css` contains some older styling blocks that are partially superseded by `css/design-system.css`. While they do not cause visual defects, consolidation will streamline future styling work.
4. **Telebirr Integration Opportunity (`REQ` / `CODE`)**:
   - The asset `IMAGE/Telebirr.png` is present in the repository, but Telebirr is not yet rendered as an active payment card in `index.html` (which currently features CBE, CBO, and E-birr). Once official Telebirr merchant/account details are provided, it can be added to the donation card grid.

---

## 9. SAFE TESTING, VERIFICATION & GITHUB RELEASE PROTOCOL

### 9.1 Local Testing Checklist
Before committing any future changes, developers must complete this verification routine:
1. **Launch Local Server**:
   ```powershell
   node serve.js
   ```
   Access `http://127.0.0.1:8080/` in a modern browser.
2. **Mobile Viewport Inspection**:
   - Open Chrome DevTools (`F12`), toggle Device Toolbar (`Ctrl+Shift+M`).
   - Test screen widths: `320px`, `360px`, `375px`, `412px`, `768px`, and `1200px`.
   - Verify that the 3-line hamburger menu button is clearly visible and clickable on all widths.
   - Verify that the Download App button shrinks or collapses text gracefully without overlapping the hamburger button.
3. **Interactive Feature Verification**:
   - Click the Day/Night theme toggle: verify contrast, background canvas, and icon swap.
   - Select each language (Amharic, Afaan Oromoo, Arabic, English): verify DOM translation and RTL alignment for Arabic.
   - Click the "Copy" buttons on the donation cards: verify clipboard copy and toast notification.
   - Verify that the testimonial carousel advances slides smoothly via arrow buttons and dots.
4. **Console Cleanliness**:
   - Confirm that zero JavaScript errors or 404 network warnings appear in the DevTools console.

### 9.2 GitHub Commit & Release Strategy
1. **Commit Messages**: Always write descriptive commit messages detailing the exact section modified (e.g., `docs(audit): create homepage development history document`).
2. **Feature Branching**: Create isolated feature branches for subsequent major features (e.g., `git checkout -b feature/telebirr-integration`).
3. **Release Tagging**: Tag verified production milestones (e.g., `git tag -a v1.0.0 -m "Production Homepage with RBAC and PWA"`).

---
*End of Development History & Architectural Specification Document.*
