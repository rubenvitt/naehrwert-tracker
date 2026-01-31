# Docker Deployment

## Voraussetzungen

- Docker & Docker Compose
- Traefik mit `infrastructure` Netzwerk
- OpenAI API Key

## Quick Start

```bash
cd docker

# 1. Setup ausführen
./setup.sh

# 2. OpenAI API Key eintragen
nano stack.env

# 3. Starten
docker compose up -d
```

## Dateien

| Datei | Beschreibung |
|-------|--------------|
| `compose.yaml` | Docker Compose Stack |
| `stack.env.example` | Vorlage für Umgebungsvariablen |
| `stack.env` | Deine Konfiguration (nicht committen!) |
| `Dockerfile.frontend` | Multi-stage Build für React App |
| `Dockerfile.backend` | Multi-stage Build für Hono API |
| `nginx.conf` | Nginx Config für SPA |

## Konfiguration

```bash
# Projekt-Name
COMPOSE_PROJECT_NAME=naehrwert

# Domains anpassen
APP_DOMAIN=naehrwert.rubeen.dev
API_DOMAIN=naehrwert-api.rubeen.dev

# OpenAI API Key (erforderlich!)
OPENAI_API_KEY=sk-...
```

## Services

| Service | Beschreibung | URL |
|---------|--------------|-----|
| Frontend | React SPA via Nginx | `https://naehrwert.rubeen.dev` |
| Backend | Hono API | `https://naehrwert-api.rubeen.dev` |

## Lokales Testen

Ohne Traefik kannst du die Ports freigeben:

```yaml
# In compose.yaml hinzufügen:
services:
  frontend:
    ports:
      - "8080:80"
  backend:
    ports:
      - "3000:3000"
```

Dann erreichbar unter `http://localhost:8080` und `http://localhost:3000`.
