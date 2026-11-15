<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

Next.js 16 App Router app, single npm package. No monorepo, no CI, no tests, no env files. All source is under `src/` (`@/*` → `src/*`); there is no root `app/` dir. `README.md` is unmodified create-next-app boilerplate — its paths (e.g. `app/page.tsx`) are wrong.

## Verify changes in this order

1. `npm run lint` — eslint flat config (`eslint-config-next`, core-web-vitals + TS)
2. `npx tsc --noEmit` — there is no `typecheck` script
3. `npm run build` — Turbopack; use `npm run dev` for a local server

**Baseline:** the tree may contain uncommitted WIP that already fails all three (as written: `Navbar.tsx`/`Banner.tsx` are empty, `page.tsx` imports missing `@/components/embla.css`, and `ui/carousel.tsx` + `hooks/use-mobile.ts` trigger `react-hooks/set-state-in-effect`). Check `git status` and compare before/after instead of chasing pre-existing failures.

## Next.js config — all non-default

`next.config.ts` enables `cacheComponents`, `partialPrefetching`, and `reactCompiler`:

- **Cache Components** changes data-fetching/caching semantics. Read `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md` before adding fetches or RSC data loading.
- **React Compiler** requires components to be pure render functions; the lint rules enforce it (source of the `set-state-in-effect` errors above).
- The bundled docs at `node_modules/next/dist/docs/` match the installed Next version and override older Next.js knowledge (see block above).

## Styling and UI — Tailwind 4 + shadcn/ui

- Tailwind 4 is CSS-first: there is no `tailwind.config`. Tokens and theme live in `src/app/globals.css` (`@theme inline`).
- shadcn/ui uses style **base-nova**: primitives are **`@base-ui/react` (Base UI), not Radix** — don't reach for `@radix-ui/*`.
- `cn` is imported from the `"cn"` package everywhere (`import { cn } from "cn"`). `src/lib/utils.ts` only re-exports it for the shadcn alias.
- Add components with `npx shadcn add <component>` (`components.json` defines aliases). Generated code goes in `src/components/ui/`, feature components in `src/components/`.

## Other gotchas

- `src/lib/highlighter.tsx` is a shiki core highlighter with an explicit language allowlist: add new languages to its `languages` map (plus `aliases`), otherwise highlighting silently returns null.
