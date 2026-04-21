# TravelSage AI

A university Generative AI hackathon project: a destination research cockpit that grounds every AI answer in **your** uploaded travel material — so it never hallucinates.

Upload a guide (PDF / TXT / MD) or paste your own notes, and TravelSage AI will:
- Answer questions using only your sources
- Generate day-by-day itineraries
- Build packing lists
- Estimate budgets
- Summarize culture and safety tips
- Show a transparent AI log of every call

## Screenshots

### Landing page
![Landing](screenshots/01-landing.jpg)

### Workspace — upload your guide
![Workspace](screenshots/02-workspace-upload.jpg)

## Tech Stack
- **Frontend:** React + Vite (TypeScript)
- **Backend:** Node.js + Fastify (TypeScript)
- **AI:** OpenAI `gpt-4o-mini` via Replit AI Integrations (no user API key required)
- **Retrieval:** In-memory document + vector store with deterministic local embeddings
- **Contracts:** OpenAPI → generated React Query client + Zod validators
- **PDF parsing:** `pdf-parse`

## Project Layout
- `artifacts/travelsage-ai/` — React web app
- `artifacts/api-server/` — Fastify API (upload, chat, itinerary, packing, budget, tips, logs)
- `lib/api-spec/openapi.yaml` — API contract
- `lib/api-client-react/` — generated typed client
- `GRANDMA.md` — plain-language explainer

## Guardrails
- Refuses to answer if the question isn't covered by the uploaded material
- Blocks prompt-injection patterns
- Normalizes AI output to keep the UI stable even if the model returns unexpected shapes

## Running Locally
Each artifact has its own dev workflow; they run automatically in Replit. The API binds to `PORT` and the web app is proxied at `/`.

## Alignment with Course Preparation Guide

The hackathon preparation guide emphasized five principles. TravelSage AI maps to each of them directly:

| Guideline | How TravelSage AI Delivers |
| --- | --- |
| **Keep scope tight and focused** | One cohesive flow: upload → ground → chat → structured outputs (itinerary, packing, budget, tips). |
| **Make AI genuinely useful, not decorative** | Every AI call produces a concrete artifact the traveler can act on, sourced from their own material. |
| **Combine all six course concepts** | Constrained prompting, retrieval-augmented generation, guardrails against hallucination and injection, evaluation/transparency logging, multimodal input (PDF / TXT / MD / pasted notes), and cloud deployment. |
| **Ship a testable, deployed artifact** | Deployed on Replit with a public URL and an in-app AI log so reviewers can audit behavior end-to-end. |
| **Communicate clearly to any audience** | `GRANDMA.md` explains the project in plain language, proving the team understands its own system beyond the code. |

**In one sentence:** TravelSage AI honors the preparation guide by delivering a single focused flow — upload → RAG chat → structured trip artifacts — that demonstrates constrained prompting, retrieval, guardrails, eval logging, multimodal input, and deployment, with a `GRANDMA.md` that shows we truly understand what we built.

## Repository Access

This repository is intended to be **public** so instructors and reviewers can access it without friction. If you cloned this into a private repo, switch it to public via **GitHub → Settings → General → Danger Zone → Change repository visibility → Make public**.
