# Deploying WanderCraft to GitHub Pages + Cloudflare

WanderCraft builds as a static single-page bundle (`./dist`) with relative asset paths (`base: './'`), so it hosts cleanly on any GitHub Pages URL (`https://<user>.github.io/<repo>/` or custom domain).

---

## 1. Deploy the Cloudflare Backend (Gemini Crafting + KV Saves)

Inside `cloudflare/`:

1. Install Wrangler (or use `npx wrangler`):
   ```bash
   cd cloudflare
   npx wrangler login
   ```
2. Create the KV namespace for cloud saves:
   ```bash
   npx wrangler kv namespace create WANDERCRAFT_SAVES
   ```
   Copy the generated `id` into `cloudflare/wrangler.toml` and uncomment the `[[kv_namespaces]]` block.
3. Add your Gemini API key as a Cloudflare Worker secret:
   ```bash
   npx wrangler secret put GEMINI_API_KEY
   ```
4. Deploy the Worker:
   ```bash
   npx wrangler deploy
   ```
   Note your Worker URL, e.g. `https://wandercraft-backend.<your-subdomain>.workers.dev`.

---

## 2. Enable GitHub Pages & Connect Your Worker

1. Push this repository to GitHub (default branch `main`).
2. In your GitHub repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Open **Settings → Secrets and variables → Actions → Variables** and add two repository variables:
   - `VITE_API_BASE_URL` = `https://wandercraft-backend.<your-subdomain>.workers.dev`
   - `VITE_SAVE_ENDPOINT` = `https://wandercraft-backend.<your-subdomain>.workers.dev/saves`
4. Push a commit to `main` (or run **Actions → Deploy WanderCraft to GitHub Pages → Run workflow**).

Once live, players can also inspect or override their Worker endpoints and Player Sync ID at any time under **Saves & Cloud** in the top bar.
