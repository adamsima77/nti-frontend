# NTI Frontend

> **Nitriansky technologický inkubátor**

Frontend application for the Nitra Technology Incubator (NTI) platform — a full-featured process portal combining a public-facing presentation website with a role-based internal management system for programs, applications, teams, mentoring, and administration.

---

## Table of Contents

* [About the Project](#about-the-project)
* [Tech Stack & Packages](#tech-stack--packages)
* [Project Structure](#project-structure)
* [Route Architecture](#route-architecture)
* [Internationalization](#internationalization)
* [State Management](#state-management)
* [Security & Bot Protection](#security--bot-protection)
* [SEO & Sitemap](#seo--sitemap)
* [Getting Started](#getting-started)
* [Environment Variables](#environment-variables)
* [Docker](#docker)
* [Code Quality](#code-quality)
* [Related Repositories](#related-repositories)

---

## About the Project

NTI is a technology incubator based in Nitra, Slovakia, operating two flagship programs:

### Program A

A grant-based incubation program for students and teams with their own innovative idea, aimed at building a startup or product.

### Program B

A live practice program connecting real company projects with student teams, producing contracted software with the involvement of a Product Owner.

This frontend serves all user roles on the platform:

| Role                   | Description                                                 |
| ---------------------- | ----------------------------------------------------------- |
| Visitor                | Public website, program information, news, contacts         |
| Student                | Profile management, team creation, application submission   |
| Team Leader            | Team management, member invitations, team applications      |
| Company / Partner      | Company profile, project specifications, backlog management |
| Mentor                 | Project tracking, consultation logs, milestone approvals    |
| Commission / Evaluator | Application evaluation and scoring                          |
| Content Manager        | CMS management (pages, news, FAQ, partners, banners)        |
| NTI Administrator      | Program management, user management, reporting              |
| Super Administrator    | System settings, roles, audit logs, integrations            |

---

## Tech Stack & Packages

The application is built on top of Nuxt with a modern Vite-powered toolchain.

### Core Framework & Build Tools

* **Nuxt 4**

  * Vue 3 framework
  * TypeScript support
  * File-based routing
  * Hybrid rendering

* **Vite**

  * Fast development server
  * Optimized production builds
  * Docker polling support enabled

### Installed Modules

| Package             | Purpose                          |
| ------------------- | -------------------------------- |
| `@pinia/nuxt`       | State management                 |
| `@nuxtjs/i18n`      | Internationalization             |
| `@nuxtjs/sitemap`   | XML sitemap generation           |
| `@nuxtjs/turnstile` | Cloudflare Turnstile integration |
| `@nuxt/eslint`      | Linting and code quality         |
| `@tailwindcss/vite` | Tailwind CSS v4 integration      |
| `lucide-vue-next`   | Icon library                     |

---

## Project Structure

```text
nti-frontend/
├── app/
│   ├── assets/
│   │   └── main.css
│   │
│   ├── components/
│   │   ├── admin/
│   │   ├── blocks/
│   │   ├── layout/
│   │   ├── mentor/
│   │   └── ui/
│   │
│   ├── composables/
│   │   └── modules/
│   │       ├── content/
│   │       ├── programs/
│   │       └── student/
│   │
│   ├── layouts/
│   ├── middleware/
│   ├── pages/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── cms/
│   │   ├── firma/
│   │   ├── hodnotenie/
│   │   ├── mentor/
│   │   ├── notifikacie/
│   │   ├── novinky/
│   │   ├── student/
│   │   ├── super-admin/
│   │   └── vyzvy/
│   │
│   ├── plugins/
│   ├── stores/
│   └── types/
│
├── composables/
├── i18n/
│   └── locales/
│       ├── sk.json
│       └── en.json
│
├── public/
├── nuxt.config.ts
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## Route Architecture

The application uses a **hybrid rendering strategy** configured through `routeRules`.

### SSR Routes

Public pages optimized for SEO:

```text
/
kontakt
o-nas
partneri-mentori
program-a
program-b
novinky
vyzvy
```

### CSR Routes

Authenticated areas rendered client-side:

```text
/auth/**
/student/**
/prihlasky/**
/timy/**
/hodnotenie/**
/mentor/**
/firma/**
/admin/**
/cms/**
/superadmin/**
/notifikacie/**
```

---

## Internationalization

Implemented using `@nuxtjs/i18n`.

### Configuration

| Setting          | Value                   |
| ---------------- | ----------------------- |
| Strategy         | `prefix_except_default` |
| Default Locale   | `sk`                    |
| Secondary Locale | `en`                    |

### Examples

```text
/program-a
```

```text
/en/program-a
```

### Features

* Automatic locale detection
* Cookie persistence (`i18n_redirected`)
* Fallback language support
* Dynamic translation loading

---

## State Management

State management is handled by **Pinia**.

Features:

* Centralized stores
* API integration through composables
* Automatic authentication header injection
* Feature-based state separation

Location:

```text
app/stores/
```

---

## Security & Bot Protection

Cloudflare Turnstile is used to protect:

* Contact forms
* Authentication forms
* Application submissions

Environment variable:

```env
NUXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
```

The backend validates tokens before accepting requests.

---

## SEO & Sitemap

SEO infrastructure is powered by `@nuxtjs/sitemap`.

### Indexed Routes

```text
/
/kontakt
/o-nas
/partneri-mentori
/program-a
/program-b
/novinky
/vyzvy
```

### Excluded Routes

```text
/auth/
/student/
/hodnotenie/
/mentor/
/firma/
/admin/
/notifikacie/
```

---

## Getting Started

### Prerequisites

* Node.js 20+
* npm

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Application runs at:

```text
http://localhost:3000
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Internal API communication (Docker)
NUXT_API_BASE=http://backend:8000/api

# Public API URL
NUXT_PUBLIC_API_BASE=http://localhost/api

# Cloudflare Turnstile
NUXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
```

---

## Docker

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

### Build Image

```bash
docker build -t nti-frontend .
```

### Run Container

```bash
docker run -p 3000:3000 nti-frontend
```

### Docker Compose

For multi-container environments:

```env
NUXT_API_BASE=http://backend:8000/api
```

allows internal service communication while browser requests are routed through the reverse proxy.

---

## Code Quality

### Lint

```bash
npm run lint
```

### Auto Fix

```bash
npm run lint:fix
```

### Format

```bash
npm run format
```

Formatting and linting are configured via:

```text
eslint.config.mjs
```

and cover:

* `.vue`
* `.ts`
* `.js`
* `.css`

files throughout the application.

---

## Related Repositories

### Backend Platform

Laravel REST API:

```text
https://github.com/adamsima77/nti-backend
```
