# Guru Legal Bot

WhatsApp-based legal assistant bot for law firms. Clients interact via WhatsApp to register, schedule appointments, upload documents, check case status, and get legal information. Includes an admin dashboard for lawyers to manage everything.

Built for **Dominican Republic** legal practice — all conversations in Spanish, DR legal terminology, RD$ pricing.

## Architecture

```
Client (WhatsApp)
    ↕ Baileys (multi-device API)
Node.js + Express Server
    ├── Conversation Engine (state machine)
    │   ├── NLP (regex + Gemini LLM intent detection)
    │   ├── Flows (intake, appointments, documents, etc.)
    │   └── Knowledge Base (legal topics, institutions, pricing)
    ├── Gemini AI (smart responses, voice transcription, doc analysis)
    ├── PostgreSQL (clients, cases, messages, sessions)
    └── REST API
            ↕
React Dashboard (Vite + Tailwind)
    └── Lawyer/Admin panel
```

## Features

### WhatsApp Bot
- **Client intake** — Collects name, cédula, phone, email, address, case type, description
- **Appointment scheduling** — Date/time selection with business hours validation
- **Document upload** — Clients send photos/PDFs, bot saves and catalogs them
- **Case status** — Clients check their case progress by cédula or case number
- **Legal info** — Browse 9 legal topics with DR law references
- **Services & pricing** — Full service catalog with RD$ prices
- **Smart fallback** — Unrecognized messages searched against knowledge base, answered by Gemini AI
- **Voice notes** — Transcribed to text via Gemini, processed as regular messages
- **Image/PDF analysis** — Gemini analyzes documents and provides context-aware responses
- **Natural conversation** — Handles casual chat, DR slang ("klk"), greetings
- **Session management** — Auto-expires after 30 min inactivity, global commands (menu, help, goodbye)

### Admin Dashboard
- **Dashboard** — Stats overview (clients, active cases, messages today, pending appointments)
- **Clients** — Full client directory with search
- **Cases (Expedientes)** — Case management with status tracking
- **Messages** — WhatsApp message history with profile pictures
- **Appointments** — Calendar view of scheduled appointments
- **Documents** — Uploaded document management
- **WhatsApp** — Connection manager (QR code pairing, connection status)
- **Settings** — Bot mode (all/selected phones), pause/resume, manual takeover per chat
- **Analytics** — Usage statistics

## Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **A WhatsApp account** to connect the bot (scanned via QR code)
- **Google Gemini API key** (free tier: 15 req/min) — optional but recommended

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd guru-legal-bot
npm install
cd client && npm install && cd ..
```

### 2. PostgreSQL database

```bash
createdb guru_legal_bot
```

### 3. Environment variables

Create `.env` in the project root:

```env
# Server
PORT=3002
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=guru_legal_bot
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

# JWT
JWT_SECRET=change-this-to-a-random-secret
JWT_EXPIRES_IN=7d

# WhatsApp
WA_SESSION_DIR=./wa_sessions

# Gemini AI (optional — bot works without it using regex NLP)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_ENABLED=true
```

### 4. Initialize database

```bash
npm run db:init
```

This creates all tables: `users`, `clients`, `cases`, `messages`, `wa_sessions`, `conversation_sessions`, `appointments`, `document_requests`, `client_media`.

### 5. Create admin user

```bash
npm run db:seed
```

Default credentials (change in production):
- Email: `admin@guru.com`
- Password: `admin123`

### 6. Start the app

**Development** (both backend + frontend with hot reload):

```bash
npm run dev:full
```

Or separately:

```bash
npm run dev          # Backend on port 3002
npm run client:dev   # Frontend on port 5173
```

**Production**:

```bash
npm run client:build  # Build React dashboard
npm start             # Serves API + dashboard
```

### 7. Connect WhatsApp

1. Open the dashboard at `http://localhost:5173` (dev) or `http://localhost:3002` (prod)
2. Log in with your admin credentials
3. Go to **WhatsApp** page
4. Click **Connect** — a QR code appears
5. Open WhatsApp on your phone → Settings → Linked Devices → Link a Device → Scan QR
6. Once connected, the bot is live. Send a message to the connected number to test.

