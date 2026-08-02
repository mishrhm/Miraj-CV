# Miraj CV — Phase 0 Scaffold

Monorepo: `web` (Next.js + Prisma) and `docx-service` (FastAPI + python-docx),
wired together with Docker Compose and a shared Postgres.

## Structure

```
job-agent/
  docker-compose.yml
  web/                  # Next.js + TypeScript + Prisma
    prisma/schema.prisma
    src/app/            # pages
    src/lib/prisma.ts
  docx-service/          # FastAPI microservice
    app/main.py          # /render-resume endpoint
    app/resume_template.py  # deterministic docx builder (python-docx)
```

## Running locally

1. Copy `web/.env.example` to `web/.env` and fill in `ANTHROPIC_API_KEY`.
2. From the repo root:
   ```
   docker compose up --build
   ```
3. Web app: http://localhost:3000
   Docx service health check: http://localhost:8001/health
4. Run the first migration (creates `User`/`Profile` tables):
   ```
   docker compose exec web npx prisma migrate dev --name init
   ```

## What's implemented so far (Phase 0)

- Prisma schema: `User`, `Profile`, `Experience`, `Education`, `Skill`, `Project`
- Docx microservice with a **standard, ATS-friendly professional template**
  (`/render-resume` — POST structured resume JSON, get a `.docx` back)
- Home page smoke-tests the Prisma/Postgres connection

A sample rendered resume (`sample_resume.docx`, using placeholder data in
your general shape) is included so you can see the actual template output
before wiring up the UI.

## Not yet implemented (see roadmap)

- Auth (Clerk/Auth.js)
- Profile builder UI (Phase 1)
- Job posting parser + gap analysis (Phase 2–3)
- Resume tailoring agent call (Phase 4)
- Wiring the web app to actually call `docx-service` (Phase 5)

## Guardrail note (per your decision)

The tailoring stage (Phase 4, not yet built) must be constrained to only
reorder, reweight, and rephrase content that already exists in the user's
`Profile` — never invent new experience. This should be enforced both in
the prompt design and with an explicit eval test in Phase 6 that checks
tailored output doesn't introduce claims absent from the source profile.
