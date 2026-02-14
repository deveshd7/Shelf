<div align="center">

# 📚 Shelf

**A beautifully designed personal collection manager for the things you love.**

Track films, books, music, travel destinations, recipes — anything worth remembering. Built with React, TypeScript, and Tailwind CSS.

[![React](https://img.shields.io/badge/React-18.2-61dafb?logo=react&logoColor=white&style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178c6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646cff?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06b6d4?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## What is Shelf?

Shelf is a personal interests board — a flexible, browser-based app that lets you create custom collections and fill them with anything you care about. Think of it as a private Notion-style tracker with a focus on visual, card-based browsing.

No accounts. No servers. Your data lives in your browser's local storage and stays yours.

---

## Features

### Collections
- Create unlimited collections with a custom **name**, **icon**, and **color theme**
- Define your own **field schema** per collection — choose from 11 field types
- Each collection is visually distinct with accent colors (Stone, Amber, Rose, Indigo, Emerald)

### Items
- Add items to any collection with fully customizable fields
- **11 field types** supported:
  - `Text` — short single-line values
  - `Long Text` — notes, descriptions, paragraphs
  - `Rating` — interactive 1–5 star selector
  - `Status` — pick from predefined options (e.g. To Watch / Watching / Watched)
  - `Tags` — comma-separated tag list
  - `URL` — link to external resources
  - `Date` — date picker
  - `Image` — image URL with preview
  - `Toggle` — simple boolean switch
  - `Select` — generic option selector
- Mark items as **favorites** with a heart icon
- **Delete** items with confirmation

### Search, Filter & Sort
- **Real-time search** across all field values in all collections
- Filter by collection, view **All Items**, or browse **Favorites**
- Sort by: Newest, Oldest, Title (A–Z), Highest Rated

### UI & Experience
- **Dark / Light mode** toggle
- Fully **responsive** — works on mobile, tablet, and desktop
- Mobile navigation via slide-out drawer
- Masonry-style card grid
- Smooth transitions and hover effects
- Data persists across page refreshes via **localStorage**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript 5 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS (CDN) |
| Icons | Lucide React |
| ID Generation | uuid |
| Class Utilities | clsx + tailwind-merge |
| Storage | Browser localStorage |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/shelf.git
cd shelf

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build      # Type-check and bundle
npm run preview    # Serve the production build locally
```

---

## Project Structure

```
shelf/
├── index.html                  # HTML entry point (fonts, Tailwind CDN)
├── index.tsx                   # React app bootstrap
├── App.tsx                     # Root component — state, layout, logic
├── types.ts                    # TypeScript interfaces (Item, Collection, AppState…)
├── constants.ts                # Colors, icons, seed data
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
└── components/
    ├── UI.tsx                  # Reusable primitives (Button, Input, Modal, Badge…)
    ├── Sidebar.tsx             # Navigation sidebar
    ├── ItemCard.tsx            # Card component for individual items
    ├── ItemModal.tsx           # Slide-in panel for creating / editing items
    └── CollectionModal.tsx     # Dialog for creating new collections
```

---

## Data Model

```ts
interface Collection {
  id: string;
  name: string;
  icon: string;           // Lucide icon name
  color: string;          // Tailwind color key
  description?: string;
  fields: FieldDefinition[];
  itemIds: string[];
}

interface Item {
  id: string;
  collectionId: string;
  dateAdded: string;
  isFavorite: boolean;
  fieldValues: Record<string, any>;
}

interface FieldDefinition {
  id: string;
  name: string;
  type: FieldType;
  options?: string[];     // For status / select fields
}
```

---

## Roadmap

- [ ] Import / Export collections as JSON
- [ ] Drag-and-drop reordering of items
- [ ] Cloud sync (optional, opt-in)
- [ ] Cover art auto-fetching (OMDB, Open Library API)
- [ ] Keyboard navigation
- [ ] Custom field ordering
- [ ] Bulk actions (delete, move, tag)

---

## Contributing

Contributions are welcome! Please open an issue to discuss ideas or report bugs before submitting a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
Made with care for the things worth collecting.
</div>
