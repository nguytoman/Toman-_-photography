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

- `client/` – React + Vite frontend
- `server/` – Express backend
- `server/uploads/fotky/` – fotky rozdělené do složek podle alb (např. `Zlin/`, `brno/`, `Olomouc/`)

## Jak funguje backend

- **Žádná databáze** – albumy a fotky se čtou přímo ze souborového systému (`uploads/fotky/`)
- Každá podsložka v `uploads/fotky/` = jedno album
- Nové album = nová složka

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
