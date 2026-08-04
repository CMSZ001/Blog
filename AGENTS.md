# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

CMSZ's personal blog (https://acmsz.top), an AstroPaper 6.x theme heavily customized. Built with Astro 7, TypeScript, Tailwind v4, MDX. Default language is `zh-CN`. Package manager is pnpm.

## Commands

All commands run from the repo root with pnpm.

```bash
pnpm dev            # start dev server on localhost:4321
pnpm build          # astro check + astro build, then Pagefind index + copy to public/pagefind
pnpm preview        # preview the production build locally
pnpm sync           # regenerate Astro content-collection types after editing src/content.config.ts
pnpm lint           # ESLint
pnpm format         # Prettier write
pnpm format:check   # Prettier check (runs in CI)
```

For a long-lived dev server in the background:

```bash
pnpm astro dev --background
pnpm astro dev status   # is it running?
pnpm astro dev logs     # tail logs
pnpm astro dev stop     # shut it down
```

There is no test suite. `pnpm build` runs `astro check` (type-checking) so type errors fail the build. Note `pnpm build` also deletes `dist/_astro/fonts/*.otf` (the local MiSans fonts) and regenerates `public/pagefind` (gitignored).

## Architecture

### Configuration chain

Edit **`astro-paper.config.ts`** — it is the single user-facing config. It flows into `src/config.ts`, which applies defaults and exposes a fully-resolved `ResolvedAstroPaperConfig` (types in `src/types/config.ts`). Do not edit `src/config.ts` for normal configuration. It covers: site (URL, title, timezone `Asia/Shanghai`), posts pagination, feature toggles (dark mode, dynamic OG, archives, edit link, search), socials, share links, license, and Artalk comments.

### Content collections

Defined in `src/content.config.ts` with glob loaders:
- **`posts`** — files under `src/content/posts/**/*.{md,mdx}` (files starting with `_` are excluded). Post frontmatter schema: `author` (defaults to site author), `pubDatetime` (required, sorts and schedules posts), `title`, `tags` (default `["others"]`), `draft`, `featured`, `ogImage`, `description`, `hideEditPost`, `timezone`. `draft: true` hides a post from all pages.
- **`pages`** — markdown under `src/content/pages/` (e.g. the About page).

Subdirectories under `src/content/posts/` become URL path segments (handled by `src/utils/getPostPaths.ts`, which slugifies each segment). Post URL helpers are `getPostSlug` and `getPostUrl`.

### i18n

Locales `en` and `zh-CN`, default `zh-CN`, `prefixDefaultLocale: false` (the default locale serves at the root path). UI strings live in `src/i18n/lang/{en,zh-CN}.ts`; access via `useTranslations(locale)` and `tplStr` from `@/i18n`. Post dates are rendered with `dayjs` in the configured site timezone.

### Markdown pipeline

Configured in `astro.config.ts` under `markdown.processor`. Important plugins:
- `remark-toc` + `remark-collapse` — auto-generates a collapsible table of contents from a `## 目录` heading.
- `rehype-callouts` — Obsidian-style callouts (`> [!NOTE]` etc.); theme imported via `@import "rehype-callouts/theme/obsidian"` in `src/styles/global.css`.
- `src/plugins/remark-reading-time.mjs` — adds `frontmatter.minutesRead`.
- `src/plugins/remark-modified-time.mjs` — runs `git log` per post to add `frontmatter.lastModified`. Requires the file to be committed in git.

### Pages, search & comments

- Routes are static pages under `src/pages/` (index, about, archives, tags, search, 404) plus dynamic routes for posts (`/posts/[...slug]`), tags, and pagination.
- `rss.xml.ts` and `robots.txt.ts` are generated endpoints; `og.png.ts` and `/posts/[...slug]/index.png.ts` generate dynamic OG images with Satori.
- Search is **Pagefind** (index regenerated on every build and copied into `public/pagefind`).
- Comments are **Artalk**, self-hosted at `https://artalk.acmsz.top` (config in `astro-paper.config.ts`, component in `src/components/comments/`).
- Styling is Tailwind v4 via the `@tailwindcss/vite` plugin; global styles in `src/styles/`. Fonts (Inter, local MiSans, Cascadia Code) are loaded through Astro's font provider.

### Obsidian workflow

The repo root is an Obsidian vault (`.obsidian/` is checked in). Obsidian is configured to save new markdown notes into `src/content/posts/` and image attachments into `src/assets/images/`. When adding a post, ensure the frontmatter matches the posts schema — a missing required field (e.g. `pubDatetime`) breaks `astro check` and therefore the build. Posts must be committed for `remarkModifiedTime` to work.

## Deployment & CI

- **CI** (`.github/workflows/ci.yml`): on PRs, runs `lint` + `format:check` + `build`. Use `pnpm format` before pushing.
- **Deploy** (`.github/workflows/deploy.yml`): on push to `main`, builds and deploys to **Cloudflare Workers** via `cloudflare/wrangler-action` (secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`). There is no `wrangler.toml` — deployment config is implicit.

CI uses pnpm 11.3.0 and Node 24; local `engines` requires Node >= 22.12.