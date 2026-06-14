# LeadFlow Frontend Turborepo Conversion Walkthrough

We have successfully converted the LeadFlow frontend repository into a robust **pnpm-workspaces** based **Turborepo monorepo** and redesigned the marketing landing page according to your light theme designs.

---

## 1. Project Restructuring Overview

The codebase is organized into **apps** (individual deployable Next.js frontends) and **packages** (shared code: styles, logic, configs):

```text
frontend/
├── apps/
│   ├── website/        # Next.js App on Port 3000 (Marketing, Pricing, Features, Contact, Footer)
│   ├── platform/       # Next.js App on Port 3001 (Auth, User Dashboard, Query, Preview, Payment)
│   └── admin/          # Next.js App on Port 3002 (Admin Dashboard, Scraper Control, Signal Engine, Users)
├── packages/
│   ├── ui/             # Shared component library (Button, Table, Navbar, Footer, ContactForm)
│   ├── core/           # Shared API client, Supabase client with subdomain cookie session, TS types
│   ├── tsconfig/       # Shared TSConfig compiler rules
│   └── eslint-config/  # Shared ESLint lint rules
```

---

## 2. Redesigned Website (`apps/website`)

We rebuilt the website home page (`apps/website/src/app/page.tsx`) to match the clean light-themed wireframe:
- **Hero Header**: High-contrast typography with purple accent CTA buttons ("Start Free Trial" and "Book a demo").
- **Live Lead Preview Card**: An interactive mock data card with window control dots mimicking a browser window, showing target Shopify leads and badge tags.
- **Brand Trust Section**: Monospace trust bar displaying core commerce icons (`Store`, `ShoppingCart`, `Truck`, `Package`, `CreditCard`).
- **Intelligence at Scale Section**: Centered feature description with soft warm background gradient glows.
- **Grid Features Section**: 3x2 grid of service feature cards (Signal-Based Targeting, Niche Filters, etc.).
- **Pricing Cards**: Three distinct cards (Starter, Pro, Scale) with custom badge flags and high-contrast indigo action triggers.
- **Get in Touch**: Centered name and email input card layout matching the wireframe.

---

## 3. Local Development Guide

### Install Dependencies
Run in the root folder:
```bash
pnpm install
```

### Run All Applications Concurrently
Starts the Website (3000), Platform (3001), and Admin (3002) dev servers:
```bash
pnpm dev
```

### Develop a Single Application
To run or develop a specific project:
```bash
pnpm --filter @leadflow/website dev
pnpm --filter @leadflow/platform dev
pnpm --filter @leadflow/admin dev
```

1. Run Development Server for the Website bash - 

pnpm --filter @leadflow/website dev

2. Build the Website only bash

pnpm --filter @leadflow/website build

3. Run Development Server for the Platform/Console bash

pnpm --filter @leadflow/platform dev


### Add Workspace-Specific Packages
To install a library into a specific app:
```bash
pnpm --filter @leadflow/platform add lucide-react
```

### Full Project Build Check
```bash
pnpm build
```

---

## 4. Hosting & Deployment Guidelines

Monorepos compile down to standard, deployable sub-projects. You can host them on standard web platforms:

### Option A: Vercel (Highly Recommended)
Vercel has native Turborepo support.
1. Connect your repository to Vercel.
2. Create three separate projects on Vercel:
   - **Project 1: Website**
     - Root Directory: `apps/website`
     - Framework Preset: Next.js
     - Build Command: `pnpm build` (Vercel automatically runs `npx turbo run build --filter=@leadflow/website...`)
   - **Project 2: Platform**
     - Root Directory: `apps/platform`
     - Framework Preset: Next.js
   - **Project 3: Admin**
     - Root Directory: `apps/admin`
     - Framework Preset: Next.js
3. Map your subdomains in Vercel settings (e.g. `leadflow.co`, `app.leadflow.co`, `admin.leadflow.co`).

### Option B: Docker / Self-Hosted VPS
1. Run `pnpm build` in your pipeline.
2. Deploy the output `.next` folders of each app under `apps/*` to your servers (e.g., using PM2 or Docker configurations).
