# The Credit Mastermind

Marketing site for **thecreditmastermind.com** — credit repair alongside tax,
retirement (401(k)/IRA), stocks and asset management, led by Stephanie Pedroza
(CPA, CFA, CIMA; formerly PwC and Deloitte).

## Site

Four pages of plain static HTML/CSS/JS — **no build step, no dependencies, no
third-party scripts.**

| Page | Path |
| --- | --- |
| Home | `/` |
| About | `/about/` |
| Services | `/services/` |
| Book | `/book/` |

- Light/dark theme, persisted in `localStorage` and defaulting to `prefers-color-scheme`
- Mobile-first: verified at 320–1440 px with no horizontal overflow
- Compact mobile nav CTA ("Sign Up") beside the theme toggle
- Compliance disclosures in every page footer (credit/CROA, tax, investments, credentials)

## Preview locally

```bash
python3 -m http.server 4173 --bind 127.0.0.1 --directory .
# → http://127.0.0.1:4173/
```

## Deploy

Netlify publishes `main` on every push (`publish = "."` in `netlify.toml`).
Security headers — HSTS, frame denial, `nosniff`, referrer and permissions
policy — are configured in `netlify.toml`; HTTPS is provisioned automatically.

## Structure

```
index.html  about/  services/  book/
css/styles.css      js/main.js
assets/             sitemap.xml    robots.txt
```
