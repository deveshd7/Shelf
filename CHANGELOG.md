# Changelog

All notable changes to **Shelf** are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

> Changes staged for the next release.

### Planned
- Import / Export collections as JSON
- Drag-and-drop reordering of items
- Cover art auto-fetching via OMDB / Open Library APIs
- Cloud sync (optional, opt-in)
- Keyboard navigation support
- Bulk item actions (delete, move, tag)
- Custom field ordering within a collection

---

## [0.1.0] — 2026-02-14

### Added — Application Launch

This is the initial public release of **Shelf**.

#### Core Application (`ff0ce9b`)
**feat: Initialize Shelf application with Vite**

Full application scaffold created from scratch:

**Collections**
- Create custom collections with a name, icon, and color theme
- Choose from 10 icons (Library, Film, Music, Utensils, Plane, Lightbulb, BookOpen, Camera, Coffee, Heart)
- Choose from 5 color themes (Stone, Amber, Rose, Indigo, Emerald)
- Add an optional description to each collection
- Build a custom field schema per collection using the Collection creation modal

**Items**
- Add, edit, and delete items within any collection
- 11 supported field types:
  - `text` — single-line text input
  - `long_text` — multi-line textarea
  - `rating` — interactive 1–5 star selector
  - `status` — button-group selector from predefined options
  - `tags` — comma-separated tag list
  - `url` — URL / link field
  - `date` — native HTML date picker
  - `image` — image URL with card preview
  - `toggle` — boolean on/off switch
  - `select` — generic option picker
- Mark/unmark any item as a **favourite**
- All items track a `dateAdded` timestamp automatically

**Search, Filter & Sort**
- Real-time full-text search across all field values
- Filter by collection, view **All Items**, or browse **Favourites**
- Sort options: Newest first, Oldest first, Title (A–Z), Highest Rated

**UI & Responsive Design**
- Dark and Light mode toggle
- Responsive layout — fixed sidebar on desktop, slide-out drawer on mobile
- Masonry card grid (1 → 2 → 3 → 4 columns at breakpoints)
- `ItemCard` with cover image, star rating, status badge, tags, and favourite indicator
- `ItemModal` — slide-in right panel for creating and editing items
- `CollectionModal` — dialog with schema builder for new collections
- Reusable component library: `Button`, `Input`, `Textarea`, `Modal`, `Badge`, `Sheet`, `Icon`
- Hover effects (image zoom, gradient overlay) and smooth CSS transitions

**Data Persistence**
- All data stored in `localStorage` under the key `shelf-app-data-v1`
- Custom `useStickyState` React hook syncs state to localStorage on every change
- Seed data pre-loaded on first launch:
  - *Films to Watch* collection (2 sample films: Interstellar, Past Lives)
  - *Library* collection (2 sample books: Dune, The Design of Everyday Things)

**Files introduced:**
```
App.tsx
index.tsx
index.html
types.ts
constants.ts
package.json
tsconfig.json
vite.config.ts
.gitignore
metadata.json
components/UI.tsx
components/Sidebar.tsx
components/ItemCard.tsx
components/ItemModal.tsx
components/CollectionModal.tsx
```

---

#### Dependency & Build Upgrade (`ce886b2`)
**feat: Update dependencies and build configuration**

- Upgraded React to **18.2**, Vite to **5.1**, TypeScript to **5.2**
- Added `uuid` package for deterministic unique ID generation (replaces `Math.random()` approach)
- Added `clsx` and `tailwind-merge` for robust conditional class name handling
- Updated build script to run `tsc` (type-check) before `vite build`
- Refactored `vite.config.ts` for improved clarity
- Bumped `tsconfig.json` compiler options to target ES2020

**Files changed:**
```
constants.ts
index.html
package.json
tsconfig.json
vite.config.ts
```

---

## [0.0.0] — 2026-02-14

### Added — Repository Initialisation (`0083f0e`)
**Initial commit**

- Created the GitHub repository
- Added base `README.md` (placeholder from AI Studio template)

---

<!-- Links -->
[Unreleased]: https://github.com/YOUR_USERNAME/shelf/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/YOUR_USERNAME/shelf/releases/tag/v0.1.0
[0.0.0]: https://github.com/YOUR_USERNAME/shelf/releases/tag/v0.0.0
