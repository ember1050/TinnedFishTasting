# Changelog

All notable changes to Tinned Fish Rankings are recorded here.

This project ships straight to production (no formal release process yet), so
entries are grouped by date rather than version. The format loosely follows
[Keep a Changelog](https://keepachangelog.com/). When a release process exists,
these date sections can be rolled up into versioned releases.

## 2026-07-16

### Added
- Achievements & profile badges. The first badge, **Perfect Taste**, is awarded automatically when you match every fish in a blind tasting correctly on your first guess. When results are published you get a "You have perfect taste!" popup, and the badge appears next to your name — on your profile, on public profiles, and beside your name on reviews. Hover or tap a badge to see its name and what it means. Earning the same badge in multiple tastings stacks it with a small count. Existing perfect scores from past published tastings were awarded retroactively.

### Fixed
- Editing a review that came from a tasting no longer removes its "Verified Tasting" badge — the verified-tasting provenance is now preserved when you update your scores or notes.

## 2026-07-15

### Fixed
- The "Forgot password?" flow now works end-to-end. Two bugs were preventing it: the reset screen still demanded your *current* password (which you don't have when you've forgotten it), and the emailed recovery link never actually signed you in. Recovery links now establish a session via a new `/auth/callback` handler, and the reset screen asks only for a new password plus confirmation. (The logged-in "change password" screen still requires your current password, as before.)

## 2026-07-14

### Changed
- Fish now show their brand alongside the name everywhere a review lists a fish — on your own profile, on public profiles, and in a tasting's personal report card. Many tinned fish share a name, so the brand is often the only way to tell them apart. (Other listings already showed the brand.)

## 2026-07-13

### Added
- Duplicate protection for fish: a fish is now uniquely identified by brand + name (case-insensitive) + salt level, enforced by a database unique index and a friendly "already exists" message when adding or editing. (Salt level is part of the identity because salted / low-sodium / no-salt variants share a name but are distinct products.)
- Duplicate protection for usernames at sign-up: a taken username now shows a clear "That username is taken" message instead of a raw database error. (Usernames were already enforced unique in the database and in the change-username flow.)

### Changed
- Username rules are now consistent everywhere: sign-up enforces the same 3–30 character limit (letters, numbers, spaces, underscores) that the change-username form already used, with a matching hint on both forms. (Previously sign-up accepted 1–100 characters of any kind.)

### Fixed
- Adding or editing a fish with a larger image (roughly over 1 MB) failed with an error. Fish photos are now downscaled (max 1024px) and compressed to WebP in the browser before upload — the same treatment avatars already got — so uploads reliably stay under the Server Action body limit and use far less storage. Also raised the Server Action body limit to 5 MB (it silently defaulted to 1 MB, contradicting the app's own 5 MB image validation).

## 2026-07-01

### Added
- Profile pictures are now automatically downscaled (max 512px) and compressed to WebP in the browser before upload, so large photos no longer fail or waste storage.

### Removed
- The dedicated "Manage Fish" admin tab. Fish management stays available through the admin-only inline "Add Fish" (fish list) and "Edit" (fish detail) controls.

### Changed
- Tasting host view: participant names are now clickable links to their profiles (in both the participants list and the guesses panel), and the guessing panel now shows each participant's score, the backup guess's brand, and whether the first or backup guess earned the points (first = 2 pts, backup = 1 pt).
- The Content-Security-Policy Supabase origin is now derived from `NEXT_PUBLIC_SUPABASE_URL` instead of being hardcoded, so staging and production each whitelist their own project.

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