The session persists in `./wa_sessions/` — the bot auto-reconnects on server restart.

## Project Structure

```
├── src/
│   ├── server.js                  # Express app entry point
│   ├── config.js                  # Environment config
│   ├── conversation/
│   │   ├── router.js              # Message routing + smart fallback
│   │   ├── stateManager.js        # Session state machine
│   │   ├── nlp.js                 # Intent detection (regex)
│   │   ├── messages.js            # All bot messages + interactive lists
│   │   └── flows/
│   │       ├── intake.js          # Client registration
│   │       ├── appointment.js     # Appointment scheduling
│   │       ├── document.js        # Document upload
│   │       ├── caseStatus.js      # Case status lookup
│   │       ├── legalInfo.js       # Legal topic browser
│   │       └── services.js        # Service catalog
│   ├── knowledge/
│   │   ├── legalTopics.js         # DR legal topics from PDF
│   │   ├── institutions.js        # DR government institutions + URLs
│   │   ├── services.js            # Service pricing (from CSV)
│   │   └── search.js              # Knowledge base search engine
│   ├── llm/
│   │   ├── client.js              # Gemini client setup
│   │   ├── generate.js            # AI text generation + intent detection
│   │   ├── mediaAnalysis.js       # Voice transcription + document analysis
│   │   └── systemPrompt.js        # Bot personality + knowledge context
│   ├── whatsapp/
│   │   ├── connection.js          # Baileys multi-session manager
│   │   ├── handler.js             # Incoming message dispatcher
│   │   ├── interactive.js         # WhatsApp list message builder
│   │   ├── mediaService.js        # Media download + storage
│   │   └── botSettings.js         # Bot state persistence
│   ├── models/                    # PostgreSQL models (Client, Case, etc.)
│   ├── routes/                    # REST API endpoints
│   ├── middleware/auth.js         # JWT authentication
│   └── db/
│       ├── pool.js                # PostgreSQL connection pool
│       ├── init.js                # Schema creation
│       └── seed.js                # Default admin user
├── client/
│   └── src/
│       ├── App.jsx                # React Router setup
│       ├── components/
│       │   └── Layout.jsx         # Dashboard shell (nav, sidebar)
│       ├── contexts/
│       │   └── AuthContext.jsx     # JWT auth state
│       ├── pages/                 # Dashboard pages
│       └── utils/                 # Formatters, API client
├── data/                          # Source files (legal PDF, tarifario CSV)
├── uploads/                       # Saved media from WhatsApp
└── wa_sessions/                   # WhatsApp session credentials
```

## Conversation Flow

The bot uses a **state machine** pattern. Each phone number has a session with `flow` (which module) and `step` (which step within the flow).

```
Incoming message
    ↓
Check global commands (menu, help, goodbye)
    ↓
Check if existing session → resume flow at current step
    ↓
No session → detect intent (Gemini LLM → regex NLP fallback)
    ↓
Route to flow module OR smart fallback (knowledge base + AI)
```

### Main Menu (8 options)
1. Nueva consulta legal — Client intake/registration
2. Agendar una cita — Schedule appointment
3. Enviar documentos — Upload documents
4. Consultar estado de caso — Check case status
5. Información legal — Browse legal topics
6. Servicios y precios — View pricing
7. Hablar con un abogado — Request human contact
0. Finalizar conversación — End session

### Smart Fallback
When the bot doesn't recognize the intent:
1. Searches the knowledge base (legal topics, institutions, services)
2. If matches found → generates AI response with matched context (RAG)
3. If no matches → generates general AI response
4. If Gemini is down → returns keyword search results

## Customizing for Another Business

This bot is designed to be repurposed. Here's what to change:

### 1. Bot personality and language

Edit `src/llm/systemPrompt.js`:
- Change the bot name, personality description, and tone
- Update the business context and rules
- Modify the knowledge sections (topics, institutions, services)

### 2. Knowledge base

Replace the content in `src/knowledge/`:
- **legalTopics.js** → Your domain topics (medical procedures, restaurant menu, real estate listings, etc.)
- **institutions.js** → Relevant organizations/links for your industry
- **services.js** → Your service catalog and pricing

Each topic is a simple object:

