# Docker Deployment (Backend)

## Voraussetzungen

- Docker & Docker Compose
- Traefik mit `infrastructure` Netzwerk
- OpenRouter API Key

## Quick Start

```bash
cd docker

# 1. Setup ausführen (generiert API Token)
./setup.sh

# 2. OpenRouter API Key eintragen
nano stack.env

# 3. Starten
docker compose up -d
```

## Konfiguration

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `OPENROUTER_API_KEY` | OpenRouter API Key | `sk-or-...` |
| `API_TOKENS` | User-Tokens | `token:user:100` |
| `API_DOMAIN` | Backend Domain | `naehrwert-api.rubeen.dev` |

### API Tokens

Format: `token:username:rateLimit`

Mehrere User: `token1:user1:100,token2:user2:50`

```bash
# Neuen Token generieren
openssl rand -hex 24
```

## Lokales Testen (ohne Traefik)

```yaml
# In compose.yaml hinzufügen:
services:
  backend:
    ports:
      - "3000:3000"
```

Dann erreichbar unter `http://localhost:3000`
