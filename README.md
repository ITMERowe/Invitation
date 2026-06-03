# Invitation — Wedding Invitation

A comprehensive suite of HTML-based tools for creating, editing, and sharing a beautiful wedding invitation website. Features bilingual support (English & Indonesian), an interactive guest dashboard, and automated invitation link generation.

## Overview

This project provides a complete digital solution for wedding invitations, combining an elegant presentation layer with powerful editing and management tools. All tools run client-side in the browser with no server requirements.

## Files

### Core Application
- **`index.html`** — Main invitation website. Displays the wedding invitation with interactive sections including couple information, venue details, dress code, RSVP form, and countdown timer. Supports both English and Indonesian.

### Management Tools
- **`dashboard.html`** — Comprehensive content editor with a professional interface. Allows editing of all invitation sections (names, date, venue, rundown, dress code, RSVP) with side-by-side English/Indonesian comparison. Changes can be saved to browser storage or exported using the File System Access API.

- **`invitelinkmaker.html`** — Automated invitation link generator. Import guest lists via manual entry, CSV, or Excel files. Generates personalized invitation links for different guest categories (family, friends, general, work). Features batch operations and XLSX export.

### Supporting Files
- **`indexbackup.html`** — Backup copy of the main invitation website.
- **`assets/`** — Static resources directory including images and music files.
- **`Notes`** — Project notes and development documentation.

## Features

### Invitation Website
- Elegant, responsive design with smooth animations
- Bilingual support (English & Indonesian) with language toggle
- Mobile-optimized interface
- Multiple content sections:
  - Couple profiles with photos
  - Wedding date and countdown timer
  - Venue information with interactive maps
  - Dress code guidelines with color palette
  - RSVP form with field validation
- Open Graph metadata for social media previews (WhatsApp, Facebook, etc.)
- Background music support

### Dashboard Editor
- Intuitive UI for editing all invitation content
- Dual-language editing with side-by-side comparison
- Auto-save to browser storage (IndexedDB/LocalStorage)
- Export/import functionality
- Real-time preview updates

### Invitation Link Generator
- Multiple import formats (manual, CSV, Excel)
- Guest categorization (family, friends, general, work)
- Batch link generation with personalized URLs
- Built-in XLSX export for tracking
- Copy to clipboard functionality

## Quick Start

### View the Invitation
1. Open `index.html` in your web browser
2. Use the language toggle to switch between English and Indonesian
3. Navigate through sections using the menu or scroll
4. Fill out and submit the RSVP form

### Edit Content
1. Open `dashboard.html` in your web browser
2. Click **Open index.html** button to load the site data
3. Select a section from the sidebar navigation
4. Edit content in either language column
5. Click **Save This Page** to persist changes

### Generate Invitation Links
1. Open `invitelinkmaker.html` in your web browser
2. Choose input mode:
   - **Manual**: Type guest names and select category
   - **Import**: Upload CSV or Excel file with guest names
3. Click **Generate Links** to create personalized URLs
4. Copy individual links or download batch export as XLSX

## Browser Compatibility

- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+

File System Access API support (for dashboard auto-save) requires modern browsers. Works without it using browser storage.

## Technical Details

- **Architecture**: Vanilla HTML5/CSS3/JavaScript (no dependencies except xlsx.js for Excel export)
- **Data Storage**: Browser localStorage/IndexedDB
- **Styling**: CSS Grid, Flexbox, CSS Variables, animations
- **Fonts**: Google Fonts (Cinzel, Cormorant Garamond, Great Vibes)

## Structure

```
Invitation/
├── index.html              # Main invitation website
├── dashboard.html          # Content editor
├── invitelinkmaker.html    # Link generator tool
├── indexbackup.html        # Backup of main site
├── README.md               # This file
├── assets/
│   ├── music/              # Background music files
│   └── images              # Logo, photos, covers
└── Notes/                  # Development notes
```

## Deployment

To deploy this project:

1. Publish all `.html` files to your web hosting
2. Include the `assets/` directory with all resources
3. Update the base URL in `index.html` Open Graph metadata if deploying to a subdirectory
4. Ensure HTTPS is enabled for secure RSVP submissions

## Usage Tips

- **Personalized Invitations**: Use the link generator to create category-specific URLs that pre-populate guest type information
- **Social Sharing**: Open Graph tags enable beautiful link previews on WhatsApp, Facebook, and other platforms
- **Mobile First**: The invitation is designed for mobile viewing but works excellently on desktop
- **Bilingual Support**: Edit both languages in the dashboard before sharing to ensure accurate translations

## License

This project is maintained by ITMERowe.
