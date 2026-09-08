# Blu OSINT — Cyber Intelligence Command Center

A professional open-source **OSINT + Cyber Intelligence platform** with a premium SOC/Command Center frontend. Modular, original, production-shaped, and safe — synthetic demo data is explicitly labeled.

**Stack:** Node.js/Express backend · React/Vite frontend · SQLite-file JSON persistence · no native build dependencies.

---

## Quick Start

```bash
# 1. Backend
cd server
npm install
# copy .env.example → .env and add your API keys
npm run dev            # → http://localhost:3001

# 2. Frontend (new terminal)
cd client
npm install
npm run dev            # → http://localhost:5173  (proxies /api to backend)
```

Open **http://localhost:5173**. `npm run build` produces a production bundle in `client/dist`.

## Windows one-shot

```bat
start-blusint.bat
```

---

## Modules

| Module | What it does | Sources |
| --- | --- | --- |
| **Domain** | reputation, DNS, WHOIS, tags, pulses | VirusTotal · Shodan · AlienVault OTX |
| **IP Address** | geo/ASN, open services & ports, reputation | Shodan · VirusTotal · AlienVault |
| **Email** | breach exposure, reporter reputation, domain health | VirusTotal · AlienVault |
| **Username** | cross-platform footprint (24+ networks) | Direct probes |
| **URL** | structure analysis, safe classification path | Local |
| **DNS** | record types, resolution history | Shodan · VirusTotal |
| **WHOIS** | registrar, registrant, lifecycle | VirusTotal |
| **SSL/TLS** | current cert, CT log enumeration | VirusTotal · crt.sh |
| **Technology** | server/framework/CMS fingerprinting | Direct HTTP |
| **IOC Engine** | auto-extract & enrich IPs/domains/URLs/hashes/emails/CVEs | VirusTotal · AlienVault |
| **Threat Intel** | pulse feeds, CVE watchlist, duty stats | AlienVault · NVD |
| **Password Strength** | entropy, patterns, crack-time (on-device, never stored) | Local engine |
| **Wi-Fi Intelligence** | BSSID OUI vendor, MAC semantics, SSID risk | Local OUI registry |
| **Web Search** | neural research across the open web | EXA |
| **Entity Graph** | force-directed relationship map | Case data |
| **Cases / Timeline / Reports** | investigation workflow + markdown reports | Backend persistence |

## API Configuration (`server/.env`)

| Variable | Provider | Used by |
| --- | --- | --- |
| `SHODAN_API_KEY` | Shodan | IP / host / DNS modules |
| `VIRUS_TOTAL` | VirusTotal | Domain / IP / Email / IOC / WHOIS / SSL |
| `ALIENVAULT_API` | AlienVault OTX | Threat feeds / pulses / IOC enrichment |
| `EXA_API` | EXA | Web search module |
| `NVD_API_KEY` | NIST NVD | CVE watchlist |

- Keys are **only ever read server-side** from `.env`. The API exposes a boolean `configured` flag at most — never a key.
- Each provider has **health, rate-limit, error and automatic fallback** handling. When a provider is off-line, unset or rate-limited, the module returns a clearly-labeled synthetic fallback instead of failing hard.

## Security notes

- `.env` is git-ignored; a sanitized `.env.example` is committed.
- `helmet` + per-API rate limiting + server-side validation on all `/api` input.
- Password analysis is local/stateless (password is not persisted, logged, or transmitted anywhere except the one-shot POST payload which is discarded).
- Report store is a simple local JSON store — replace with an audit-grade DB (e.g. Postgres) for production multi-tenant deployments.

## Modes

- **SOC Wall Mode** — fullscreen live threat map, kiosk-safe telemetry ticker, minimal chrome.
- **Analyst Mode** — full toolset: investigate, cases, graph, reporting.
- **Client Demo Mode** — soft-branded presentation overlay, safe for external stakeholders.

All dashboard/graph/feed visuals marked **SYNTHETIC DEMO DATA** are generated locally and contain no real network traffic or real client data.

## Project structure

```
blu-osint/
├── server/               # Express API
│   ├── .env              # API keys (never commit)
│   ├── src/modules/      # OSINT engines (domain, ip, email, ioc, wifi, …)
│   ├── src/routes/       # /api endpoints
│   └── data/             # JSON persistence (cases, history)
└── client/               # React + Vite frontend
    └── src/
        ├── pages/        # Command Center, Investigate, Threat Intel, Cases, …
        └── components/   # GlobalMap, Sidebar, TopBar, ResultView
```

## License

Open-source. Use responsibly — OSINT should always respect applicable laws and ethics. This tool is for defensive security research, threat intelligence and authorized investigations.