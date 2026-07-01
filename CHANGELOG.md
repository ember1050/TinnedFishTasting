# Changelog

All notable changes to Tinned Fish Rankings are recorded here.

This project ships straight to production (no formal release process yet), so
entries are grouped by date rather than version. The format loosely follows
[Keep a Changelog](https://keepachangelog.com/). When a release process exists,
these date sections can be rolled up into versioned releases.

## 2026-07-01

### Added
- Profile pictures are now automatically downscaled (max 512px) and compressed to WebP in the browser before upload, so large photos no longer fail or waste storage.

## 2026-06-29

### Added
- Admin navigation: an admin-only section in the profile dropdown linking "Manage Fish" and "View Feedback" (both pages were previously unreachable from the UI).

### Changed
- `/admin/fish` now lists live fish from the database with working edit links (it previously rendered hardcoded prototype data).

### Removed
- Prototype mock-data fallbacks from the data layer (`mock-data.ts`); the app now relies solely on live data.

## 2026-06-28

### Added

- Up/down voting on reviews.
- Submission date shown on each review.
- Review pagination (5 per page) with a Newest / Most popular sort, all handled client-side (no page reload).
- Profile customization: change username (unique), email, and avatar; working password reset.
- Public profiles with clickable usernames.
- Password change now requires the current password plus a new-password confirmation.
- Tasting: participants submit/lock their own guesses; host sees who's done, brand, and correct/incorrect.
- Tasting: host can backtrack stages until the tasting is published.

### Fixed

- Mobile: added viewport meta — fixes zoomed-out scaling and untappable in-tasting buttons.
- Reviews no longer disappear when a fish has votes (pinned the ambiguous `reviews → profiles` foreign key introduced by the new votes table).

### Changed

- Standardized the brand name to "Tinned Fish Rankings".

## 2026-06-27

### Added

- Tasting baseball cards and host-default control panel.
- Server-action input validation (zod) with friendlier error messages.

### Changed

- Tasting sliders to a 1–10 scale.

### Fixed

- Tasting UX from testing: join flow, leave, guesses, interlude.
- Hide published public tastings from the active hub listing.
- Null-slider error; only complete reviews count toward publish.

### Removed

- Aesthetics dimension from tasting reviews.

## 2026-06-24

### Added

- Full tasting flow: backend state machine, host panel, blind, guess, results, Supabase Realtime.
- Feedback (bug/feature) system.
- Radar chart, colored type tags, price tier, grams, and Value tooltip on fish table/detail.
- Content-addressed fish images with dedup and orphan cleanup.
- Error boundaries, custom not-found page, security headers, report-only CSP.
- One-review-per-user/fish with anti-spoof and upload hardening.
- Sign-out moved into a profile dropdown to prevent accidental logout.

### Changed

- Value score = geometric mean of protein-per-dollar and grams-per-dollar.
- Salt level extracted into a structured field.

### Fixed

- Login open-redirect prevention; image letterboxing; Value tooltip clipping/wording.

### Removed

- The $–$$$$ cost tier and Cost column.

## 2026-06-23

### Added

- Seed data: 45 tinned fish products (mackerel, salmon, sardine, trout, tuna).
- Review submission page with score sliders; login/review CTA.
- Profile wired to real user data; image upload via Supabase Storage.
- Inline admin controls (Add Fish, Edit).

## 2026-06-22

### Added

- Supabase data layer, authentication, and admin fish creation.

### Changed

- Renamed `middleware.ts` to `proxy.ts` (Next.js 16 convention).

## 2026-06-18

### Added

- Initial prototype: Next.js scaffold, Supabase schema, mock data, fish browsing, tasting flow, password reset page.
