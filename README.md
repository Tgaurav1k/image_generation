# Bulk Image Generation Platform

Full-stack web app for generating AI images in bulk from a single prompt or an Excel sheet of prompts, with ZIP downloads and admin user management.

## Tech stack

- **Frontend:** React 19, Vite, Zustand, Tailwind CSS 4, Framer Motion
- **Backend:** Node.js 20, Express 5, PostgreSQL (`pg`), JWT auth in httpOnly cookies
- **External APIs:** an image generation API and an OpenAI-compatible chat API for prompt enhancement

## Features

- Roles: superadmin, admin, user (no public signup; admins create users)
- Single prompt or Excel upload (one prompt per row), with images-per-prompt selection
- Optional AI prompt enhancement
- Size presets (512 / 768 / 1024) or custom size
- Gallery with multi-select ZIP download, including a `prompts.xlsx` manifest
- Admin dashboard: stats, user management, activity log
- Daily cron deletes images older than 7 days

## Quick start

### Prerequisites

- Node.js 20 LTS
- PostgreSQL 15+
- Access to the image generation API (and, optionally, the prompt enhancer API)

### Backend

```bash
cd backend
npm install
cp .env.example .env    # fill in real values
npm run migrate         # creates tables, seeds superadmin/admin from .env
npm run dev             # http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env    # leave VITE_API_URL empty to use the Vite dev proxy
npm run dev             # http://localhost:5173
```

Log in with `SUPERADMIN_*` or `ADMIN_*` credentials from `backend/.env`.

## Environment variables

All app config lives in `backend/.env`. See [`backend/.env.example`](backend/.env.example) for the full list.

| Group | Variables |
|-------|-----------|
| Server | `PORT`, `NODE_ENV`, `FRONTEND_ORIGIN` (comma-separated), `COOKIE_SECURE` |
| Database | `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` |
| Image API | `IMAGE_API_URL`, `IMAGE_API_KEY` |
| Prompt enhancer | `ENHANCE_API_URL`, `ENHANCE_API_KEY`, `ENHANCE_MODEL` |
| Bootstrap users | `SUPERADMIN_USERNAME/PASSWORD`, `ADMIN_USERNAME/PASSWORD`, optional `HERO_USERNAME/PASSWORD` |
| Auth | `JWT_SECRET`, `JWT_EXPIRES_IN` |

Never commit `.env` files. They are git-ignored.

## Project structure

```
├── backend/          # Express API (src/modules, db, cron, middleware)
└── frontend/         # React SPA (Vite)
```
