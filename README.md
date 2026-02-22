# message-me

Production-ready SMS scheduling platform with Expo frontend and Express backend.

## Architecture plan
- **Frontend (Expo + React Native + TypeScript):** Responsive card-based dashboard for contacts, upload, devices quick-select, compose/schedule, and in-app toast feedback.
- **Backend (Express + TypeScript):** Modular routes with Zod validation, centralized error handling, Helmet/CORS/rate-limit hardening.
- **Persistence (Drizzle + SQLite, PostgreSQL-ready structure):** Contacts, devices, campaigns, sms_logs schema with campaign pacing and time-slot fields.
- **Delivery engine:** Provider abstraction (Twilio or Mock via env) plus cron scheduler to process scheduled campaigns in controlled batches.

## Local run commands
```bash
npm install
npm run dev:backend
npm run dev:frontend
```

Backend env (`backend/.env` example):
```bash
PORT=4000
DATABASE_URL=./message-me.sqlite
SMS_PROVIDER=mock
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
CORS_ORIGIN=http://localhost:8081
```

## API highlights
- `POST /api/contacts` add single E.164 contact with optional `deviceId`.
- `POST /api/contacts/bulk-upload` upload `.csv/.xls/.xlsx`, normalize phones, skip duplicates, return counts.
- `POST /api/campaigns/send-now` send immediately with optional pacing/device/timeslot.
- `POST /api/campaigns/schedule` schedule by ISO time with optional timing + device fields.
- `GET /api/dashboard/stats` aggregate SMS stats cards.
- `GET /api/logs?status=&from=&to=` + `GET /api/logs/export.csv`.
- `GET/POST /api/devices` device registration/listing.

## Troubleshooting
### UI not updating
1. Stop all processes.
2. Clear Metro cache: `npm --workspace frontend run start -- --clear`.
3. Hard refresh browser/app.
4. Confirm frontend env `EXPO_PUBLIC_API_URL` points to backend.

### PR binary file issues
- Do not commit `.sqlite`, spreadsheet samples, or build artifacts.
- Verify staged files before commit:
  ```bash
  git status
  git diff --cached --name-only
  ```
- If accidental binary staged: `git reset HEAD <file>` then add `.gitignore` entry.
