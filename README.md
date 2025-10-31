Al-Nur — Glassy Islamic YouTube Channel Frontend

Overview

This is a minimal static website template for an Islamic YouTube channel (motivational + educational videos) with:

- Glassy UI and professional color palette
- Responsive navbar and video grids
- Dark / Light mode toggle with persistence
- Sign-in page wired for Google Identity Services (GSI)
- Mock sign-in fallback for local development

Files created

- index.html — Landing page with video sections and navbar
- comments.html — Comments/shared Google Doc viewer (paste a Google Docs URL or ID to preview or open)
- styles.css — Glassy styling, layout, responsive rules
- app.clean.js — Theme, UI wiring, mock sign-in helper and small runtime behaviors (set GOOGLE_CLIENT_ID here if re-adding GSI)
- README.md — This file

Quick local preview

1. Open the folder in a simple static server or just open index.html in your browser.
2. For best local testing of Google Sign-In, set up a local server (e.g., using VS Code Live Server extension or Python):

   # Powershell example (from project folder)
   python -m http.server 8000

   Then open http://localhost:8000 in your browser.

Note about mobile testing

If videos behave oddly on mobile (black screen, "An error occurred", or playback failures), make sure you're serving the site over HTTP (for example with the command above) instead of opening files via the file:// URL scheme. Mobile browsers often block or limit cross-origin embeds when pages are opened from the filesystem. Running a local static server resolves most embed and playback issues.

Google sign-in notes

The original sign-in page (`signin.html`) has been replaced by a comments/shared-docs page (`comments.html`). This template keeps a mock sign-in helper for local testing. If you want to re-enable Google Identity Services (GSI):

1. Go to Google Cloud Console: https://console.cloud.google.com/apis/credentials
2. Create an OAuth 2.0 Client ID for Web application (Authorized JavaScript origins should include your domain or http://localhost:8000 while testing).
3. Copy the Client ID string.
4. Open `app.clean.js` and replace the placeholder value for `GOOGLE_CLIENT_ID` with your Client ID, e.g.:

   const GOOGLE_CLIENT_ID = '1234-abcdefg.apps.googleusercontent.com';

5. Re-introduce a sign-in flow or page if you want the full GSI button-based sign-in (the codebase contains `initGSI` and wiring in `app.clean.js` which will initialize GSI when a proper client id and a container with id `gsi-button` are present).

Notes and limitations

- This is a static front-end demo. Full production sign-in flows should verify ID tokens on a backend server for security.
- The Google CLIENT_ID is required to enable actual Google sign-in. This template includes a mock sign-in fallback for local preview; re-add a sign-in container to a page if you want the GSI button to appear.
- Replace the sample YouTube video IDs in `index.html` with your channel videos.

Next steps you may want to add

- Server-side verification of Google ID tokens
- Subscriptions and user preferences stored on a backend
- Search, categories, playlists, and CMS for uploading video metadata
- Accessibility improvements and localization

If you'd like, I can:
- Add search and filter UI for videos
- Wire a small Node/Express backend to validate tokens and persist subscriptions
- Add a lightweight subscription modal and a "save to playlist" demo

Enjoy — tell me which next improvement you'd like and I'll implement it.