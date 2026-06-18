# BusinessKit Admin Panel

React + TypeScript + Vite admin panel for the BusinessKit backend.

## Modules

| Module | Description |
|---|---|
| Login / Auth | JWT-based login; token persisted in localStorage |
| Dashboard | Module status overview |
| Appointments | List, filter, edit, and change appointment status |
| Staff | Create, edit, activate/deactivate staff members |
| Services | Create, edit, activate/deactivate business services |
| Blog | Create, edit, publish/unpublish blog posts |
| Gallery | Create, edit, upload images, activate/deactivate gallery items |
| Messages | View, mark read/replied, archive contact messages |
| Settings | Manage business name, contact info, social links, appearance |

## Requirements

- Node.js 18+ / npm
- BusinessKitBackend running locally (see below)

## Local development

### 1. Start the backend

```
cd C:\Users\sefaa\Desktop\BusinessKitBackend
dotnet run --project BusinessKit.Api --urls "http://localhost:5299"
```

Backend runs at: **http://localhost:5299**

### 2. Start the frontend

```
cd C:\Users\sefaa\Desktop\BusinessKitAdminPanel
npm install
npm run dev
```

Admin panel runs at: **http://localhost:5173**

## Default admin credentials

Use the admin credentials configured in the backend seed data.

From smoke tests: `admin@businesskit.local` / `Admin123!`

## Build

```
npm run build
```

Output goes to `dist/`. TypeScript is checked before Vite bundles.

## Smoke tests

Manual regression checklist: [SMOKE_TESTS.md](SMOKE_TESTS.md)

Run the full checklist against a live backend before tagging any release.

## Known limitations

- API base URL is hardcoded to `http://localhost:5299` — no `VITE_API_URL` env variable yet
- Gallery image preview base URL is also hardcoded to `http://localhost:5299`
- No 401 auto-logout — expired tokens show API error banners rather than redirecting to login
- No role-based frontend enforcement — any account with valid credentials can access the panel
- Dashboard stats are static — module cards show "Module active", not real data counts
- No pagination — all lists load in a single request
- No search — no full-text or field-level filter in any module
- No delete actions in modules without backend delete endpoints (Blog, Gallery, Messages)
- Desktop-first — sidebar has no mobile collapse
- No automated tests — manual smoke tests are the release gate

## Version

**v3.0** — Admin Panel MVP Release Checkpoint
