# CampusPolio

Next.js App Router project initialized with TypeScript, Tailwind CSS,
shadcn/ui, ESLint, and a practical FSD layout.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

Open `http://localhost:3000` after starting the dev server.

## Structure

- `src/app`: routes, layouts, metadata, provider wiring
- `src/widgets`: page composition
- `src/features`: user actions and business workflows
- `src/entities`: domain model code
- `src/shared/ui`: shadcn/ui components
- `src/shared/lib`: reusable utilities
- `src/shared/api`, `src/shared/config`, `src/shared/hooks`: shared app support

Use `@/*` for internal imports and keep slice exports behind `index.ts` files
when the slice grows beyond a single private implementation.
