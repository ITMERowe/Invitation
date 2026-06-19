# Invitation — Wedding Invitation

A comprehensive suite of HTML-based tools for creating, editing, and sharing a beautiful wedding invitation website. Features bilingual support (English & Indonesian), an interactive guest dashboard, and automated invitation link generation.

## Overview

This project provides a complete digital solution for wedding invitations, combining an elegant presentation layer with powerful editing and management tools. All tools run client-side in the browser with no server requirements.

## Files

### Core Application
- **`index.html`** — Main invitation website. Displays the wedding invitation with interactive sections including couple information, venue details, dress code, RSVP form, and countdown timer. Supports both English and Indonesian.

### Management Tools
- **`invite-maker.html`** — Automated invitation link generator. Import guest lists via manual entry, CSV, or Excel files. Generates personalized invitation links for different guest categories (family, friends, general, work). Features batch operations and XLSX export.

### Styling & Scripts
- **`style.css`** — Main stylesheet for the invitation website, including animations, layout, and responsive design.
- **`invite-maker.css`** — Stylesheet for the invitation link maker tool.
- **`script.js`** — Core JavaScript for invitation functionality, including audio engine, page navigation, and guest personalization.
- **`invite-maker.js`** — JavaScript for the invitation link maker, handling CSV/Excel import and link generation.

### Supporting Files
- **`indexbackup.html`** — Backup copy of the main invitation website.
- **`assets/`** — Static resources directory including music files and images.
- **`Notes/`** — Project notes and development documentation.

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

### Invitation Link Maker
- Manual guest name entry or file import (CSV, Excel)
- Guest categorization (family, friends, general, work)
- Batch link generation with personalized invitation URLs
- Built-in XLSX export for guest list tracking
- Single-click copy to clipboard for all links

## Browser Compatibility

- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+

File System Access API support (for dashboard auto-save) requires modern browsers. Works without it using browser storage.

## Technical Details

- **Architecture**: Vanilla HTML5/CSS3/JavaScript (no backend required)
- **Dependencies**: XLSX library for Excel import/export
- **Audio Engine**: Web Audio API with synced multi-track playback and loop scheduling
- **Styling**: CSS Grid, Flexbox, CSS Variables, smooth animations
- **Fonts**: Google Fonts (Cinzel, Cormorant Garamond, Great Vibes)

## Structure

```
Invitation/
├── index.html              # Main invitation website
├── indexbackup.html        # Backup of main site
├── invite-maker.html       # Invitation link generator tool
├── style.css               # Main website stylesheet
├── invite-maker.css        # Link maker stylesheet
├── script.js               # Main website JavaScript
├── invite-maker.js         # Link maker JavaScript
├── README.md               # This file
├── assets/
│   └── music/              # Background music files (.mp3)
└── Notes/                  # Development notes
```

## Deployment

To deploy this project:

1. Publish all `.html` files to your web hosting
2. Include the `assets/` directory with all resources
3. Update the base URL in `index.html` Open Graph metadata if deploying to a subdirectory
4. Ensure HTTPS is enabled for secure RSVP submissions

## Usage Tips

- **Personalized Links**: Use the invite-maker tool to generate category-specific URLs (family, friends, work, general) that automatically customize the invitation experience
- **Batch Import**: Save time by importing guest lists from Excel or CSV files instead of entering names manually
- **Social Sharing**: Open Graph tags enable beautiful link previews on WhatsApp, Facebook, and other platforms
- **Mobile First**: The invitation website is optimized for mobile devices but displays beautifully on desktop as well
- **Audio Background**: Background music automatically plays on page load to enhance the invitation experience

## License

This project is maintained by ITMERowe.
