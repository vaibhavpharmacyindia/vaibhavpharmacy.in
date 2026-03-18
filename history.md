# Vaibhav Pharmacy - Master AI Context & Development History

> **SYSTEM PROMPT / INSTRUCTIONS FOR AI ASSISTANTS**
> If you are an AI reading this file, you are acting as an expert web developer, SEO specialist, and digital marketing assistant. You are currently working on the "Vaibhav Pharmacy" project. Read the context below carefully before answering any user prompts or planning new code edits.

---

## 🏥 1. Business Overview
- **Name:** Vaibhav Pharmacy
- **Type:** Highly-rated, affordable retail pharmacy & medical store.
- **Location:** Sector 11, Vrindavan Yojna, Lucknow, Uttar Pradesh.
- **Core Value Proposition:** "Sahi Dava, Sahi Daam" (Honest Medicine, Honest Prices).
- **Brand Voice:** Trustworthy, local, family-focused. Communication should often use **Hinglish** (a blend of Hindi and English) to appeal to the local Lucknow demographic.

## 💻 2. Tech Stack & Architecture
- **Frontend Core:** Pure Vanilla HTML5, CSS3, and JavaScript. 
- **Frameworks:** **NONE**. Do *not* suggest or use React, Vue, Angular, Node.js, Bootstrap, or TailwindCSS.
- **Hosting:** Static site hosted via **Vercel** (connected to GitHub repository). There is no traditional backend server or database.
- **Styling:** Custom Vanilla CSS. Styling is largely handled via CSS variables (e.g., `var(--primary)`, `var(--secondary)`) defined at the top of the stylesheet.
- **Brand Colors:** Primary Green (`#1B5E20`), Accent Orange (`#FF6F00`).

## 📈 3. SEO & GEO (Generative Engine Optimization) Strategy
- **Target Keywords:** `medical store in vrindavan yojna lucknow`, `best pharmacy in lucknow`, `cheapest medicines in vrindavan yojna`, `pharmacy near me`.
- **Schema Markup:** The site relies heavily on extensive JSON-LD schema blocks (`Pharmacy`, `FAQPage`, `BreadcrumbList`, `Article` for blogs) to rank locally.
- **AI Search Optimization:** FAQs and lists are structured specifically to be scraped by Google AI Overviews and Perplexity as "Top 10" or "Best of" semantic blocks.

## 📊 4. Analytics & Tracking
- **Platform:** Google Analytics 4 (Measurement ID: `G-M1GK1K60EQ`).
- **Custom Event Tracking:** There is a centralized vanilla JavaScript event listener at the bottom of `index.html` that captures high-intent actions as standard GA events:
  - `whatsapp_click` (Links containing `wa.me`)
  - `call_click` (Links starting with `tel:`)
  - `directions_click` (Links containing `maps.app.goo.gl`)
  - `blog_click` (Links pointing to the `blog/` directory)
  - `medicine_search` (Hero search queries with results - demand intelligence)
  - `medicine_not_found` (Hero search queries with no results - stock gap signal)
  - `medicine_search_whatsapp` (WhatsApp clicks from hero search - hot leads)

---

## 📅 5. Recent Development Log
*A condensed chronological log of recent development phases.*

### **SEO/GEO Optimization (March 18, 2026)**
- Optimized title tag, meta description, and keywords with trending Google Trends terms (medicine home delivery, ORS, summer health, Hinglish queries).
- Added 5 new FAQ schema questions targeting seasonal (ORS, summer kit, sunscreen) and local (medicine delivery, pollution) trending queries.
- Updated hero tagline to include "Medicine Home Delivery" and added seasonal "Summer Essentials" badge.
- Added "Summer Health Essentials" product card (ORS, Glucon-D, Electral, sunscreen) in the products section.
- Added Article schema to 3 blog posts missing it (`combating-flu.html`, `first-aid-kit.html`, `lucknow-summer-heatstroke-prevention.html`).
- Refreshed all `sitemap.xml` lastmod dates to trigger Google re-crawling.
- Restored 3 missing blog cards to the "Sehat Diary" grid (Mosquito, Holi, First Aid) to re-enable horizontal scrolling functionality on the homepage.
- Redesigned the Sehat Diary section by moving the most recent post (Heatstroke) into a prominent, larger "Featured Card" sitting centered above the older scrollable posts.

