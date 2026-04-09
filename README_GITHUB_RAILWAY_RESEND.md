# CzyToMaSens — gotowiec do GitHub, Railway i Resend

## 1. Co wrzucasz na GitHub

Do repo wrzucasz projekt BEZ pliku `.env` i BEZ pliku `database.sqlite`.

Do katalogu głównego dodaj:
- `.gitignore`
- `.env.example`
- `.env.production.example`

## 2. Komendy do pierwszego wrzucenia na GitHub

```bash
git init
git add .
git commit -m "first deploy"
git branch -M main
git remote add origin https://github.com/Bogas87/czytomasens.pl.git
git push -u origin main
```

## 3. Railway — backend

Backend jest zwykłym serwerem Node/Express i startuje komendą:

```bash
npm start
```

W Railway ustaw:
- Root Directory: `server` jeśli backend trzymasz w podfolderze `server`
- Start Command: `npm start`
- Node: 18 lub nowszy

## 4. Zmienne środowiskowe do Railway

Wklej ręcznie dokładnie te klucze:

- `PORT=4000`
- `CLIENT_URL=https://czytomasens.pl`
- `OPENAI_API_KEY=...`
- `OPENAI_MODEL=gpt-4o`
- `STRIPE_SECRET_KEY=sk_live_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...`
- `RESEND_API_KEY=re_...`
- `RESEND_FROM_EMAIL=CzyToMaSens <raporty@mail.czytomasens.pl>`

## 5. Frontend

Obecnie frontend ma twardo wpisane API_BASE na `https://czytomasens.pl`, więc docelowo trzeba to przerobić na zmienną `VITE_API_BASE` i wskazać adres backendu, np. `https://api.czytomasens.pl`.

Przykład dla Vite:

```ts
const API_BASE = import.meta.env.VITE_API_BASE;
```

A w `.env.production.example`:

```env
VITE_API_BASE=https://api.czytomasens.pl
```

## 6. Resend — co ustawiasz

Kod backendu wysyła maila przez Resend i używa pola:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Jeśli `RESEND_FROM_EMAIL` nie będzie ustawiony, backend spróbuje użyć `onboarding@resend.dev`, ale to nie nadaje się do normalnej produkcji. Ustaw własny adres z własnej domeny, np. `raporty@mail.czytomasens.pl`.

## 7. DNS dla Resend

W Resend NIE wrzucasz plików. Tam dodajesz domenę lub subdomenę i kopiujesz rekordy DNS do panelu domeny.

Polecany wariant:
- domena wysyłkowa: `mail.czytomasens.pl`
- adres nadawcy: `raporty@mail.czytomasens.pl`

## 8. Webhook Stripe

W Stripe ustaw webhook na adres backendu:

```text
https://api.czytomasens.pl/api/webhook
```

Po utworzeniu webhooka Stripe pokaże sekret zaczynający się od `whsec_`. Ten sekret wklejasz do Railway jako `STRIPE_WEBHOOK_SECRET`.

## 9. Szybki test po deployu

Sprawdź w przeglądarce:

```text
https://api.czytomasens.pl/api/health
```

Jeśli dostaniesz:

```json
{"ok":true}
```

to backend żyje.

## 10. Najważniejsze

- nie wrzucaj `.env` do GitHuba
- nie wrzucaj `database.sqlite` do GitHuba
- `STRIPE_SECRET_KEY` musi zaczynać się od `sk_`
- `STRIPE_WEBHOOK_SECRET` musi zaczynać się od `whsec_`
- `RESEND_FROM_EMAIL` musi być adresem z domeny zweryfikowanej w Resend
