# Photographer Portfolio

## Spuštění projektu

Vždy spustit **oba** procesy (každý v samostatném terminálu nebo na pozadí):

```bash
# Backend (port 3001)
cd server && npm run dev

# Frontend (port 5173)
cd client && npm run dev
```

Frontend je dostupný na **http://localhost:5173**, backend API na **http://localhost:3001**.

## Struktura

Detailní přehled architektury, API a datových toků je v [`architecture.md`](./architecture.md).

Zkrácený přehled:
- `client/src/components/PhotoEditor.jsx` – editor fotek (crop, zoom, náklon)
- `client/src/pages/Admin.jsx` – správa fotek, alb, webprojektů
- `server/routes/photos.js` – výpis, editace, revert, pořadí, smazání
- `server/data/` – runtime JSON (pořadí, edity, nastavení) — není DB

## Jak funguje backend

- **Žádná databáze** – albumy a fotky se čtou přímo ze souborového systému (`uploads/fotky/`)
- Každá podsložka v `uploads/fotky/` = jedno album
- Editace fotek: originál se zálohuje do `server/data/originals/` (gitignored), params do `photo-edits.json`

## Přihlášení do admina

Přihlašovací údaje jsou v `.env` (není v gitu):
- `ADMIN_USER` – uživatelské jméno
- `ADMIN_PASS` – heslo

Výchozí hodnoty: `admin` / `changeme`

## .env

Soubor `.env` je v kořeni projektu (není commitnutý). Obsahuje:

```
JWT_SECRET=...
ADMIN_USER=admin
ADMIN_PASS=changeme
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

## GitHub

https://github.com/nguytoman/Toman-_-photography

## Pravidla pro Claude

### Udržování dokumentace

- Po **každé strukturální změně** (nová route, nová komponenta, nový endpoint, změna datového toku) aktualizuj `architecture.md` — příslušnou tabulku, sekci nebo adresářovou strukturu.
- Po **větších změnách** (nová feature, refactor více souborů, změna stacku) aktualizuj i tento soubor (`CLAUDE.md`) — sekci Struktura nebo poznámky k backendu.
- `architecture.md` je zdroj pravdy o struktuře projektu — drž ho přesný a stručný, bez zbytečného textu.
