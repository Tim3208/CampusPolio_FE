<!-- BEGIN:nextjs-agent-rules -->
# Next.js Project Notes

This project uses a current Next.js release. When touching framework behavior,
check the relevant guide in `node_modules/next/dist/docs/` before relying on
older Next.js assumptions.
<!-- END:nextjs-agent-rules -->

# Architecture

- Use practical Feature-Sliced Design under `src`.
- Keep `src/app` thin: routes, layouts, metadata, and provider wiring only.
- Compose page-level UI in `src/widgets`.
- Put user actions and business workflows in `src/features`.
- Put domain model code in `src/entities`.
- Put reusable primitives in `src/shared`.

# Imports

- Use the `@/*` alias for application imports.
- shadcn/ui components live in `src/shared/ui`.
- Shared utilities live in `src/shared/lib`.
- Import shadcn components directly, for example `@/shared/ui/button`.
- Expose non-trivial slices through an `index.ts` public API.
- Do not import from sibling slices through private internal paths.
