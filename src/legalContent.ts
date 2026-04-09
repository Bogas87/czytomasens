export const TERMS = {
  title: "Regulamin",
  body: `§1. Charakter usługi
Serwis CzyToMaSens jest narzędziem technologicznym opartym na algorytmach sztucznej inteligencji (AI), służącym do analizy wzorców zachowań i mechanizmów relacyjnych.

Usługa nie stanowi psychoterapii, porady medycznej ani diagnozy psychiatrycznej. Generowane treści mają charakter informacyjny, edukacyjny i autorefleksyjny.

System może generować treści niedokładne lub niepełne (tzw. halucynacje AI). Użytkownik nie powinien traktować ich jako jedynego źródła decyzji.

§2. Tryb konfrontacji
Użytkownik wybierając tryb „Konfrontacja” wyraża zgodę na bezpośredni, analityczny i krytyczny sposób komunikacji.

Komunikaty systemu odnoszą się wyłącznie do opisanych zachowań i mechanizmów. Nie stanowią oceny osoby, diagnozy klinicznej ani porady terapeutycznej.

§3. Odpowiedzialność
Właściciel serwisu nie ponosi odpowiedzialności za decyzje podjęte przez użytkownika na podstawie wygenerowanych treści.

§4. Sytuacje kryzysowe
Serwis nie jest przeznaczony dla osób w stanie kryzysu psychicznego. W przypadku myśli samobójczych lub zagrożenia zdrowia należy skontaktować się z numerem alarmowym 112 lub specjalistą.`,
};

export const PRIVACY = {
  title: "Polityka prywatności",
  body: `Administrator danych: [UZUPEŁNIJ]

Serwis stosuje zasadę minimalizacji danych.

Nie wymagamy podawania danych osobowych do podstawowego korzystania z analizy.

System może wykorzystywać pseudonimiczny identyfikator techniczny (np. Local Storage ID) w celu:
- rozpoznawania powtarzalnych schematów
- poprawy jakości analizy
- zachowania ciągłości doświadczenia użytkownika

Identyfikator nie służy do ustalenia tożsamości użytkownika w świecie rzeczywistym.

Zapisywane mogą być wyłącznie:
- tagi mechanizmów i schematów
- wynik analizy
- data wizyty
- techniczne informacje niezbędne do działania systemu

Treści rozmów nie są przechowywane długoterminowo dłużej niż jest to konieczne do działania usługi i realizacji płatnego raportu.

Dane mogą być przetwarzane przez zewnętrzne API AI w sposób szyfrowany i wyłącznie w zakresie niezbędnym do wykonania usługi.

W przypadku zakupu raportu płatnego dane transakcyjne mogą być przetwarzane przez operatora płatności zgodnie z jego polityką prywatności.`,
};

export const CONSENTS = [
  "Rozumiem, że system jest narzędziem AI, a nie terapeutą, psychologiem ani lekarzem.",
  "Akceptuję, że analiza może być bezpośrednia, krytyczna i konfrontacyjna.",
  "Przyjmuję do wiadomości, że system może używać pseudonimicznego identyfikatora technicznego w celu rozpoznawania powtarzalnych schematów.",
  "Oświadczam, że nie jestem w stanie kryzysu psychicznego wymagającego natychmiastowej pomocy medycznej.",
];

export const legalContent = {
  terms: TERMS,
  privacy: PRIVACY,
};