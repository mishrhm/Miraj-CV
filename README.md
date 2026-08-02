# 📄 Miraj CV

> **Miraj CV** is an AI-powered resume tailoring system designed to help users target specific job postings with precision while maintaining 100% truthfulness to their base career history.

---

## 🏗️ System Architecture

Miraj CV is structured as a light monorepo separating front-end/data management from document rendering:

- **`web`**: Next.js 14 (App Router) + TypeScript + Prisma ORM + Tailwind CSS.
- **`docx-service`**: FastAPI + `python-docx` microservice for deterministic, ATS-friendly document generation.
- **`postgres`**: Relational database serving as the source of truth for base profiles and generated resume variants.

```
job-agent/
├── docker-compose.yml
├── web/                     # Next.js Application & Data Layer
│   ├── prisma/
│   │   └── schema.prisma    # Relational models (User, Profile, Experience, etc.)
│   ├── src/
│   │   ├── app/             # Application routes & API endpoints
│   │   └── lib/
│   │       └── prisma.ts    # Global Prisma client singleton
│   └── package.json
└── docx-service/            # FastAPI Microservice for ATS-Friendly Rendering
    ├── Dockerfile
    ├── requirements.txt
    └── app/
        ├── main.py          # FastAPI server (/render-resume endpoint)
        └── resume_template.py # Deterministic docx builder (python-docx)
```

---

## ⚡ Quickstart & Local Setup

### 1. Prerequisites

Ensure you have **Docker** and **Docker Compose** installed on your system.

### 2. Environment Variables

Copy the example environment file inside the `web/` directory and configure your keys:

```bash
cp web/.env.example web/.env
```

Ensure your `web/.env` contains your active Anthropic API key:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/miraj_cv?schema=public"
ANTHROPIC_API_KEY="your-anthropic-api-key-here"
```

### 3. Spin Up Services

From the repository root, start the stack using Docker Compose:

```bash
docker compose up --build
```

Once running, you can access:

- **Web Portal**: [http://localhost:3000](http://localhost:3000) _(Smoke tests Prisma/Postgres connection)_
- **Docx Service Health**: [http://localhost:8001/health](http://localhost:8001/health)
- **Docx Service OpenAPI Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)

### 4. Database Migrations

With the containers running, initialize the database schema by executing the first migration:

```bash
docker compose exec web npx prisma migrate dev --name init
```

---

## 🎨 Document Generation Microservice

The `docx-service` exposes an endpoint that converts structured JSON payload into an ATS-optimized `.docx` document built using standard typographic hierarchy and clean tabular layout.

### Endpoint Spec

- **URL**: `POST http://localhost:8001/render-resume`
- **Content-Type**: `application/json`
- **Response**: Binary `.docx` stream

A pre-rendered sample file (`sample_resume.docx`) is available in the repository root for inspecting document layout and formatting prior to full UI integration.

---

## 🛡️ Anti-Hallucination Guardrails

To preserve candidate integrity and eliminate AI-generated "hallucinated" qualifications, the resume tailoring pipeline (Phase 4) enforces strict constraints:

> **Core Rule**: The LLM engine is strictly constrained to **reordering**, **reweighting**, and **rephrasing** facts that explicitly exist inside the user's base `Profile`. It **must never** invent new roles, technologies, metrics, or responsibilities.

### Enforcement Strategy

1. **Prompt Constraints**: System instructions strictly disallow introduction of unseen entities or metrics.
2. **Phase 6 Automated Evals**: An automated evaluation suite runs entity and assertion extraction between the output tailored resume and the base `Profile` to fail any run that introduces net-new factual claims.

---

## 🗺️ Project Roadmap

- [x] **Phase 0: Scaffold & Infrastructure**
  - [x] Docker Compose orchestrating Next.js, FastAPI, and Postgres
  - [x] Prisma database models (`User`, `Profile`, `Experience`, `Education`, `Skill`, `Project`)
  - [x] Deterministic `.docx` renderer service
- [ ] **Phase 1: Profile Builder & Management**
  - [ ] User Authentication (Clerk / Auth.js)
  - [ ] Interactive form UI to manage base career history and skills database
- [ ] **Phase 2–3: Job Analysis Engine**
  - [ ] Job posting text/URL parser
  - [ ] Gap analysis & match score calculator against user profile
- [ ] **Phase 4: Tailoring Agent Integration**
  - [ ] Claude agent implementation with guardrail constraints
  - [ ] Diff preview component (Base vs. Tailored)
- [ ] **Phase 5: Full Pipeline Integration**
  - [ ] End-to-end flow: Target Job → Tailor Profile → Render `.docx`
- [ ] **Phase 6: Evals & Reliability**
  - [ ] Automated hallucination test suite and match quality metrics

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

## Guardrail note

The tailoring stage (Phase 4, not yet built) must be constrained to only
reorder, reweight, and rephrase content that already exists in the user's
`Profile` — never invent new experience. This should be enforced both in
the prompt design and with an explicit eval test in Phase 6 that checks
tailored output doesn't introduce claims absent from the source profile.
