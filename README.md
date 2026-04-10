# Pincekönyv 🍷

Borgyűjtemény-kezelő app. Adatokat GitHub `wines.json` fájlban tárolja – minden eszközön szinkronizálva.

## Fájlstruktúra
```
borpince/
├── index.html
├── favicon.svg
├── netlify.toml
├── README.md
└── netlify/functions/wines.mjs
```

## Deploy

### 1. GitHub repo
Hozz létre egy **publikus** repót, töltsd fel az összes fájlt.

### 2. GitHub Personal Access Token
GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
→ Generate new token → scope: `repo` → másold el!

### 3. Netlify
app.netlify.com → Add new site → Import from GitHub → válaszd a repót → Deploy

### 4. Környezeti változók (Site configuration → Environment variables)
- `GITHUB_TOKEN` = a 2. lépés tokenje
- `GITHUB_REPO`  = `felhasznalonev/borpince`

Mentés után: Deploys → Trigger deploy → Deploy site

### 5. Első adat
Az első mentéskor a wines.json automatikusan létrejön a repóban.