```js
{
  key: 'topic_id',
  title: 'Topic Title',
  keywords: ['keyword1', 'keyword2'],
  content: 'Full description shown to users...',
  source: 'Reference or citation'
}
```

### 3. Conversation flows

The flows in `src/conversation/flows/` define the step-by-step data collection:
- **intake.js** — Change the fields collected during registration (currently: name, cédula, email, address, case type, description, urgency)
- **appointment.js** — Change appointment types, time slots, business hours
- **services.js** — Update service categories
- Other flows can be modified or removed as needed

### 4. Messages and menu

Edit `src/conversation/messages.js`:
- All user-facing text is defined here
- Main menu options, flow prompts, error messages, confirmations
- WhatsApp interactive list definitions

### 5. NLP intents

Edit `src/conversation/nlp.js`:
- Intent patterns are regex-based — update keywords for your domain
- Add or remove intents as needed
- The LLM intent detection in `src/llm/generate.js` also needs its intent list updated

### 6. Database schema

If you change the data model, update:
- `src/db/init.js` — Table definitions
- `src/models/` — Corresponding model files
- Run `npm run db:init` to apply changes

### 7. Dashboard

The React dashboard in `client/src/` mirrors the backend:
- Pages in `pages/` correspond to API routes
- Update labels, status maps, and formatters in `utils/format.js`
- Add/remove pages in `App.jsx` and nav links in `components/Layout.jsx`

## API Endpoints

All endpoints require JWT auth (`Authorization: Bearer <token>`) unless noted.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/clients` | List clients |
| GET | `/api/clients/:id` | Get client details |
| POST | `/api/clients` | Create client |
| PUT | `/api/clients/:id` | Update client |
| GET | `/api/cases` | List cases |
| GET | `/api/cases/:id` | Get case details |
| POST | `/api/cases` | Create case |
| PUT | `/api/cases/:id` | Update case |
| DELETE | `/api/cases/:id` | Delete case |
| GET | `/api/messages` | List messages |
| GET | `/api/messages/client/:clientId` | Client messages |
| GET | `/api/appointments` | List appointments |
| POST | `/api/whatsapp/connect` | Start WhatsApp session |
| GET | `/api/whatsapp/status` | Connection status |
| POST | `/api/whatsapp/disconnect` | End session |
| GET | `/api/whatsapp/profile-pic/:phone` | Get contact photo |
| GET | `/api/media/:phone/:filename` | Download saved media |

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Admin/lawyer accounts |
| `clients` | WhatsApp clients (name, phone, cédula, email, address) |
| `cases` | Legal cases linked to clients |
| `messages` | All WhatsApp messages (inbound + outbound) |
| `wa_sessions` | WhatsApp connection sessions |
| `conversation_sessions` | Bot state machine (flow, step, data per phone) |
| `appointments` | Scheduled appointments |
| `document_requests` | Document upload requests |
| `client_media` | Saved media files metadata |

## Commands

```bash
npm run dev          # Start backend (nodemon, auto-restart)
npm run client:dev   # Start frontend (Vite, hot reload)
npm run dev:full     # Start both concurrently
npm start            # Production server
npm run client:build # Build React dashboard
npm run db:init      # Create/update database tables
npm run db:seed      # Seed admin user
npm run db:migrate   # Run migrations
```

## Tech Stack

**Backend**: Node.js, Express, PostgreSQL (pg), @whiskeysockets/baileys, @google/generative-ai (Gemini 2.5 Flash), JWT (jsonwebtoken + bcrypt)

**Frontend**: React 19, Vite, Tailwind CSS, React Router, Framer Motion, Lucide icons

## Notes

- The bot works without Gemini (`GEMINI_ENABLED=false`) — falls back to regex NLP and keyword search. AI features (smart responses, voice transcription, document analysis) require a Gemini API key.
- WhatsApp sessions are saved to disk and auto-reconnect on server restart. No need to re-scan QR.
- The free Gemini tier allows 15 requests/minute. The bot handles rate limiting gracefully with automatic fallback.
- Media files (voice notes, images, PDFs) are saved to `./uploads/<phone>/` and tracked in the `client_media` table.
- All conversation sessions auto-expire after 30 minutes of inactivity.
