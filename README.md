# NTI Frontend

> **Nitriansky technologický inkubátor**

The frontend application for the Nitra Technology Incubator (NTI) platform — a full-featured process portal combining a public-facing presentation website with a role-based internal management system for programs, applications, teams, mentoring, and administration.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Route Architecture](#route-architecture)
- [Internationalization](#internationalization)
- [State Management](#state-management)
- [SEO & Sitemap](#seo--sitemap)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Docker](#docker)
- [Code Quality](#code-quality)
- [Related Repositories](#related-repositories)

---

## About the Project

NTI is a technology incubator based in Nitra, Slovakia, operating two flagship programs:

- **Program A** — A grant-based incubation program for students and teams with their own innovative idea, aimed at building a startup or product.
- **Program B** — A live practice program connecting real company projects with student teams, producing contracted software with the involvement of a Product Owner.

This frontend serves all user roles on the platform:

| Role | Description |
|---|---|
| **Visitor** | Public website, program info, news, contacts |
| **Student** | Profile management, team creation, application submission |
| **Team Leader** | Team management, inviting members, submitting team applications |
| **Company / Partner** | Company profile, project specifications, backlog management |
| **Mentor** | Project progress tracking, consultation logs, milestone approval |
| **Commission / Evaluator** | Application scoring and decision-making |
| **Content Manager** | CMS — pages, news, partners, FAQ, banners |
| **NTI Administrator** | Program management, user management, reporting |
| **Super Administrator** | System settings, roles, audit logs, integrations |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) (Vue 3 + TypeScript) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) (Vite plugin) |
| State Management | [Pinia](https://pinia.vuejs.org) via `@pinia/nuxt` |
| Internationalization | [`@nuxtjs/i18n`](https://i18n.nuxtjs.org) (SK/EN) |
| Icons | [`lucide-vue-next`](https://lucide.dev) |
| Sitemap | [`@nuxtjs/sitemap`](https://nuxtseo.com/sitemap) |
| Linting | ESLint + Prettier |
| Containerization | Docker (Node 20 Alpine) |

---

## Project Structure

```
nti-frontend/
├── app/
│   ├── assets/          # Global CSS (main.css — Tailwind entry)
│   ├── components/      # Shared Vue components (e.g. TeamInviteModal.vue)
│   ├── pages/           # File-based routing
│   │   ├── index.vue              # Homepage
│   │   ├── o-nas.vue              # About NTI
│   │   ├── program-a.vue          # Program A landing
│   │   ├── program-b.vue          # Program B landing
│   │   ├── partneri-mentori.vue   # Partners & mentors
│   │   ├── novinky.vue            # News
│   │   ├── vyzvy.vue              # Active calls/challenges
│   │   ├── kontakt.vue            # Contact
│   │   ├── auth/                  # Authentication (login, register, reset)
│   │   ├── student/               # Student portal
│   │   ├── timy/                  # Team management
│   │   │   ├── index.vue          # My teams list
│   │   │   ├── [id].vue           # Team detail
│   │   │   └── vytvorit.vue       # Create team
│   │   ├── prihlasky/             # Application management
│   │   ├── hodnotenie/            # Evaluation (commission)
│   │   ├── mentor/                # Mentor portal
│   │   ├── firma/                 # Company portal
│   │   ├── admin/                 # Admin dashboard
│   │   └── notifikacie/           # Notifications
│   └── stores/          # Pinia stores
│       └── useTeamsStore.ts
├── i18n/
│   └── locales/
│       ├── sk.json      # Slovak translations (default)
│       └── en.json      # English translations
├── public/              # Static assets
├── nuxt.config.ts       # Nuxt configuration
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## Route Architecture

The application uses a **hybrid rendering strategy** to optimally balance SEO and interactivity:

**Server-Side Rendered (SSR)** — public-facing pages for SEO and fast initial load:
`/`, `/kontakt`, `/o-nas`, `/partneri-mentori`, `/program-a`, `/program-b`, `/novinky`, `/vyzvy`

**Client-Side Rendered (CSR)** — authenticated portal routes where SEO is not required:
`/auth/**`, `/student/**`, `/prihlasky/**`, `/timy/**`, `/hodnotenie/**`, `/mentor/**`, `/firma/**`, `/admin/**`, `/notifikacie/**`

---

## Internationalization

The app supports **Slovak (default)** and **English** using `@nuxtjs/i18n` with the `prefix_except_default` strategy:

- Slovak routes: `/program-a`, `/o-nas`, etc. (no prefix)
- English routes: `/en/program-a`, `/en/about`, etc.

Language detection uses a cookie (`i18n_redirected`) and falls back to English. Translation files live in `i18n/locales/sk.json` and `i18n/locales/en.json`.

---

## State Management

Pinia stores manage all domain data.

Each store communicates with the backend via a shared `useApi` composable that automatically attaches the auth token to every request.

---

## SEO & Sitemap

Public routes are automatically included in the generated sitemap. Authenticated and internal routes are explicitly excluded:

```
Indexed:     /, /kontakt, /o-nas, /partneri-mentori,
             /program-a, /program-b, /novinky, /vyzvy

Not indexed: /auth/**, /student/**, /timy/**, /prihlasky/**,
             /hodnotenie/**, /mentor/**, /firma/**,
             /admin/**, /notifikacie/**
```

---

## Getting Started

**Prerequisites:** Node.js 20+, npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
# → http://localhost:3000
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

---

## Environment Variables

The API base URL is configured via Nuxt's runtime config. Create a `.env` file in the project root:

```env
# Used server-side (Docker internal network)
NUXT_API_BASE=http://backend:8000/api

# Used client-side (browser)
NUXT_PUBLIC_API_BASE=http://localhost/backend
```

When running locally without Docker, set `NUXT_PUBLIC_API_BASE` to point to your running Laravel backend instance.

---

## Docker

The project includes a `Dockerfile` for containerized development:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

Build and run:

```bash
docker build -t nti-frontend .
docker run -p 3000:3000 nti-frontend
```

In a full Docker Compose setup (alongside the Laravel backend), the `NUXT_API_BASE` should point to the backend service name (e.g. `http://backend:8000/api`) for server-side requests, while `NUXT_PUBLIC_API_BASE` points to the publicly accessible backend URL for client-side requests.

---

## Code Quality

```bash
# Lint
npm run lint

# Lint and auto-fix
npm run lint:fix

# Format with Prettier
npm run format
```

ESLint is configured via `eslint.config.mjs` using `@nuxt/eslint`. Prettier rules are defined in `.prettierrc`. The `format` script targets all `.vue`, `.ts`, `.js`, and `.css` files inside `app/`.

---

## Related Repositories

- **Backend:** Laravel REST API — https://github.com/adamsima77/nti-backend