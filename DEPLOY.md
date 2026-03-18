# Deploy Zepmed Assistant to Vercel

Deploy so you get a shareable link (e.g. `https://your-project.vercel.app`). Chat and voice both use your ZepMed Agent.

## 1. Push your project to GitHub

If not already:

```bash
cd "c:\Users\Admin\Desktop\Assit Agent"
git init
git add .
git commit -m "Add Vercel deploy"
# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

**Note:** `config.js` and `server/.env` are in `.gitignore` — they stay local. The deployed app gets keys from Vercel Environment Variables.

## 2. Import the project in Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New…** → **Project**.
3. Import your GitHub repo (e.g. `YOUR_USERNAME/YOUR_REPO`).
4. Leave **Root Directory** as `.` and **Framework Preset** as **Other**.
5. Click **Deploy**. The first deploy may succeed without env vars; chat/voice will work after you add them.

## 3. Set Environment Variables in Vercel

In the project dashboard: **Settings** → **Environment Variables**. Add:

| Name | Value | Notes |
|------|--------|------|
| `VAPI_API_KEY` | Your **private** Vapi API key | From [dashboard.vapi.ai](https://dashboard.vapi.ai) → API Keys. Used by `/api/chat`. |
| `VAPI_ASSISTANT_ID` | `f62ff55b-d7b6-4468-9a7d-30e2bf8338e4` | Your ZepMed Agent ID. |
| `VAPI_PUBLIC_KEY` | Your **public** Vapi API key | Same dashboard. Used by the browser for voice via `/api/config`. |

Then **Redeploy** the project (Deployments → ⋮ on latest → Redeploy) so the new variables are applied.

## 4. Share the link

After redeploy, open **Your project** → **Domains**. Your app is live at:

- `https://YOUR_PROJECT.vercel.app`

Share that URL; visitors get chat and voice with your ZepMed Agent.

---

## If you see "Server error" or "VAPI_API_KEY not set"

1. **Add all three env vars** in Vercel: **Settings → Environment Variables**
   - `VAPI_API_KEY` (private key)
   - `VAPI_ASSISTANT_ID`
   - `VAPI_PUBLIC_KEY` (public key)

2. **Redeploy after adding them**: **Deployments** → **⋮** on the latest deployment → **Redeploy**.  
   Env vars are only applied on the next deploy; editing them alone is not enough.

3. **Check spelling**: Names must be exactly `VAPI_API_KEY`, `VAPI_ASSISTANT_ID`, `VAPI_PUBLIC_KEY` (no spaces).

After redeploying, try sending a message again; the chat should work.

---

## Summary

- **Static files** (HTML, CSS, JS) are served by Vercel.
- **Chat** is handled by the serverless function `api/chat.js` (uses `VAPI_API_KEY` + `VAPI_ASSISTANT_ID`).
- **Voice** keys are provided by `api/config.js` (uses `VAPI_PUBLIC_KEY` + `VAPI_ASSISTANT_ID`); the browser never sees your private key.
