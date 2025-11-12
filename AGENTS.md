# Repository Guidelines

## Project Structure & Module Organization
- App code lives in `src/app` (Next.js App Router). UI building blocks in `src/components`, hooks in `src/hooks`, shared utilities in `src/lib`, and TypeScript types in `src/types`.
- Static assets in `public/`.
- Database schema in `prisma/schema.prisma` (MongoDB via Prisma). Admin seeding script in `scripts/seed-admin.ts`.
- Use the path alias `@/*` (see `tsconfig.json`).

## Build, Test, and Development Commands
- `npm run dev` — start local dev server (Turbopack).
- `npm run build` — production build.
- `npm run start` — serve the built app.
- `npm run lint` — run Biome linting; `npm run lint:fix` to auto-fix; `npm run format` to format.
- `npm run tsc` — TypeScript type check.
- `npm run seed:admin -- --email=user@example.com --name=Admin` — add/update an allowlisted admin and optionally sync `User.isAdmin`.

## Coding Style & Naming Conventions
- TypeScript, strict mode enabled; prefer typed props and explicit return types for shared utilities.
- Biome enforces 2-space indentation and ~100-char line width (see `biome.json`). Fix lint issues before pushing.
- Components: PascalCase file and export names (e.g., `src/components/Button.tsx`). Hooks: `useX` in `src/hooks`. Keep reusable logic in `src/lib`. Types in `src/types`.

## Testing Guidelines
- No test runner is configured yet. When adding tests, colocate as `*.test.tsx`/`*.test.ts` near source, cover key behaviors and error paths, and keep tests deterministic.
- Until tests exist, rely on `npm run tsc` and `npm run lint` to catch issues.

## Commit & Pull Request Guidelines
- Follow Conventional Commits seen in history (e.g., `feat:`, `fix:`, `refactor:`). Write clear, present-tense messages.
- PRs should include: concise description, linked issues, screenshots for UI changes, and notes on schema/auth impacts.
- Ensure `npm run lint` and `npm run tsc` pass. Document any env or data changes (e.g., needing `DATABASE_URL` or re-seeding admins).

## Security & Configuration Tips
- Store secrets in `.env.local` (not committed). Required: `DATABASE_URL` (MongoDB), NextAuth provider configs, and any email provider keys (Resend).
- Do not log sensitive values; avoid committing generated data.
