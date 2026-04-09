# Resend — gotowiec do ustawienia

## Co ustawiasz w panelu Resend

1. Wejdź w Domains
2. Dodaj subdomenę: `mail.czytomasens.pl`
3. Skopiuj rekordy DNS pokazane przez Resend
4. Wklej je do panelu domeny w SEOHost
5. Poczekaj na status Verified

## Gotowy adres nadawcy

```text
CzyToMaSens <raporty@mail.czytomasens.pl>
```

## Co wpisać do Railway

```env
RESEND_API_KEY=re_TUTAJ_WKLEJ_RESEND_API_KEY
RESEND_FROM_EMAIL=CzyToMaSens <raporty@mail.czytomasens.pl>
```

## Ważne

Resend wymaga zweryfikowanej domeny albo subdomeny, żeby wysyłać maile do normalnych odbiorców. Oficjalna dokumentacja zaleca najpierw utworzyć API key, a potem zweryfikować domenę. Resend rekomenduje też używanie subdomeny do wysyłki, np. `updates.twojadomena.com`, żeby oddzielić reputację wysyłkową od głównej domeny. citeturn675745search1turn675745search4
