# NTI Frontend

> **Nitriansky technologický inkubátor**

Frontendová aplikácia pre platformu Nitrianskeho technologického inkubátora (NTI) – komplexný procesný portál kombinujúci verejnú prezentačnú webovú stránku s interným systémom riadenia programov, prihlášok, tímov, mentoringu a administrácie založeným na používateľských rolách.

---

## Obsah

* [O projekte](#o-projekte)
* [Technologický stack a balíčky](#technologický-stack-a-balíčky)
* [Štruktúra projektu](#štruktúra-projektu)
* [Architektúra rout](#architektúra-rout)
* [Internacionalizácia](#internacionalizácia)
* [Správa stavu](#správa-stavu)
* [Bezpečnosť a ochrana proti botom](#bezpečnosť-a-ochrana-proti-botom)
* [SEO a Sitemap](#seo-a-sitemap)
* [Začíname](#začíname)
* [Premenné prostredia](#premenné-prostredia)
* [Docker](#docker)
* [Kvalita kódu](#kvalita-kódu)
* [Súvisiace repozitáre](#súvisiace-repozitáre)

---

## O projekte

NTI je technologický inkubátor so sídlom v Nitre na Slovensku, ktorý prevádzkuje dva hlavné programy:

### Program A

Grantový inkubačný program určený pre študentov a tímy s vlastným inovatívnym nápadom, zameraný na budovanie startupu alebo produktu.

### Program B

Program praktickej výučby prepájajúci reálne firemné projekty so študentskými tímami, ktorých výstupom je zmluvne dodaný softvér za účasti Product Ownera.

Tento frontend slúži všetkým používateľským rolám na platforme:

| Rola                 | Popis                                                              |
| -------------------- | ------------------------------------------------------------------ |
| Návštevník           | Verejná webová stránka, informácie o programoch, novinky, kontakty |
| Študent              | Správa profilu, vytváranie tímov, podávanie prihlášok              |
| Vedúci tímu          | Správa tímu, pozývanie členov, tímové prihlášky                    |
| Firma / Partner      | Firemný profil, špecifikácia projektov, správa backlogu            |
| Mentor               | Sledovanie projektov, záznamy konzultácií, schvaľovanie míľnikov   |
| Komisia / Hodnotiteľ | Hodnotenie a bodovanie prihlášok                                   |
| Content Manager      | Správa CMS obsahu (stránky, novinky, FAQ, partneri, bannery)       |
| Administrátor NTI    | Správa programov, používateľov a reportov                          |
| Super administrátor  | Systémové nastavenia, role, auditné logy, integrácie               |

---

## Technologický stack a balíčky

Aplikácia je postavená na Nuxte s moderným build nástrojom Vite.

### Hlavný framework a build nástroje

* **Nuxt 4**

  * Framework postavený na Vue 3
  * Podpora TypeScriptu
  * Routovanie založené na súboroch
  * Hybridné renderovanie

* **Vite**

  * Rýchly vývojový server
  * Optimalizované produkčné buildy
  * Podpora polling režimu pre Docker

### Nainštalované moduly

| Balíček             | Účel                            |
| ------------------- | ------------------------------- |
| `@pinia/nuxt`       | Správa stavu aplikácie          |
| `@nuxtjs/i18n`      | Internacionalizácia             |
| `@nuxtjs/sitemap`   | Generovanie XML sitemapy        |
| `@nuxtjs/turnstile` | Integrácia Cloudflare Turnstile |
| `@nuxt/eslint`      | Lintovanie a kvalita kódu       |
| `@tailwindcss/vite` | Integrácia Tailwind CSS v4      |
| `lucide-vue-next`   | Knižnica ikon                   |

---

## Štruktúra projektu

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

## Architektúra rout

Aplikácia využíva **hybridnú stratégiu renderovania**, nakonfigurovanú pomocou `routeRules`.

### SSR routy

Verejné stránky optimalizované pre SEO:

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

### CSR routy

Autentifikované časti renderované na strane klienta:

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

## Internacionalizácia

Implementovaná pomocou `@nuxtjs/i18n`.

### Konfigurácia

| Nastavenie       | Hodnota                 |
| ---------------- | ----------------------- |
| Stratégia        | `prefix_except_default` |
| Predvolený jazyk | `sk`                    |
| Sekundárny jazyk | `en`                    |

### Príklady

```text
/program-a
```

```text
/en/program-a
```

### Funkcionality

* Automatická detekcia jazyka
* Ukladanie preferencie do cookies (`i18n_redirected`)
* Podpora fallback jazyka
* Dynamické načítavanie prekladov

---

## Správa stavu

Správa stavu aplikácie je riešená pomocou **Pinia**.

Funkcionality:

* Centralizované store moduly
* Integrácia API cez composables
* Automatické pridávanie autentifikačných hlavičiek
* Oddelenie stavu podľa funkcionalít

Umiestnenie:

```text
app/stores/
```

---

## Bezpečnosť a ochrana proti botom

Cloudflare Turnstile sa používa na ochranu:

* Kontaktných formulárov
* Prihlasovacích formulárov
* Odosielania prihlášok

Premenná prostredia:

```env
NUXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
```

Backend overuje tokeny pred spracovaním požiadaviek.

---

## SEO a Sitemap

SEO infraštruktúra je postavená na module `@nuxtjs/sitemap`.

### Indexované routy

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

### Vylúčené routy

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

## Začíname

### Požiadavky

* Node.js 20+
* npm

### Inštalácia závislostí

```bash
npm install
```

### Spustenie vývojového servera

```bash
npm run dev
```

Aplikácia bude dostupná na:

```text
http://localhost:3000
```

### Build pre produkciu

```bash
npm run build
```

### Náhľad produkčného buildu

```bash
npm run preview
```

---

## Premenné prostredia

Vytvorte súbor `.env` v koreňovom adresári projektu:

```env
# Interná komunikácia s API (Docker)
NUXT_API_BASE=http://backend:8000/api

# Verejná URL API
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

### Vytvorenie obrazu

```bash
docker build -t nti-frontend .
```

### Spustenie kontajnera

```bash
docker run -p 3000:3000 nti-frontend
```

### Docker Compose

Pre prostredia s viacerými kontajnermi:

```env
NUXT_API_BASE=http://backend:8000/api
```

umožňuje internú komunikáciu medzi službami, zatiaľ čo požiadavky z prehliadača sú smerované cez reverzný proxy server.

---

## Kvalita kódu

### Lintovanie

```bash
npm run lint
```

### Automatická oprava

```bash
npm run lint:fix
```

### Formátovanie

```bash
npm run format
```

Lintovanie a formátovanie sú nakonfigurované prostredníctvom:

```text
eslint.config.mjs
```

a pokrývajú:

* `.vue`
* `.ts`
* `.js`
* `.css`

súbory v celej aplikácii.

---

## Súvisiace repozitáre

### Backend platforma

Laravel REST API:

```text
https://github.com/adamsima77/nti-backend
```
