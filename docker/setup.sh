#!/usr/bin/env bash
# =============================================================================
# Nährwert-Tracker - Setup Script
# =============================================================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/stack.env"
EXAMPLE_FILE="${SCRIPT_DIR}/stack.env.example"

# Generiert einen sicheren Token
generate_token() {
    openssl rand -hex 24
}

echo -e "\n${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Nährwert-Tracker Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}\n"

# stack.env erstellen falls nicht vorhanden
if [[ ! -f "$ENV_FILE" ]]; then
    cp "$EXAMPLE_FILE" "$ENV_FILE"
    echo -e "${GREEN}✓${NC} stack.env erstellt"
else
    echo -e "${YELLOW}⚠${NC} stack.env existiert bereits"
fi

# API_TOKENS generieren falls Platzhalter vorhanden
if grep -q "^API_TOKENS=GENERATED_BY_SCRIPT" "$ENV_FILE"; then
    echo ""
    read -p "Username für den ersten API-Token [admin]: " USERNAME
    USERNAME=${USERNAME:-admin}

    read -p "Rate-Limit (Requests/Minute) [100]: " RATE_LIMIT
    RATE_LIMIT=${RATE_LIMIT:-100}

    TOKEN=$(generate_token)

    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|^API_TOKENS=GENERATED_BY_SCRIPT|API_TOKENS=${TOKEN}:${USERNAME}:${RATE_LIMIT}|" "$ENV_FILE"
    else
        sed -i "s|^API_TOKENS=GENERATED_BY_SCRIPT|API_TOKENS=${TOKEN}:${USERNAME}:${RATE_LIMIT}|" "$ENV_FILE"
    fi

    echo ""
    echo -e "${GREEN}✓${NC} API Token generiert:"
    echo -e "  User:  ${YELLOW}${USERNAME}${NC}"
    echo -e "  Token: ${YELLOW}${TOKEN}${NC}"
    echo -e "  Limit: ${RATE_LIMIT} req/min"
    echo ""
    echo -e "  ${BLUE}Speichere den Token! Er wird nur einmal angezeigt.${NC}"
fi

# Prüfen ob OpenRouter Key gesetzt ist
echo ""
if grep -q "^OPENROUTER_API_KEY=sk-or-\.\.\." "$ENV_FILE"; then
    echo -e "${RED}!${NC} OpenRouter API Key fehlt!"
    echo -e "  Bearbeite ${YELLOW}stack.env${NC} und trage deinen Key ein"
    echo -e "  Hol dir einen Key: ${BLUE}https://openrouter.ai/keys${NC}"
else
    echo -e "${GREEN}✓${NC} OpenRouter API Key ist gesetzt"
fi

echo -e "\n${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "Nächster Schritt: ${YELLOW}docker compose up -d${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}\n"
