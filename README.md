# The Garrison — Website

A self-contained website with a built-in editor. No agency required.

- The public page is `index.html`. It reads its content from `content.json`.
- The editor lives at `/admin` (Decap CMS). Staff log in, edit, and click **Publish** — the site updates automatically.
- The contact form is captured for free by Netlify (no backend code).

---

## What you can edit without touching code

Everything on the page: the hero headline + image, opening hours, About text, the menu
cards (add / remove / reorder / upload new PDFs), the Games Room photos (a rotating
slideshow), contact details, the OpenTable booking link, and the social links.

---

## Going live — one-time setup

You do this once. After that, editing is just log in → edit → Publish.
Three free accounts are involved: GitHub (stores the site), Netlify (hosts it),
and DecapBridge (handles the editor login).

### 1. Put the files on GitHub
Create a free GitHub account if you don't have one, make a new repository
(private is fine) called e.g. `garrison-site`, and upload everything in this
folder to it — keep the folder structure exactly as-is.

### 2. Host it on Netlify (free)
1. Sign up at netlify.com and choose **Add new site → Import an existing project**.
2. Pick your GitHub repo.
3. Build command: **leave blank**. Publish directory: **`.`** (just a dot). Deploy.

Your site is now live on a temporary `something.netlify.app` address — the public
site is up at this point. (The editor needs step 3.)

### 3. Turn on the editor login (DecapBridge)
Netlify's old login service (Identity/Git Gateway) has been retired, so the editor
uses DecapBridge instead — free, and your staff can log in with a Google or
Microsoft account, no GitHub needed.

1. Go to decapbridge.com, sign up, and **add a site**.
2. When asked for your admin page URL, enter `https://YOUR-SITE.netlify.app/admin/`
   (or your real domain once step 4 is done).
3. Connect your GitHub repo when prompted.
4. DecapBridge gives you a small config snippet with your `repo` and a `site-id`.
   Open `admin/config.yml` and replace the two placeholder lines:
   - `repo: YOUR-GITHUB-USERNAME/garrison-site`
   - `identity_url: https://auth.decapbridge.com/sites/YOUR-SITE-ID`
   with the exact values DecapBridge shows you. Commit/push that change.
5. In DecapBridge, invite yourself and any staff (by email) as collaborators.

Now go to `your-site/admin`, log in, and you're in.

### 4. Point your domain at it
In Netlify: **Domain management → Add a custom domain → `thegarrison.im`**, then follow
the DNS steps Netlify shows. You can move the domain over from the agency whenever
you're ready — the site keeps working on the Netlify address until you do.
(If you put the domain behind Cloudflare's proxy later, leave the `/admin` and
login paths un-proxied, or logins can get blocked.)

---

## How to edit the site (day to day)

1. Go to **`https://www.thegarrison.im/admin`** (or your-site.netlify.app/admin).
2. Log in (Google/Microsoft/email via DecapBridge).
3. Open **Website → The Garrison — Page Content**.
4. Change whatever you need. To swap a menu, open that menu card and upload the new PDF.
   To change the Games Room slideshow, add/remove photos in the Photos list.
5. Click **Publish**. The live site updates within a minute or two.

---

## Contact form submissions

Messages sent through the contact form appear in Netlify under **Forms**.
To get an email each time, go to **Forms → Settings → Form notifications → Add notification**.

---

## Good to know

- **No monthly agency fee.** Netlify and DecapBridge both have free tiers that
  comfortably cover a site like this.
- **It's all yours.** Everything lives in your GitHub repo and your own accounts.
- **The logo, building illustration, and styling** are baked into the files; the
  colours/fonts are the `:root` variables near the top of `index.html`.
