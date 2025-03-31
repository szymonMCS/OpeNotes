# OpeNotes

Aplikacja do zarządzania notatkami, która pozwala użytkownikom tworzyć, edytować, usuwać i przeglądać swoje notatki po zalogowaniu. Frontend został zbudowany w React, a backend w Express z bazą danych PostgreSQL. Projekt wspiera logowanie za pomocą emaila i hasła oraz autoryzację przez Google.

## Wymagania wstępne

Przed rozpoczęciem upewnij się, że masz zainstalowane następujące narzędzia:
- [Node.js](https://nodejs.org/) (wersja 18.x lub nowsza zalecana)
- [npm](https://www.npmjs.com/) (zazwyczaj instalowany razem z Node.js)
- [PostgreSQL](https://www.postgresql.org/) (lokalnie lub na serwerze)
- Konto Google Developer (jeśli chcesz używać logowania przez Google)

---

## Instalacja

### 1. Sklonuj repozytorium
```bash
git clone <adres-repozytorium>
cd <nazwa-folderu>
```

### 2. Struktura projektu
Projekt zakłada dwa główne foldery:
- **`frontend`** – aplikacja React (port domyślny: 5173),
- **`backend`** – serwer Express (port domyślny: 3000).

Jeśli foldery nie są rozdzielone, załóż, że cały kod jest w jednym katalogu, ale frontend i backend mają oddzielne pliki `package.json`.

---

### 3. Konfiguracja backendu

#### a) Przejdź do folderu backendu
```bash
cd backend
```

#### b) Zainstaluj pakiety npm
```bash
npm install
```

Wymagane pakiety (automatycznie instalowane przez `npm install`):
- `express`
- `body-parser`
- `pg` (PostgreSQL client)
- `bcrypt`
- `passport`
- `passport-local`
- `passport-google-oauth2`
- `express-session`
- `dotenv`
- `cors`
- `express-rate-limit`

#### c) Skonfiguruj zmienne środowiskowe
Utwórz plik `.env` w folderze `backend` i dodaj następujące zmienne:
```
PG_USER=<twoja-nazwa-użytkownika-postgres>
PG_HOST=localhost
PG_DATABASE=<nazwa-bazy-danych>
PG_PASSWORD=<twoje-hasło-postgres>
PG_PORT=5432
SESSION_SECRET=<losowy-ciąg-znaków-dla-sesji>
GOOGLE_CLIENT_ID=<twój-google-client-id>
GOOGLE_CLIENT_SECRET=<twój-google-client-secret>
```
- Zastąp wartości w `<>` swoimi danymi.
- `SESSION_SECRET` może być dowolnym losowym ciągiem, np. `mojsekret123`.
- `GOOGLE_CLIENT_ID` i `GOOGLE_CLIENT_SECRET` uzyskasz z [Google Cloud Console](https://console.cloud.google.com/) po skonfigurowaniu OAuth 2.0.

#### d) Skonfiguruj bazę danych PostgreSQL
1. Zainstaluj PostgreSQL i uruchom serwer (np. `pgAdmin` lub CLI).
2. Utwórz bazę danych:
   ```sql
   CREATE DATABASE opeNotes;
   ```
3. Połącz się z bazą `opeNotes` i wykonaj poniższe zapytania SQL, aby utworzyć tabele:
   ```sql
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       email VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL
   );

   CREATE TABLE notes (
       noteid SERIAL PRIMARY KEY,
       title VARCHAR(255),
       content TEXT,
       userid INTEGER REFERENCES users(id)
   );
   ```
   - Tabela `users` przechowuje dane użytkowników.
   - Tabela `notes` przechowuje notatki powiązane z użytkownikami przez `userid`.

#### e) Uruchom serwer backendu
```bash
npm start
```
Serwer powinien działać na `http://localhost:3000`.

---

### 4. Konfiguracja frontendu

#### a) Przejdź do folderu frontendu
```bash
cd frontend
```

#### b) Zainstaluj pakiety npm
```bash
npm install
```

Wymagane pakiety (automatycznie instalowane przez `npm install`):
- `react`
- `react-dom`
- `react-router-dom`
- `axios`
- `@mui/material`
- `@mui/icons-material`
- `@fortawesome/react-fontawesome`
- `@fortawesome/free-solid-svg-icons`
- `@fortawesome/free-brands-svg-icons`

#### c) Uruchom aplikację frontendową
```bash
npm run dev
```
Aplikacja powinna działać na `http://localhost:5173` (domyślny port dla Vite, jeśli używasz tego narzędzia).

---

## Uruchomienie projektu

1. Uruchom serwer PostgreSQL (jeśli nie działa automatycznie).
2. Uruchom backend:
   ```bash
   cd backend
   npm start
   ```
3. W osobnym terminalu uruchom frontend:
   ```bash
   cd frontend
   npm run dev
   ```
4. Otwórz przeglądarkę i przejdź na `http://localhost:5173`.

---

## Funkcjonalności

- **Rejestracja i logowanie:** Użytkownicy mogą się rejestrować i logować za pomocą emaila i hasła lub konta Google.
- **Notatki:** Po zalogowaniu możesz dodawać, edytować i usuwać notatki w sekcji `/notebook`.
- **Sesje:** Aplikacja używa sesji do utrzymania stanu zalogowania.

---

## Rozwiązywanie problemów

- **Błąd CORS:** Upewnij się, że `CLIENT_URL` w backendzie (`http://localhost:5173`) zgadza się z adresem frontendu.
- **Błąd bazy danych:** Sprawdź, czy dane w `.env` są poprawne i czy baza danych jest uruchomiona.
- **Logowanie Google nie działa:** Sprawdź, czy poprawnie skonfigurowałeś `GOOGLE_CLIENT_ID` i `GOOGLE_CLIENT_SECRET` oraz czy callback URL (`http://localhost:3000/auth/google/notes`) jest dodany w Google Cloud Console.

---

## Struktura bazy danych

### Tabela `users`
| Kolumna   | Typ          | Opis                  |
|-----------|--------------|-----------------------|
| `id`      | SERIAL       | Unikalne ID użytkownika |
| `email`   | VARCHAR(255) | Email użytkownika     |
| `password`| VARCHAR(255) | Hasło (zahashowane)   |

### Tabela `notes`
| Kolumna   | Typ          | Opis                  |
|-----------|--------------|-----------------------|
| `noteid`  | SERIAL       | Unikalne ID notatki   |
| `title`   | VARCHAR(255) | Tytuł notatki         |
| `content` | TEXT         | Treść notatki         |
| `userid`  | INTEGER      | ID użytkownika (FK)   |

---

## Uwagi

- Jeśli projekt jest w jednym folderze, dostosuj kroki instalacji (np. użyj jednego `npm install` w głównym katalogu).
- Upewnij się, że porty `3000` (backend) i `5173` (frontend) są wolne.
