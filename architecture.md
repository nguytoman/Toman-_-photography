# Architecture

## Stack

| Vrstva    | Technologie                        |
|-----------|------------------------------------|
| Frontend  | React 18 + Vite, react-router-dom  |
| Backend   | Node.js + Express                  |
| Auth      | JWT (jsonwebtoken), bcrypt         |
| Upload    | multer (memory storage)            |
| Image edit| sharp (server), react-easy-crop    |
| i18n      | react-i18next (cs / en)            |
| Storage   | Filesystem — žádná databáze        |

---

## Adresářová struktura

```
photographer-portfolio/
├── client/                      # React + Vite frontend
│   └── src/
│       ├── api/client.js        # axios instance (baseURL /api, JWT interceptor)
│       ├── components/
│       │   ├── Lightbox.jsx     # fullscreen prohlížeč fotek
│       │   ├── Navbar.jsx       # navigace + jazykový přepínač
│       │   ├── PhotoEditor.jsx  # editor (crop / zoom / náklon), react-easy-crop
│       │   └── PhotoGrid.jsx    # mřížka fotek s lazy-load
│       ├── hooks/
│       │   ├── useAuth.js       # JWT auth stav + login/logout
│       │   └── usePhotos.js     # načítání fotek a alb
│       ├── i18n/
│       │   ├── cs.json          # české překlady
│       │   └── en.json          # anglické překlady
│       └── pages/
│           ├── About.jsx
│           ├── Admin.jsx        # správa fotek, alb, webprojektů
│           ├── Contact.jsx
│           ├── Gallery.jsx      # veřejná galerie s filtrací alb
│           ├── Home.jsx         # úvodní stránka, cover foto
│           └── Webdesign.jsx    # přehled webových projektů
│
├── server/                      # Express backend (port 3001)
│   ├── index.js                 # app setup, statické soubory, registrace routes
│   ├── middleware/
│   │   └── authMiddleware.js    # ověření JWT tokenu
│   ├── routes/
│   │   ├── albums.js            # CRUD alb (složky), pořadí alb
│   │   ├── auth.js              # POST /login → JWT
│   │   ├── contact.js           # odesílání kontaktního formuláře
│   │   ├── photos.js            # výpis, replace, revert, order, delete, move
│   │   ├── settings.js          # cover foto, overlay opacity
│   │   ├── upload.js            # nahrávání nových fotek (multer)
│   │   └── webprojects.js       # CRUD webových projektů
│   ├── utils/
│   │   └── preview.js           # generování náhledů (sharp, auto-rotace EXIF, vodoznak)
│   ├── uploads/
│   │   ├── fotky/               # fotky v plné kvalitě (URL v public API skryté)
│   │   │   └── <Album>/
│   │   │       └── *.jpg
│   │   └── previews/            # komprimované náhledy s vodoznakem (veřejné)
│   │       └── fotky/<Album>/
│   │           └── *.jpg
│   └── data/                    # runtime JSON soubory (není DB)
│       ├── photo-edits.json     # záznamy o editovaných fotkách + params
│       ├── photo-order.json     # pořadí fotek v každém albu
│       ├── settings.json        # cover foto, opacity
│       ├── webprojects.json     # seznam webových projektů
│       └── originals/           # originály před editací (gitignored)
│           └── fotky/<Album>/
```

---

## API přehled

### Auth
| Metoda | Endpoint       | Popis                     |
|--------|----------------|---------------------------|
| POST   | /api/auth/login| přihlášení → JWT token    |

### Photos
| Metoda | Endpoint              | Auth | Popis                                      |
|--------|-----------------------|------|--------------------------------------------|
| GET    | /api/photos           | —    | seznam fotek (volitelně ?album=slug)        |
| GET    | /api/photos/edits     | ✓    | záznamy editovaných fotek                  |
| POST   | /api/photos/replace   | ✓    | uložení editované fotky + záloha originálu |
| POST   | /api/photos/revert    | ✓    | obnovení originálu fotky                   |
| PUT    | /api/photos/order     | ✓    | uložení pořadí fotek v albu                |
| PATCH  | /api/photos           | ✓    | přesunutí fotky do jiného alba             |
| DELETE | /api/photos           | ✓    | smazání fotky                              |

### Albums
| Metoda | Endpoint                   | Auth | Popis                   |
|--------|----------------------------|------|-------------------------|
| GET    | /api/albums                | —    | seznam alb              |
| POST   | /api/albums                | ✓    | vytvoření alba (složky) |
| PATCH  | /api/albums/:folder        | ✓    | přejmenování alba       |
| DELETE | /api/albums/:folder        | ✓    | smazání alba + fotek    |
| PUT    | /api/albums/order          | ✓    | uložení pořadí alb      |

### Settings
| Metoda | Endpoint       | Auth | Popis                           |
|--------|----------------|------|---------------------------------|
| GET    | /api/settings  | —    | cover foto, overlay opacity     |
| PATCH  | /api/settings  | ✓    | update nastavení                |

### Upload / Webprojects / Contact
| Metoda | Endpoint             | Auth | Popis                     |
|--------|----------------------|------|---------------------------|
| POST   | /api/upload          | ✓    | nahrání fotek do alba     |
| GET    | /api/webprojects     | —    | seznam webových projektů  |
| POST   | /api/webprojects     | ✓    | přidání projektu          |
| PATCH  | /api/webprojects/:id | ✓    | úprava projektu           |
| DELETE | /api/webprojects/:id | ✓    | smazání projektu          |
| POST   | /api/contact         | —    | kontaktní formulář        |

---

## Klíčové datové toky

### Generování náhledů
- `sharp(src).rotate()` — automaticky aplikuje EXIF orientaci (bez toho by fotky pořízené na výšku mohly být zobrazeny naležato)
- Resize max 1920×1920, JPEG quality 72, vodoznak „© TOMAN PHOTOGRAPHY"

### Editace fotky
1. Admin otevře PhotoEditor → pokud existuje originál (`photo-edits.json`), načte se `/originals/<filename>` + uložené params (zoom, náklon, ratio)
2. Po uložení: `POST /api/photos/replace` → server zkopíruje originál do `data/originals/` (pouze pokud ještě neexistuje), přepíše aktuální soubor, zapíše params do `photo-edits.json`
3. "Původní": `POST /api/photos/revert` → obnoví ze zálohy, smaže záznam i zálohu

### Statické soubory
- `/uploads/previews/*` → `server/uploads/previews/` (komprimované náhledy s vodoznakem, veřejné)
- `/uploads/*` → `server/uploads/` (originály, URL nejsou v public API, určeno pro admin)
- `/originals/*` → `server/data/originals/` (zálohy originálů, pouze pro editor)

### Album = složka
- Každá podsložka v `uploads/fotky/` je album
- Slug alba = `name.toLowerCase().replace(/\s+/g, '-')`
- Pořadí fotek a alb uloženo v `data/photo-order.json` resp. `data/settings.json`