| File | Change |
|------|--------|
| `website/index.html` | Meta tags, hero content, 5 new FAQ schema questions, Summer Essentials card |
| `website/blog/combating-flu.html` | Article schema added |
| `website/blog/first-aid-kit.html` | Article schema added |
| `website/blog/lucknow-summer-heatstroke-prevention.html` | Article schema added |
| `website/sitemap.xml` | All lastmod dates refreshed to 2026-03-18 |

### **Demand Capture: Hero Medicine Search (March 18, 2026)**
- Added a prominent medicine search bar in the products section of `index.html` with autocomplete from `inventory.json`.
- Search fires 3 new GA events for demand capture: `medicine_search`, `medicine_not_found`, `medicine_search_whatsapp`.
- "Not found" state shows WhatsApp CTA so visitors can still inquire about medicines not in inventory.
- Fixed `fetchInventory()` not being called on page load (was defined but never invoked in `DOMContentLoaded`).
- Made the **Sehat Diary (Health Tips & Guides)** section horizontally scrollable on both desktop and mobile for better UX.
- Mobile responsive - works on all screen sizes.

| File | Change |
|------|--------|
| `website/index.html` | Added hero search CSS (~210 lines), HTML (search bar + dropdown), JS (autocomplete + GA tracking) |

### **Content Updates (March 17, 2026)**
- Published new blog post "Lucknow ki Garmi aur Loo Se Bachaav" (`lucknow-summer-heatstroke-prevention.html`) focusing on heatstroke prevention, promoting ORS and electrolytes.
- Updated `blog/index.html` to feature the new post and increased article count to 8.
- Updated `index.html` "Sehat Diary" preview block on the homepage to include the new post as the first card, pushing others down.
- Updated `sitemap.xml` with the new blog URL and refreshed `lastmod` dates.

### **UI Updates (March 17, 2026)**
- Changed "consultation" to "help" under the "Dawai Pe Salah" section in `index.html`.

### **Phase 3: Deep SEO, Analytics, and Content (March 11, 2026)**
- **Analytics:** Centralized custom JS event tracking for WhatsApp, phone, maps, and blog clicks.
- **SEO/GEO:** Injected aggressive long-tail keywords into meta tags and JSON-LD schemas. Added a structured FAQ list specifically targeted at AI Overviews ("Top Chemists in Vrindavan Yojna"). Renamed "cheapest pharmacy" to "cheapest medicines".
- **UI:** Reordered homepage sections for better flow (Products → Sehat Diary → VP Family). Added secondary phone number (`+91 9621758381`) across the UI. Replaced static SVG logos with a dynamic animated logo (`vp_newlogo_animated.svg`).
- **Content:** Published "Mosquito Prevention" blog post (`mosquito-prevention-tips-lucknow.html`).
- **Security:** Added a `vercel.json` file configuring strict HTTP security headers (X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, X-XSS-Protection) to harden the static site.

### **Phase 2: Redesign, Local SEO, and "Near Me" Anchors (March 2 - March 8, 2026)**
- **UI:** Added a sticky green top contact bar containing location, hours, phone, and WhatsApp buttons. Redesigned the `blog/index.html` into a modern 2-column card layout with gradient visuals.
- **Content:** Published "Post-Holi Skin Care" and "Women's Health Essentials" blog posts. Made the Customer Reviews section scrollable.
- **SEO:** Massive expansion of "pharmacy near me" keyword anchoring in H1/H2 tags and schemas. Uploaded global `robots.txt` explicitly allowing AI crawlers. Added Google Reviews CTA button.

### **Phase 1: Brand Localization (Jan - Feb 2026)**
- **Translation:** Translated core website copy from formal English into conversational Hinglish to better target the Lucknow demographic.
- **UI:** Initial deployment of Vanilla HTML/CSS foundation.
