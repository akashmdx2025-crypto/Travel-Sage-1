# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

The main user-facing artifact is TravelSage AI, a full-stack travel-planning web app that turns uploaded destination guides, PDFs, markdown files, text files, or pasted notes into grounded AI chat, itineraries, packing lists, budgets, safety/culture tips, and AI transparency logs.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui-style components
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM available, but TravelSage currently uses an in-memory document/vector store for hackathon-friendly uploads
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI-compatible calls through Replit AI Integrations using `gpt-4o-mini`
- **Document parsing**: text/markdown parsing and PDF extraction with `pdf-parse`

## Artifacts

- `artifacts/travelsage-ai` — TravelSage AI web app at `/`
- `artifacts/api-server` — shared Express API server at `/api`
- `artifacts/mockup-sandbox` — design canvas preview sandbox at `/__mockup`

## TravelSage API Surface

Defined in `lib/api-spec/openapi.yaml` and generated into the API client packages.

- `POST /api/travelsage/upload` — process uploaded guide or pasted notes, chunk content, create local embeddings, and extract destination analysis
- `POST /api/travelsage/chat` — RAG-style destination expert chat with guardrails and source chunks
- `POST /api/travelsage/generate-itinerary` — constrained JSON day-by-day itinerary generation
- `POST /api/travelsage/generate-packing` — constrained JSON packing list generation
- `POST /api/travelsage/generate-budget` — constrained JSON budget guidance generation
- `POST /api/travelsage/generate-tips` — constrained JSON safety, culture, and practical tips generation
- `GET /api/travelsage/logs` — AI transparency logs with latency, token estimates/usage, guardrail status, and quality scores

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/travelsage-ai run dev` — run TravelSage AI locally through its workflow

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
