# For Suhaila 🎁

A small, cinematic birthday website. Plain HTML, CSS, and JavaScript —
no frameworks, no backend, no build step.

## 1. Add the photos

Drop four images into the `assets/` folder, using these exact filenames
(the site already looks for them):

| File | Used for |
|---|---|
| `assets/suhaila-childhood.jpg` | Scene 3 — childhood photo |
| `assets/suhaila-current.jpg` | Scene 4 — present-day photo |
| `assets/moon.jpg` | Scene 5 — the moon |
| `assets/hamilton-cake.jpg` | Scene 6 — the cake |

Until a file is added, that section shows a soft placeholder box instead
of a broken image, so you can preview the whole site before the photos
are ready.

**Recommended sizes / optimization:**
- Portrait photos (childhood / current): ~1000–1400px on the long edge is
  plenty for a phone screen — no need for full camera-resolution files.
- The moon photo: a square-ish crop works best, ~1000×1000px.
- The cake photo: square-ish, ~1200×1200px.
- Export as `.jpg` at ~75–85% quality. Tools like [Squoosh](https://squoosh.app)
  (free, in-browser) can resize and compress in one step — aim for each
  file under ~300KB so the site stays fast on mobile data.
- Keep the filenames exactly as listed above, or update the `src` paths
  in `index.html` to match whatever you name them.

## 2. Run it locally

No build tools needed. Either:

- Double-click `index.html` to open it directly in a browser, **or**
- For the most accurate preview (some browsers restrict local file
  access), serve the folder locally:

  ```bash
  cd birthday
  python3 -m http.server 8000
  ```

  Then open `http://localhost:8000` in your browser. On your phone, open
  Safari and go to your computer's local IP address instead, e.g.
  `http://192.168.1.23:8000` (find your IP with `ipconfig getifaddr en0`
  on Mac, or `ipconfig` on Windows).

## 3. Deploy to GitHub Pages

1. Create a new GitHub repository and push the whole `birthday/` folder
   to it (as the repo root, or a `docs/` subfolder — either works).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a
   branch," pick your branch (e.g. `main`) and the folder (`/root` or
   `/docs`), then save.
4. GitHub will give you a URL like
   `https://<your-username>.github.io/<repo-name>/` within a minute or
   two.

## 4. Deploy to Cloudflare Pages

1. Push the `birthday/` folder to a GitHub (or GitLab) repository.
2. In the [Cloudflare dashboard](https://dash.cloudflare.com), go to
   **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repository.
4. Build settings: leave the **build command** empty and set the
   **output directory** to the folder containing `index.html` (e.g. `/`
   or `birthday`).
5. Deploy. Cloudflare gives you a `*.pages.dev` URL immediately, and you
   can attach a custom domain afterward if you'd like.

## Notes

- The site is a single scrolling page — tapping "Open your birthday
  surprise" scrolls into the fireworks scene and starts a short,
  particle-capped firework sequence on canvas; everything after that is
  a normal scroll.
- It respects `prefers-reduced-motion`: if that's enabled on the device,
  animations are minimized and all content is shown without motion.
- No audio is included or autoplayed. If you'd like to add background
  music, drop an audio file into `assets/`, uncomment and wire up the
  `#sound-toggle` button in `script.js`, and keep it user-initiated
  (required by iOS Safari anyway — it won't autoplay audio regardless).
