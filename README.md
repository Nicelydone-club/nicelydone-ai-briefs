# nicelydone-ai-briefs

A Next.js (App Router, JavaScript, Tailwind) AI brief generator for Nicelydone,
using the `ai` SDK + `zod`, with Vercel Analytics. Streams responses through the
**Vercel AI Gateway** (model `openai/gpt-5.4`).

## Features

- Prompt textarea, submit button, loading state, and a streamed response panel (`/`)
- `POST /api/generate` validates a non-empty prompt with Zod, then `streamText`

## Run

```bash
npm install
cp .env.local.example .env.local   # then set AI_GATEWAY_API_KEY
npm run dev
```

- A **valid** prompt streams a response.
- An **empty** prompt returns a clear validation error (`Prompt is required`).

## Environment variables

| Variable | Notes |
| --- | --- |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key (encrypted on Vercel; never committed) |
| `NEXT_PUBLIC_APP_NAME` | e.g. `Nicelydone` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | e.g. `support@nicelydone.club` |
| `APP_RELEASE_CHANNEL` | e.g. `stable` |

Deployed on Vercel.
