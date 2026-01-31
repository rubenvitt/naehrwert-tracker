#!/usr/bin/env bash
# =============================================================================
# Nährwert-Tracker - Setup Script
# =============================================================================

set -euo pipefail

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/stack.env"
EXAMPLE_FILE="${SCRIPT_DIR}/stack.env.example"

echo -e "\n${GREEN}Nährwert-Tracker Setup${NC}\n"

# stack.env erstellen falls nicht vorhanden
if [[ ! -f "$ENV_FILE" ]]; then
    cp "$EXAMPLE_FILE" "$ENV_FILE"
    echo -e "${GREEN}✓${NC} stack.env erstellt"
else
    echo -e "${YELLOW}⚠${NC} stack.env existiert bereits"
fi

# Prüfen ob API Key gesetzt ist
if grep -q "^OPENAI_API_KEY=sk-\.\.\." "$ENV_FILE"; then
    echo -e "\n${RED}!${NC} OpenAI API Key fehlt!"
    echo -e "  Bearbeite ${YELLOW}stack.env${NC} und trage deinen Key ein:"
    echo -e "  ${YELLOW}OPENAI_API_KEY=sk-...${NC}\n"
    exit 1
fi

echo -e "\n${GREEN}✓${NC} Setup abgeschlossen!\n"
echo -e "Starte mit: ${YELLOW}docker compose up -d${NC}\n"
