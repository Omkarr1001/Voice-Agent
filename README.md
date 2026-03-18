# Zepmed Assistant

Professional chat and voice assistant for **Zepmed** (zepmed.org) — India's hyperlocal medicine network. Handles customer enquiries, delivery and order info, and pharmacy partner signup.

## Features

- **Text chat** — Built-in FAQ, or **same Vapi agent as voice** when you run the included chat proxy
- **Voice** — Vapi.ai for calls (e.g. your published **ZepMed Agent**)
- **One agent for call + chat** — Use your Vapi assistant for both; the `server/` proxy keeps your private key safe
- **Zepmed branding** — Teal/healthcare theme, responsive layout, accessible UI
- **No hardcoded secrets** — Config via `config.js` (from template); safe for deployment

## Quick start

1. **Serve the folder** (any static server):
   ```bash
   npx serve .
   # or: python -m http.server 8080
   ```
2. Open `http://localhost:3000` (or 8080). Chat works immediately with built-in FAQ.
3. **Voice (optional):** Copy `config.example.js` to `config.js`, add your [Vapi](https://vapi.ai) **public** key (dashboard → API Keys), keep `assistantId` as `f62ff55b-d7b6-4468-9a7d-30e2bf8338e4` (ZepMed Agent), then add `<script src="config.js"></script>` after the default config in `index.html`.
4. **Same agent for chat (optional):** Run the chat proxy so typed messages use your ZepMed Agent too:
   ```bash
   cd server
   # Windows:
   set VAPI_API_KEY=your_private_key
   set VAPI_ASSISTANT_ID=f62ff55b-d7b6-4468-9a7d-30e2bf8338e4
   node server.js
   # Linux/Mac: export VAPI_API_KEY=... export VAPI_ASSISTANT_ID=...
   ```
   In `config.js` set `backendUrl: "http://localhost:3780/chat"`. Use your **private** API key only in the server (never in the browser).

## Project structure

```
├── index.html          # Main entry (use this for zepmed.org)
├── config.example.js   # Config template — copy to config.js (ZepMed Agent ID pre-filled)
├── css/
│   └── styles.css      # Zepmed-themed styles
├── js/
│   ├── app.js          # Chat UI, voice, send logic (sends assistantId to backend when set)
│   └── assistant.js    # FAQ fallback when no backend
├── server/
│   ├── server.js       # Chat proxy: forwards POST /chat to Vapi (keeps private key server-side)
│   └── package.json
├── README.md
└── Zepmed.html         # Legacy single-file version (deprecated)
```

## Configuration

Create `config.js` from `config.example.js`:

| Option | Description |
|--------|-------------|
| `vapi.publicKey` | Vapi **public** key (voice in browser) |
| `vapi.assistantId` | Your Vapi assistant (e.g. ZepMed Agent `f62ff55b-d7b6-4468-9a7d-30e2bf8338e4`); used for voice and sent to backend for chat |
| `backendUrl` | Optional: URL of the `server/` chat proxy so **chat** uses the same Vapi agent (e.g. `http://localhost:3780/chat`) |
| `company` | Name, tagline, website for branding |

Without `config.js`, the app still runs with inline defaults (chat only, no voice).

## Deployment (e.g. zepmed.org)

- **Static hosting:** Upload the repo (except `config.js` if it has secrets). On your server, create `config.js` from `config.example.js` with production keys.
- **Embed:** You can embed the assistant in an iframe pointing to your deployed `index.html`, or copy the chat widget into your site and load `css/styles.css`, `js/assistant.js`, and `js/app.js` with the same config pattern.

## Security

- **Never commit** real Vapi keys or API keys. Keep `config.js` in `.gitignore` when it contains secrets.
- If you previously used keys in `Zepmed.html`, rotate them in the Vapi dashboard; those keys were exposed.

## For sales / handover to Zepmed

- **Demo:** Run locally with `config.js` (with your Vapi keys) to show voice + chat.
- **Handover:** Provide this repo, `config.example.js`, and this README. They add their own `config.js` and optional backend.
- **Customization:** They can edit `js/assistant.js` (FAQ and intents), `config.company`, and `css/styles.css` for branding.

---

© Zepmed — India's Hyperlocal Medicine Network | [zepmed.org](https://zepmed.org)
