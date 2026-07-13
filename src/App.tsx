import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArticlesSection, ARTICLES } from "./ArticlesSection";

function readApiBase(): string {
  try {
    const metaEnv = typeof import.meta !== "undefined" ? (import.meta as any)?.env : undefined;
    const value = metaEnv?.VITE_API_BASE;
    if (typeof value === "string" && value.startsWith("http")) return value.replace(/\/$/, "");
  } catch {}
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return "https://czytomasens-production-47e0.up.railway.app"; 
  }
  return "http://localhost:8080";
}

const API_BASE = readApiBase();

const BRAND = {
  gold: "#C5A059",
  goldSoft: "#D7B978",
  text: "#F5F1EA",
  muted: "#A8A099",
  border: "rgba(255,255,255,0.08)",
  panel: "rgba(255,255,255,0.03)",
  panelStrong: "rgba(255,255,255,0.05)",
  danger: "#E2A5A5",
  success: "#B7D1B0",
};

type Stage =
  | "landing"
  | "consent"
  | "entry"
  | "questions"
  | "checkpoint"
  | "interview"
  | "open_text"
  | "preview"
  | "processing"
  | "paid"
  | "crisis"
  | "error";

type EntryKey = "betrayal" | "uncertain" | "stagnation" | "returning" | "triangle" | "loop";
type Option = { id: string; label: string; score: number };
type Question = { id: string; lead: string; text: string; options: Option[] };
type AnswerMap = Record<string, string>;
type LegalKey = "regulamin" | "prywatnosc" | "rodo" | "kontakt" | null;

type EntryConfig = {
  key: EntryKey;
  title: string;
  subtitle: string;
  quote: string;
  intro: string;
  duration: string;
  questions: Question[];
  checkpoint: { title: string; text: string; options: Option[] };
  openPrompt: string;
};

type Preview = {
  chance: number; tension: number; asymmetry: number; change: number;
  badge: string; headline: string; truth: string; mirror: string;
  summary: string; paidTease: string; tone: "red" | "yellow" | "green";
};

type FullReportSection = { title: string; text: string; tone?: "normal" | "gold" | "danger" };
type FullReport = {
  headline?: string; subheadline?: string; previewLine?: string;
  tensionPercent?: number; driftPercent?: number; rebuildPercent?: number;
  sections?: FullReportSection[]; closing?: string;
};

type InterviewExchange = { ai: string; user: string; lead?: string; observation?: string };
type InterviewState = {
  path: EntryKey; currentQuestion: string; currentLead: string;
  currentObservation: string; history: InterviewExchange[];
  depth: number; finished: boolean; exchangeIndex: number;
};

type SessionCreateResponse = { ok?: boolean; token?: string; sessionId?: string };

const STORAGE_KEY = "ctms_premium_front_v9";

const ENTRY_CONFIGS: EntryConfig[] = [
  {
    key: "betrayal",
    title: "Po zdradzie albo kłamstwie",
    subtitle: "Zaufanie można odbudować. Ale nie na udawaniu że wszystko jest okej.",
    quote: `„Mówi że to już za nim. Ale ja nadal sprawdzam telefon."`,
    intro: "Dowiesz się czy to co wróciło to realna zmiana, czy tylko cisza po burzy. I czy zaufanie które masz teraz to zaufanie, czy strach przed kolejną prawdą.",
    duration: "ok. 7 minut",
    questions: [
      { id: "b1", lead: "Przeprosiny to słowa. Odpowiedzialność to zachowanie.", text: "Czy ta osoba wzięła realną odpowiedzialność – nie tylko przeprosiła, ale zmieniła coś konkretnego w tym co robi na co dzień?", options: [{ id: "a", label: "Głównie słowa. W zachowaniu nic się nie zmieniło.", score: 3 }, { id: "b", label: "Zmieniła się, ale tylko gdy czuje że patrzę.", score: 2 }, { id: "c", label: "Stara się, widać wysiłek, choć nie zawsze skuteczny.", score: 1 }, { id: "d", label: "Tak. Zmiana jest widoczna i trwała.", score: 0 }] },
      { id: "b2", lead: "Żyć w ciągłym trybie sprawdzania to nie ostrożność. To wyrok.", text: "Czy dziś masz w głowie stały monitoring (telefon, godziny, spójność historii) i to stało się Twoim normalem?", options: [{ id: "a", label: "Tak. Nie umiem już inaczej i to mnie wyczerpuje.", score: 3 }, { id: "b", label: "Wpadam w to regularnie, choć walczę z tym.", score: 2 }, { id: "c", label: "Zdarza się rzadko, przy konkretnych sytuacjach.", score: 1 }, { id: "d", label: "Nie. Nie czuję już tej potrzeby.", score: 0 }] },
      { id: "b3", lead: "To jak ktoś reaguje gdy wracasz do bólu, mówi wszystko o tym czy naprawdę zrozumiał.", text: "Kiedy wracasz do tego co się stało, ta osoba jest cierpliwa i obecna, czy daje Ci do zrozumienia że już za długo to ciągniesz?", options: [{ id: "a", label: "Ucina temat, irytuje się albo mówi żebym przestał.", score: 3 }, { id: "b", label: "Słucha, ale czuję że ma tego dość.", score: 2 }, { id: "c", label: "Słucha, choć widać że to dla niej trudne.", score: 1 }, { id: "d", label: "Jest przy mnie. Cierpliwa. Nie spieszy się.", score: 0 }] },
      { id: "b4", lead: "Jest jedno pytanie którego się boisz zadać wprost.", text: "Gdybyś zapytał dziś tej osoby: „Czy mam się bać że to się powtórzy?”, byłbyś w stanie uwierzyć w odpowiedź?", options: [{ id: "a", label: "Nie. I to mówi mi więcej niż cokolwiek.", score: 3 }, { id: "b", label: "Chciałbym wierzyć, ale coś we mnie blokuje.", score: 2 }, { id: "c", label: "Częściowo. Wierzę, ale z rezerwą.", score: 1 }, { id: "d", label: "Tak. Uwierzyłbym bez wahania.", score: 0 }] },
      { id: "b5", lead: "Intymność po zdradzie to jeden z najtrudniejszych testów.", text: "Jak wygląda między Wami bliskość fizyczna i emocjonalna od kiedy to się stało?", options: [{ id: "a", label: "Jest dystans. Trudno mi być blisko jak wcześniej.", score: 3 }, { id: "b", label: "Bywa różnie, raz lepiej, raz gorzej.", score: 2 }, { id: "c", label: "Powoli wracamy, czuję że próbujemy.", score: 1 }, { id: "d", label: "Jest bliskość. Może nawet głębsza niż przed.", score: 0 }] },
      { id: "b6", lead: "Tajemnice które zostały, mówią tyle samo co ta która wyszła.", text: "Czy masz poczucie że wiesz wszystko co chciałeś wiedzieć, czy są wciąż rzeczy których się boisz zapytać?", options: [{ id: "a", label: "Czuję że czegoś nie wiem i boję się zapytać.", score: 3 }, { id: "b", label: "Pytałem, ale odpowiedzi mnie nie przekonały.", score: 2 }, { id: "c", label: "Dowiedziałem się wystarczająco, choć nie wszystkiego.", score: 1 }, { id: "d", label: "Wiem co chciałem wiedzieć. Nie mam poczucia ukrywania.", score: 0 }] },
      { id: "b7", lead: "Wybaczenie to nie amnezja. Wybaczenie to decyzja co z tym zrobić.", text: "Jak dziś naprawdę czujesz się wobec tego co się stało – wybaczasz, tolerujesz, czy jeszcze nie wiesz?", options: [{ id: "a", label: "Nie wybaczyłem/am. I nie wiem czy potrafię.", score: 3 }, { id: "b", label: "Staram się, ale złość i ból wracają.", score: 2 }, { id: "c", label: "W dużej miary wybaczyłem/am, ale nie zapomniałem/am.", score: 1 }, { id: "d", label: "Wybaczyłem/am. Naprawdę.", score: 0 }] },
      { id: "b8", lead: "Co byś odpowiedział szczerze, nie co powinieneś odpowiedzieć.", text: "Gdybyś miał ocenić szanse tej relacji, co pierwsze przyszłoby Ci do głowy, zanim zaczniesz to racjonalizować?", options: [{ id: "a", label: "Głęboko w sobie nie wierzę że to ma szansę.", score: 3 }, { id: "b", label: "Połowa na połowę. Naprawdę nie wiem.", score: 2 }, { id: "c", label: "Trudne, ale wierzę że możliwe.", score: 1 }, { id: "d", label: "Naprawdę wierzę że damy radę.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Co dziś bardziej trzyma Cię przy tej osobie – poczucie że naprawdę odbudowujecie coś realnego, czy strach że jak odejdziesz, ta historia nie będzie miała sensu?", options: [{ id: "a", label: "Bardziej strach że historia nie miałaby sensu.", score: 3 }, { id: "b", label: "Obie rzeczy, trudno to rozdzielić.", score: 2 }, { id: "c", label: "Uczucie jest realne, choć sytuacja trudna.", score: 1 }, { id: "d", label: "Odbudowujemy coś realnego. To czuję.", score: 0 }] },
    openPrompt: "Co dokładnie pękło i po czym dziś poznajesz, że zaufanie wróciło albo wróciło tylko pozornie?",
  },
  {
    key: "uncertain",
    title: "Nie wiem na czym stoję",
    subtitle: "Niepewność która trwa miesiącami rzadko jest przypadkowa.",
    quote: `„Nie wiem czy jesteśmy razem. Nie wiem czy nie jesteśmy. On też chyba nie wie."`,
    intro: "Dowiesz się czy ta niepewność wynika z sytuacji, czy z tego, że ktoś świadomie nie daje Ci jasności, bo mu to odpowiada.",
    duration: "ok. 7 minut",
    questions: [
      { id: "u1", lead: "Kiedy ktoś chce, mówi wprost. Reszta to wymówki.", text: "Czy ta osoba konkretnie i wprost określiła czym dla niej jesteście, czy raczej temat jakoś zawsze się rozmywa?", options: [{ id: "a", label: "Rozmywa się albo w ogóle nie poruszamy tego tematu.", score: 3 }, { id: "b", label: "Coś mówi, ale nieprecyzyjnie.", score: 2 }, { id: "c", label: "Mówiła, ale słowa nie zgadzają się z zachowaniem.", score: 1 }, { id: "d", label: "Tak, jest jasność co do tego co jest między nami.", score: 0 }] },
      { id: "u2", lead: "Zaangażowanie widać wtedy gdy Ty nic nie robisz.", text: "Jak wygląda kontakt gdy to nie Ty piszesz pierwszy, nie Ty proponujesz, nie Ty inicjujesz?", options: [{ id: "a", label: "Prawie nic się nie dzieje. To ja napędzam wszystko.", score: 3 }, { id: "b", label: "Coś się pojawia, ale rzadziej i jakby z obowiązku.", score: 2 }, { id: "c", label: "Inicjuje, choć nieregularnie.", score: 1 }, { id: "d", label: "Sama inicjuje. Regularnie i naturalnie.", score: 0 }] },
      { id: "u3", lead: "Uwaga która pojawia się gdy zaczynasz się wycofywać, to nie uczucie. To refleks.", text: "Czy ta osoba staje się bardziej obecna i zaangażowana dokładnie wtedy, gdy wyczuje że możesz odejść?", options: [{ id: "a", label: "Tak. Wtedy wszystko wraca, a potem znowu znika.", score: 3 }, { id: "b", label: "Chyba tak, choć nie chcę w to wierzyć.", score: 2 }, { id: "c", label: "Może trochę, ale nie widzę wyraźnego wzorca.", score: 1 }, { id: "d", label: "Nie. Poziom zaangażowania jest mniej więcej stały.", score: 0 }] },
      { id: "u4", lead: "Zrób ten eksperyment w głowie – odpowiedz szybko.", text: "Gdybyś przez dwa tygodnie przestał pisać pierwszy i nie odzywał się wcale, co by się stało z kontaktem?", options: [{ id: "a", label: "Prawdopodobnie zamarłby całkowicie.", score: 3 }, { id: "b", label: "Odezwałaby się, ale nie wiem kiedy ani po co.", score: 2 }, { id: "c", label: "Odezwałaby się, choć pewnie nie od razu.", score: 1 }, { id: "d", label: "Odezwałaby się szybko. Jestem pewien.", score: 0 }] },
      { id: "u5", lead: "Plany to deklaracje intencji. Realizacja to prawda.", text: "Czy ta osoba pojawiła się w Twoich planach i Ty w jej – konkretnych, nie mglistych?", options: [{ id: "a", label: "Nie. Plany to u nas abstrakcja.", score: 3 }, { id: "b", label: "Rzadko. I zwykle to ja proponuję.", score: 2 }, { id: "c", label: "Czasem. Ale nie jest to naturalne.", score: 1 }, { id: "d", label: "Tak. Jesteśmy w swoich planach.", score: 0 }] },
      { id: "u6", lead: "Jak traktujesz siebie w tej relacji, to też jest informacja.", text: "Czy czekanie na jasność z jej strony sprawiło że zacząłeś/aś dostosowywać się, tłumaczyć jej zachowanie albo zaniżać swoje oczekiwania?", options: [{ id: "a", label: "Tak. Schodzę coraz niżej żeby pasować do tej sytuacji.", score: 3 }, { id: "b", label: "Trochę. Racjonalizuję bardziej niż powinienem.", score: 2 }, { id: "c", label: "Staram się nie, ale to trudne.", score: 1 }, { id: "d", label: "Nie. Pozostałem przy swoim.", score: 0 }] },
      { id: "u7", lead: "Jest granica między cierpliwością a czekaniem bez powodu.", text: "Jak długo trwa ta niepewność i czy w tym czasie sytuacja się jakoś zmienia, czy stoi w miejscu?", options: [{ id: "a", label: "Długo. Miesiące. I nic się nie zmienia.", score: 3 }, { id: "b", label: "Trochę trwa, bywa lepiej i gorzej bez kierunku.", score: 2 }, { id: "c", label: "Jakiś czas, ale widzę powolny ruch.", score: 1 }, { id: "d", label: "Stosunkowo krótko. Jesteśmy w procesie.", score: 0 }] },
      { id: "u8", lead: "Jedna uczciwa odpowiedź.", text: "Co naprawdę chcesz usłyszeć i dlaczego jeszcze tego nie zapytałeś/aś wprost?", options: [{ id: "a", label: "Boję się odpowiedzi. Wolę nie wiedzieć.", score: 3 }, { id: "b", label: "Pytałem/am, ale odpowiedź była wymijająca.", score: 2 }, { id: "c", label: "Pytałem/am, ale nie wiem czy usłyszałem/am prawdę.", score: 1 }, { id: "d", label: "Zapytałem/am i dostałem/am jasną odpowiedź.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Gdybyś wyjął z równania tęsknotę, przyzwyczajenie i lęk przed samotnością, czy nadal chciałbyś tej konkretnej osoby?", options: [{ id: "a", label: "Szczerze? Chyba nie. To bardziej uzależnienie niż wybór.", score: 3 }, { id: "b", label: "Myślę że tak, ale nie jestem pewien.", score: 2 }, { id: "c", label: "Tak, choć mam wątpliwości których nie chcę ignorować.", score: 1 }, { id: "d", label: "Tak. Niezależnie od tych wszystkich rzeczy.", score: 0 }] },
    openPrompt: "Co konkretnie od miesięcy nie daje Ci jasności i dlaczego mimo tego wciąż jesteś w tym miejscu?",
  },
  {
    key: "stagnation",
    title: "To trwa, ale czegoś już w tym nie ma",
    subtitle: "Brak awantur to nie dowód spokoju. Czasem dowód że już o nic nie ma sensu się kłócić.",
    quote: `„Wszystko jest okej. I właśnie to mnie przeraża."`,
    intro: "Dowiesz się czy jesteście w spokojnej fazie po trudnym czasie, czy po prostu oboje przestaliście już czegokolwiek oczekiwać.",
    duration: "ok. 7 minut",
    questions: [
      { id: "s1", lead: "Samotność w związku boli inaczej niż samotność po rozstaniu.", text: "Czy coraz częściej jesteście razem fizycznie, ale czujesz że naprawdę jesteś sam?", options: [{ id: "a", label: "Tak. I to stało się moim normalem.", score: 3 }, { id: "b", label: "Często, szczególnie przy ważnych tematach.", score: 2 }, { id: "c", label: "Czasem. Nie jest to regułą.", score: 1 }, { id: "d", label: "Nie. Czuję jej obecność i kontakt.", score: 0 }] },
      { id: "s2", lead: "Kiedy ostatnio ta osoba zrobiła coś dla Was z własnej inicjatywy, bez podpowiedzi?", text: "Czy masz poczucie że to głównie Ty trzymasz tę relację przy życiu – emocjami, inicjatywą, podtrzymywaniem atmosfery?", options: [{ id: "a", label: "Tak. Bez mojego wysiłku to by już padło.", score: 3 }, { id: "b", label: "Zdecydowanie ja więcej, ona mało.", score: 2 }, { id: "c", label: "Trochę nierówno, ale oboje coś wnosimy.", score: 1 }, { id: "d", label: "Jest obustronne. Oboje się staramy.", score: 0 }] },
      { id: "s3", lead: "Kiedy myśl o odejściu przestaje przerażać, to jest sygnał.", text: "Czy myśl o zakończeniu tej relacji jest coraz mniej przerażająca, a coraz bardziej... ulżyłoby?", options: [{ id: "a", label: "Tak. Coraz częściej myślę o uldze niż o stracie.", score: 3 }, { id: "b", label: "Pojawia się, przeraża i przyciąga naraz.", score: 2 }, { id: "c", label: "Pojawia się rzadko. Nie dominuje.", score: 1 }, { id: "d", label: "Nie. Ta myśl nadal mnie naprawdę przeraża.", score: 0 }] },
      { id: "s4", lead: "Odpowiedz zanim zdążysz to przemyśleć.", text: "Gdybyś jutro dowiedział się że ta osoba odchodzi, pierwsza emocja to byłby ból czy ulga?", options: [{ id: "a", label: "Ulga. Może też ból, ale ulga byłaby pierwsza.", score: 3 }, { id: "b", label: "Nie wiem. Pewnie jedno i drugie naraz.", score: 2 }, { id: "c", label: "Ból, choć może też trochę ulgi.", score: 1 }, { id: "d", label: "Ból. Zdecydowanie i tylko ból.", score: 0 }] },
      { id: "s5", lead: "Kiedy ostatnio rozmawialiście o czymś ważnym, naprawdę.", text: "Czy macie ze sobą rozmowy które coś znaczą – o Was, o przyszłości, o tym co czujecie?", options: [{ id: "a", label: "Głównie logistyka. Rozmów które coś znaczą prawie nie ma.", score: 3 }, { id: "b", label: "Czasem, ale rzadziej niż kiedyś i trudniej.", score: 2 }, { id: "c", label: "Bywa, choć nie tak często jak bym chciał.", score: 1 }, { id: "d", label: "Tak. Rozmawiamy o tym co ważne.", score: 0 }] },
      { id: "s6", lead: "Wspólne chwile mówią więcej niż deklaracje.", text: "Czy jest coś co robicie razem i oboje naprawdę tego chcecie – coś co nie jest obowiązkiem?", options: [{ id: "a", label: "Trudno mi cokolwiek wymienić.", score: 3 }, { id: "b", label: "Było, ale dawno. Teraz głównie rutyna.", score: 2 }, { id: "c", label: "Jedna, dwie rzeczy, ale to za mało.", score: 1 }, { id: "d", label: "Tak. Mamy wspólne rzeczy które lubimy.", score: 0 }] },
      { id: "s7", lead: "To pytanie boli bardziej niż inne.", text: "Czy pamiętasz kiedy ostatnio naprawdę się cieszyłeś na spotkanie z tą osobą?", options: [{ id: "a", label: "Nie pamiętam. Już tego nie czuję.", score: 3 }, { id: "b", label: "Dawno temu. Teraz jest głównie zwyczaj.", score: 2 }, { id: "c", label: "Zdarza się, rzadziej niż kiedyś.", score: 1 }, { id: "d", label: "Tak. Cieszę się na nią.", score: 0 }] },
      { id: "s8", lead: "Rozmawialiście kiedyś o tym co czujecie?", text: "Czy ta osoba wie że coś między Wami zgasło – powiedziałeś jej to, czy niesiesz to sam?", options: [{ id: "a", label: "Nie wie. Noszę to sam i nie wiem jak zacząć.", score: 3 }, { id: "b", label: "Próbowałem powiedzieć, ale nie dotarło.", score: 2 }, { id: "c", label: "Wie, ale jej reakcja mnie nie przekonała.", score: 1 }, { id: "d", label: "Rozmawialiśmy o tym. Oboje to czujemy.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Co konkretnie chciałbyś żeby wróciło między Wami i czy ta osoba w ogóle wie o tym i robi cokolwiek żeby to zmienić?", options: [{ id: "a", label: "Wie albo powinna wiedzieć, i nic nie robi.", score: 3 }, { id: "b", label: "Coś próbuje, ale za mało i za rzadko.", score: 2 }, { id: "c", label: "Stara się, nie wiem czy wystarczająco.", score: 1 }, { id: "d", label: "Tak. Naprawdę razem nad tym pracujemy.", score: 0 }] },
    openPrompt: "Co dokładnie zniknęło między Wami i kiedy przestałeś wierzyć że samo wróci?",
  },
  {
    key: "returning",
    title: "Rozstaliśmy się i nie wiem czy wracać",
    subtitle: "Tęsknota potrafi udawać miłość. Lęk przed samotnością potrafi udawać sens.",
    quote: `„Wiem że nie powinnam. Ale cały czas o nim myślę."`,
    intro: "Dowiesz się czy chcesz tej konkretnej osoby, czy chcesz żeby pewien rozdział w końcu miał dobre zakończenie.",
    duration: "ok. 7 minut",
    questions: [
      { id: "r1", lead: "Tęsknić można za człowiekiem. Tęsknić można za poczuciem że się jest potrzebnym.", text: "Gdy wyobrażasz sobie powrót, co konkretnie widzisz? Tę osobę, czy koniec zawieszenia i samotności?", options: [{ id: "a", label: "Szczerość mówi: bardziej koniec tego stanu niż tę osobę.", score: 3 }, { id: "b", label: "Trudno to rozdzielić. Jedno z drugim.", score: 2 }, { id: "c", label: "Widzę tę osobę, choć tęsknota za normalnością też jest.", score: 1 }, { id: "d", label: "Widzę tę konkretną osobę. Nie ulgę.", score: 0 }] },
      { id: "r2", lead: "Powód rozstania to prawda o relacji. Tęsknota go nie usuwa.", text: "To przez co się rozstaliście – czy to był jednorazowy kryzys, czy wzorzec który wracał od dawna?", options: [{ id: "a", label: "Wzorzec. Wracał wielokrotnie pod różnymi nazwami.", score: 3 }, { id: "b", label: "Trochę jednego i drugiego, nie wiem jak to nazwać.", score: 2 }, { id: "c", label: "Był wzorzec, ale myślę że rozumiemy już dlaczego.", score: 1 }, { id: "d", label: "Jednorazowy kryzys albo okoliczności zewnętrzne.", score: 0 }] },
      { id: "r3", lead: "Odległość filtruje wspomnienia. Przepuszcza to co przyjemne.", text: "Gdy myślisz o tej osobie teraz, widzisz całość jasno, czy złe jest rozmyte a dobre wyostrzone?", options: [{ id: "a", label: "Głównie dobre. Złe jakoś samo się tłumaczy.", score: 3 }, { id: "b", label: "Widzę jedno i drugie, ale nierówno.", score: 2 }, { id: "c", label: "Staram się widzieć całość, choć to trudne.", score: 1 }, { id: "d", label: "Widzę całość. Włącznie z tym co bolało.", score: 0 }] },
      { id: "r4", lead: "Przed powrotem jest jedno kluczowe pytanie.", text: "Czy wiesz co konkretnie musiałoby się zmienić żeby powrót miał sens i czy ta osoba wie to samo i jest gotowa?", options: [{ id: "a", label: "Nie wiem. Albo wiem, ale ta osoba nie.", score: 3 }, { id: "b", label: "Mam jakiś obraz, ale nie rozmawialiśmy o tym wprost.", score: 2 }, { id: "c", label: "Rozmawialiśmy, ale nie wiem czy jesteśmy zgodni.", score: 1 }, { id: "d", label: "Oboje wiemy co i oboje jesteśmy gotowi na zmianę.", score: 0 }] },
      { id: "r5", lead: "Uczucia nie kłamią. Interpretacja, owszem.", text: "Czy tęsknota którą czujesz jest stała i spokojna, czy intensywna szczególnie gdy jesteś sam, w nocy, albo gdy coś boli?", options: [{ id: "a", label: "Intensywna szczególnie gdy jestem sam i jest źle.", score: 3 }, { id: "b", label: "Różna. Bywa spokojna i bywa intensywna.", score: 2 }, { id: "c", label: "Raczej stała, nie tylko w trudnych momentach.", score: 1 }, { id: "d", label: "Spokojna i stała. Nie napędzana bólem.", score: 0 }] },
      { id: "r6", lead: "Co mówisz sobie o tej osobie kiedy nikt nie słyszy.", text: "Gdybyś miał opisać tę osobę komuś bliskiemu, powiedziałbyś o niej dobrze, uczciwie, czy ostrożnie?", options: [{ id: "a", label: "Ostrożnie. Wiem że bliscy mają wątpliwości.", score: 3 }, { id: "b", label: "Mieszanie, bo sam mam mieszane uczucia.", score: 2 }, { id: "c", label: "Uczciwie, z dobrymi i złymi stronami.", score: 1 }, { id: "d", label: "Dobrze i bez zastrzeżeń.", score: 0 }] },
      { id: "r7", lead: "Wyobraź sobie że za rok nic się nie zmieni.", text: "Gdybyś za rok był dokładnie w tym samym miejscu – tęskniący, niepewny, bez odpowiedzi – czy to jest wersja życia którą akceptujesz?", options: [{ id: "a", label: "Nie. Ale nie wiem jak z tego wyjść.", score: 3 }, { id: "b", label: "Nie chcę tego, ale nie jestem gotowy się zatrzymać.", score: 2 }, { id: "c", label: "Nie. Dlatego chcę to rozwiązać – w jedną lub drugą stronę.", score: 1 }, { id: "d", label: "Nie. I dlatego działam.", score: 0 }] },
      { id: "r8", lead: "Ostatnie pytanie tego bloku.", text: "Czy ta osoba wie że o tym myślisz – o powrocie – i jaka jest jej reakcja?", options: [{ id: "a", label: "Nie wie. Albo wie i nie reaguje.", score: 3 }, { id: "b", label: "Wie, ale jej odpowiedź jest nieokreślona.", score: 2 }, { id: "c", label: "Rozmawialiśmy, nie mamy jeszcze jasności.", score: 1 }, { id: "d", label: "Wie i jest otwarta na rozmowę.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Gdybyś wiedział że ta osoba już ułożyła sobie życie z kimś innym i nie wróci, jak długo zajęłoby Ci dojście do siebie?", options: [{ id: "a", label: "Długo. Bardzo długo. To by mnie złamało.", score: 3 }, { id: "b", label: "Byłoby bardzo ciężko. Nie wiem czy dałbym radę.", score: 2 }, { id: "c", label: "Ciężko, ale bym przez to przeszedł w końcu.", score: 1 }, { id: "d", label: "Byłoby smutno. Ale przyjąłbym to i szedł dalej.", score: 0 }] },
    openPrompt: "Co naprawdę trzyma Cię przy myśleniu o powrocie i czego się boisz jeśli nie wrócisz?",
  },
  {
    key: "triangle",
    title: "Jest ktoś trzeci",
    subtitle: "Nowa osoba obnaża to czego nie było, albo daje pretekst do ucieczki. Z zewnątrz wygląda tak samo.",
    quote: `„Nie wiem czy ją kocham czy tylko uciekam. I nie wiem od czego."`,
    intro: "Dowiesz się czy ta trzecia osoba jest odpowiedzią na coś realnego, czy pytaniem które zadajesz sobie od dawna i szukasz dla niego gotowej nazwy.",
    duration: "ok. 7 minut",
    questions: [
      { id: "t1", lead: "Gdyby w obecnej relacji było naprawdę dobrze, ta osoba by się tak nie pojawiła.", text: "Czy pojawienie się kogoś trzeciego odsłoniło coś czego Ci w obecnej relacji brakowało od dawna?", options: [{ id: "a", label: "Tak. I teraz nie mogę tego nie widzieć.", score: 3 }, { id: "b", label: "Chyba tak, ale nie wiem czy bezpośrednio związane.", score: 2 }, { id: "c", label: "Może trochę, ale nie chcę tak tego widzieć.", score: 1 }, { id: "d", label: "Nie. To osobna historia. W relacji jest dobrze.", score: 0 }] },
      { id: "t2", lead: "Nowa osoba to jeszcze nie człowiek. To wyobrażenie.", text: "Czy znasz tę osobę w realu – w konflikcie, zmęczeniu, codzienności – czy tylko w jej najlepszym wydaniu?", options: [{ id: "a", label: "Wyłącznie w najlepszym. Bez żadnej codzienności.", score: 3 }, { id: "b", label: "Głównie od dobrej strony, codzienność jest minimalna.", score: 2 }, { id: "c", label: "Trochę jedno i drugie, poznaję ją powoli.", score: 1 }, { id: "d", label: "Znam ją realnie. Nie tylko od dobrej strony.", score: 0 }] },
      { id: "t3", lead: "Pierwsza myśl. Zanim zdążysz ją poprawić.", text: "Gdyby ta trzecia osoba zniknęła z Twojego życia całkowicie, jak byś się poczuł?", options: [{ id: "a", label: "Bardzo źle. Trudno to sobie wyobrazić.", score: 3 }, { id: "b", label: "Ciężko, ale w końcu bym sobie poradził.", score: 2 }, { id: "c", label: "Smutno, ale wiem że to by minęło.", score: 1 }, { id: "d", label: "Dobrze. Wiem że to bardziej fascynacja.", score: 0 }] },
      { id: "t4", lead: "Zawieszenie jest wygodne – odraczasz decyzję nie podejmując jej.", text: "Czy dziś bardziej działasz – robisz coś z którąś z tych sytuacji – czy trwasz i odkładasz?", options: [{ id: "a", label: "Trwam. Odkładam. Czekam aż coś się samo rozstrzygnie.", score: 3 }, { id: "b", label: "Próbuję coś rozumieć, ale bez realnego działania.", score: 2 }, { id: "c", label: "Staram się działać, choć nie wiem od czego zacząć.", score: 1 }, { id: "d", label: "Działam. Podjąłem lub podejmuję decyzję.", score: 0 }] },
      { id: "t5", lead: "Porównania mówią więcej niż deklaracje.", text: "Czy porównujesz te dwie osoby i co konkretnie wychodzi z tych porównań?", options: [{ id: "a", label: "Porównuję ciągle. Ta trzecia wypada lepiej prawie zawsze.", score: 3 }, { id: "b", label: "Porównuję, ale nie wiem który obraz jest prawdziwy.", score: 2 }, { id: "c", label: "Próbuję nie porównywać, bo to nieuczciwe.", score: 1 }, { id: "d", label: "Nie porównuję. To dla mnie zupełnie różne sprawy.", score: 0 }] },
      { id: "t6", lead: "Co robi ta osoba z Twoją głową na co dzień.", text: "Jak dużo czasu dziennie myślisz o tej trzeciej osobie i czy to Ci przeszkadza?", options: [{ id: "a", label: "Bardzo dużo. Zajmuje mi głowę przez większość dnia.", score: 3 }, { id: "b", label: "Sporo, szczególnie gdy jestem sam.", score: 2 }, { id: "c", label: "Czasem. Nie dominuje ale jest.", score: 1 }, { id: "d", label: "Rzadko. To nie jest obsesja.", score: 0 }] },
      { id: "t7", lead: "Obecna relacja zasługuje na uczciwe pytanie.", text: "Czy rozmawiałeś ze swoją obecną osobą o tym że coś między Wami nie gra – bez wspominania o kimś trzecim?", options: [{ id: "a", label: "Nie. Noszę to sam i nie potrafię zacząć.", score: 3 }, { id: "b", label: "Próbowałem, ale to nie było szczere.", score: 2 }, { id: "c", label: "Tak, ale bez efektu.", score: 1 }, { id: "d", label: "Tak. Rozmawiamy o tym co się dzieje między nami.", score: 0 }] },
      { id: "t8", lead: "Na koniec, uczciwie.", text: "Gdybyś musiał dziś podjąć decyzję – zostać w obecnej relacji albo z niej wyjść – co byś wybrał?", options: [{ id: "a", label: "Chciałbym wyjść. Ale się boję.", score: 3 }, { id: "b", label: "Nie wiem. Naprawdę nie wiem.", score: 2 }, { id: "c", label: "Chciałbym zostać i naprawić to co nie gra.", score: 1 }, { id: "d", label: "Zostać. Ta relacja jest dla mnie ważna.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Gdyby tamta trzecia osoba nigdy nie pojawiła się w Twoim życiu, czy dziś byłbyś zadowolony z obecnej relacji?", options: [{ id: "a", label: "Nie. Problem by i tak istniał.", score: 3 }, { id: "b", label: "Nie wiem. Chyba byłoby ciężko.", score: 2 }, { id: "c", label: "Może, ale to trudne pytanie.", score: 1 }, { id: "d", label: "Tak. Byłoby dobrze.", score: 0 }] },
    openPrompt: "Co ta trzecia osoba daje Ci, albo obiecuje że da, czego nie masz w obecnej relacji?",
  },
  {
    key: "loop",
    title: "Wracamy do siebie w kółko",
    subtitle: "Odchodzicie. Wracacie. I za każdym razem mówisz sobie że tym razem będzie inaczej.",
    quote: `„Rozstajemy się od trzech lat. Nigdy nie wychodzi nam to na stałe."`,
    intro: "Dowiesz się czy to co Was trzyma razem to miłość, czy mechanizm napięcie-ulga, który wygląda jak miłość ale nią nie jest.",
    duration: "ok. 7 minut",
    questions: [
      { id: "l1", lead: "Jest pytanie które warto zadać sobie uczciwie.", text: "Czy najsilniejsze uczucie do tej osoby pojawia się głównie wtedy gdy coś się sypie, ktoś odchodzi albo jest ryzyko utraty?", options: [{ id: "a", label: "Tak. Wtedy jest najmocniej. W spokoju jakoś mdło.", score: 3 }, { id: "b", label: "Częściej tak niż nie, choć nie zawsze.", score: 2 }, { id: "c", label: "Zdarza się, ale intensywność jest też w spokojnych momentach.", score: 1 }, { id: "d", label: "Nie. Bliskość nie zależy u nas od napięcia.", score: 0 }] },
      { id: "l2", lead: "Policz ile razy obiecywałeś sobie że tym razem będzie inaczej.", text: "Po poprzednich powrotach, czy pojawiły się konkretne zmiany w zachowaniu które utrzymały się dłużej niż miesiąc?", options: [{ id: "a", label: "Nie. Za każdym razem wracamy do dokładnie tego samego.", score: 3 }, { id: "b", label: "Coś się zmieniało, ale nie na długo.", score: 2 }, { id: "c", label: "Są zmiany, choć nie wiem czy trwałe.", score: 1 }, { id: "d", label: "Tak. Były realne i trwałe zmiany.", score: 0 }] },
      { id: "l3", lead: "To jest pytanie które boli, bo odpowiedź już znasz.", text: "Gdybyś wyjął z tej relacji napięcie, pojednania i intensywność emocjonalną, co by zostało?", options: [{ id: "a", label: "Niewiele. Albo pustka.", score: 3 }, { id: "b", label: "Coś by zostało, ale nie wiem ile i czy wystarczy.", score: 2 }, { id: "c", label: "Zostałoby sporo, napięcie to nie wszystko.", score: 1 }, { id: "d", label: "Dużo. Naprawdę lubimy ze sobą być.", score: 0 }] },
      { id: "l4", lead: "Nikt tego za Ciebie nie nazwie. Powiedz to wprost.", text: "Czy boisz się odejść nie dlatego że Ci jej brakuje, ale dlatego że nie wiesz kim jesteś bez tego cyklu?", options: [{ id: "a", label: "To uderza za mocno żeby zaprzeczyć.", score: 3 }, { id: "b", label: "Może trochę, ale to nie jedyny powód.", score: 2 }, { id: "c", label: "Trochę, ale głównie mi jej brakuje.", score: 1 }, { id: "d", label: "Nie. Boję się bo mi jej brakuje, nie dlatego.", score: 0 }] },
      { id: "l5", lead: "Schemat ma swój rytm. Opisz go.", text: "Jak wygląda typowy cykl między Wami – od kryzysu do pojednania do kolejnego kryzysu?", options: [{ id: "a", label: "Bardzo regularny. Wiem już kiedy zacznie się kolejny.", score: 3 }, { id: "b", label: "Jest wzorzec, choć nie zawsze taki sam.", score: 2 }, { id: "c", label: "Trudno to opisać. Bywa różnie.", score: 1 }, { id: "d", label: "Nie widzę wyraźnego cyklu. To nie jest schemat.", score: 0 }] },
      { id: "l6", lead: "Co czujesz między cyklami, w tych spokojniejszych momentach.", text: "Gdy wszystko jest między Wami w porządku, czy czujesz spokój i bliskość, czy raczej czekasz na następny problem?", options: [{ id: "a", label: "Czekam. Spokój mnie niepokoi, wiem że nie potrwa.", score: 3 }, { id: "b", label: "Staram się cieszyć, ale czujność gdzieś jest.", score: 2 }, { id: "c", label: "Głównie spokój, choć nie zawsze.", score: 1 }, { id: "d", label: "Spokój i bliskość. Cieszę się tym.", score: 0 }] },
      { id: "l7", lead: "Twoje otoczenie też coś widzi.", text: "Co mówią Ci bliscy o tej relacji i jak na to reagujesz?", options: [{ id: "a", label: "Mówią żebym odszedł/a. Denerwuje mnie to bo wiem że mają rację.", score: 3 }, { id: "b", label: "Mają wątpliwości. Unikam tego tematu.", score: 2 }, { id: "c", label: "Są mieszane opinie. Nie wiem kogo słuchać.", score: 1 }, { id: "d", label: "Są wspierający albo widzą to podobnie do mnie.", score: 0 }] },
      { id: "l8", lead: "Ostatnie pytanie, i najtrudniejsze.", text: "Czy wyobrażasz sobie swoje życie bez tej osoby – nie jako katastrofę, ale jako coś możliwego?", options: [{ id: "a", label: "Nie umiem tego sobie wyobrazić. To mnie przeraża.", score: 3 }, { id: "b", label: "Mogę to sobie wyobrazić, ale chcę żeby było inaczej.", score: 2 }, { id: "c", label: "Tak, choć byłoby bardzo trudno.", score: 1 }, { id: "d", label: "Tak. Wiem że dałbym/dałabym radę.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Jeśli nic się nie zmieni i za rok będziecie dokładnie w tym samym miejscu co teraz, czy to jest życie które akceptujesz?", options: [{ id: "a", label: "Nie. Ale nie wiem jak z tego wyjść.", score: 3 }, { id: "b", label: "Nie chcę tego, ale nie jestem gotowy na zmianę.", score: 2 }, { id: "c", label: "Nie. I dlatego chcę to zrozumieć i coś z tym zrobić.", score: 1 }, { id: "d", label: "Wierzę że do tego nie dojdzie. Że coś się zmieni.", score: 0 }] },
    openPrompt: "Co konkretnie trzyma Cię w tym cyklu i dlaczego mimo wszystkiego co wiesz, wracasz?",
  },
];

const LEGAL_CONTENT: Record<Exclude<LegalKey, null>, { title: string; body: string }> = {
  regulamin: {
    title: "Regulamin",
    body: "Data obowiązywania: 21.05.2026 r.\n\n1. Informacje ogólne\n\nSerwis CzyToMaSens jest dostępny pod adresem www.czytomasens.pl i umożliwia wykonanie prywatnej analizy relacji na podstawie odpowiedzi użytkownika.\n\nUsługodawcą jest osoba fizyczna prowadząca serwis CzyToMaSens. Kontakt z usługodawcą: kontakt@czytomasens.pl.\n\n2. Charakter usługi\n\nCzyToMaSens jest narzędziem analitycznym i refleksyjnym. Serwis nie świadczy usług psychologicznych, terapeutycznych, medycznych, prawnych ani diagnostycznych.\n\nWynik oraz raport powstają na podstawie odpowiedzi użytkownika i mają charakter informacyjny. Nie są diagnozą, opinią specjalisty ani oceną drugiej osoby.\n\n3. Korzystanie z serwisu\n\nUżytkownik wybiera ścieżkę analizy, odpowiada na pytania i może otrzymać pierwszy obraz sytuacji. Pełny raport jest dostępny po dokonaniu płatności.\n\nUżytkownik powinien udzielać odpowiedzi zgodnych z rzeczywistą sytuacją.\n\n4. Płatność i raport\n\nPełny raport jest odpłatną treścią cyfrową przygotowywaną indywidualnie na podstawie odpowiedzi użytkownika. Płatność obsługiwana jest przez Stripe.\n\n5. Prawo odstąpienia\n\nPrzed zakupem użytkownik wyraża zgodę na rozpoczęcie realizacji usługi przed upływem 14 dni i przyjmuje do wiadomości, że po rozpoczęciu generowania raportu traci prawo odstąpienia od umowy w zakresie tej treści cyfrowej.\n\n6. Reklamacje\n\nReklamacje można składać na adres: kontakt@czytomasens.pl.\n\n7. Odpowiedzialność\n\nUżytkownik samodzielnie podejmuje decyzje dotyczące swojej relacji. Serwis nie ponosi odpowiedzialności za decyzje podjęte na podstawie wyniku lub raportu.\n\nW sytuacji zagrożenia życia, zdrowia, przemocy lub silnego kryzysu psychicznego użytkownik powinien skontaktować się z odpowiednimi służbami, lekarzem, psychologiem lub osobą zaufaną."
  },
  prywatnosc: {
    title: "Polityka prywatności i RODO",
    body: "Data obowiązywania: 21.05.2026 r.\n\n1. Administrator danych\n\nAdministratorem danych osobowych jest osoba fizyczna prowadząca serwis CzyToMaSens. Kontakt w sprawach danych osobowych: kontakt@czytomasens.pl.\n\n2. Jakie dane przetwarzamy\n\nSerwis może przetwarzać: adres e-mail, odpowiedzi udzielone w analizie, treść wpisaną w polach otwartych, identyfikator sesji, informacje o płatności przekazane przez operatora płatności oraz podstawowe dane techniczne.\n\n3. Cele przetwarzania\n\nDane są przetwarzane w celu przygotowania analizy i raportu, obsługi płatności, udostępnienia raportu, obsługi reklamacji oraz zapewnienia bezpieczeństwa serwisu.\n\n4. Okres przechowywania\n\nDane związane z analizą i raportem są przechowywane przez okres do 90 dni, chyba że użytkownik wcześniej zażąda ich usunięcia."
  },
  rodo: {
    title: "Informacja RODO i cookies",
    body: "Data obowiązywania: 21.05.2026 r.\n\nAdministratorem danych jest osoba fizyczna prowadząca serwis CzyToMaSens. Kontakt w sprawach danych osobowych: kontakt@czytomasens.pl.\n\nSerwis wykorzystuje pliki cookies i podobne technologie w celu prawidłowego działania strony, utrzymania sesji oraz poprawy bezpieczeństwa.\n\nUżytkownik może ograniczyć lub usunąć cookies w ustawieniach przeglądarki. Ograniczenie cookies technicznych może spowodować, że część funkcji serwisu nie będzie działać prawidłowo."
  },
  kontakt: {
    title: "Kontakt",
    body: "W sprawach technicznych, płatności, raportu, reklamacji oraz danych osobowych napisz na: kontakt@czytomasens.pl.\n\nCzas odpowiedzi: do 14 dni."
  }
};

function safeNumber(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function friendlyError(error: unknown, fallback: string): string {
  const raw = error instanceof Error ? error.message : String(error || "");
  if (/failed to fetch|networkerror|load failed|fetch/i.test(raw)) {
    return "Nie udało się połączyć z analizą. Spróbuj ponownie za chwilę.";
  }
  return fallback;
}

function hasCrisisContent(text: string): boolean {
  const patterns = [/nie\s+chc[eę]\s+[zż]y[cć]/i, /samob[oó]j/i, /zabij(e|ę|esz|a)/i, /boj[eę]\s+si[eę].*(zabije|uderzy|skrzywdzi)/i, /pobi[łl]/i, /przemoc/i, /grozi/i, /n[oó][zż]/i, /krew/i];
  return patterns.some((re) => re.test(text));
}

function buildPreview(path: EntryConfig, answers: AnswerMap, openText: string): Preview {
  const scoreMap = new Map<string, number>();
  for (const q of path.questions) for (const opt of q.options) scoreMap.set(`${q.id}:${opt.id}`, opt.score);
  for (const opt of path.checkpoint.options) scoreMap.set(`${path.key}_checkpoint:${opt.id}`, opt.score);
  let total = 0;
  for (const [qid, oid] of Object.entries(answers)) total += scoreMap.get(`${qid}:${oid}`) ?? 0;
  const max = path.questions.length * 3 + 3;
  const intensity = max > 0 ? total / max : 0;
  const textPenalty = openText.trim().length > 180 ? 4 : openText.trim().length > 80 ? 2 : 0;
  const chance = safeNumber(100 - Math.round(intensity * 76) - textPenalty, 8, 88);
  const tension = safeNumber(Math.round(28 + intensity * 59), 14, 96);
  const asymmetry = safeNumber(Math.round(24 + intensity * 62), 12, 97);
  const change = safeNumber(Math.round(74 - intensity * 48), 8, 84);
  
  if (chance <= 24) return { chance, tension, asymmetry, change, tone: "red", badge: "Wzorzec wysokiego ryzyka", headline: "To nie wygląda jak kryzys do przeczekania.", truth: "W tym co opisujesz widać coś więcej niż trudny moment. Widać mechanizm który się powtarza.", mirror: "Napięcie i przywiązanie zaczęły tu robić za spoiwo. To nie jest spokojny grunt, to balansowanie na krawędzi która stała się normą.", summary: "Taki wynik pojawia się gdy w relacji obok uczucia działa już coś innego – chaos, nierówność, chroniczny brak jasności albo cykl który się nie kończy.", paidTease: "Pełny raport pokaże co konkretnie trzyma Cię w tym układzie, i dlaczego samo uczucie tego nie wyjaśnia." };
  if (chance <= 49) return { chance, tension, asymmetry, change, tone: "yellow", badge: "Układ chwiejny", headline: "Coś tu jeszcze trzyma. Ale obok tego jest coś co ciągnie w dół.", truth: "To nie jest relacja która jest po prostu trudna. To relacja która mogłaby być stabilna, ale nie jest.", mirror: "Widać tu przywiązanie. Ale widać też nierówność, zmęczenie albo niepewność która trwa za długo żeby była przypadkowa.", summary: "Taki wynik pojawia się gdy obok realnego uczucia mocno pracują już też inne siły: niejasność, różne poziomy zaangażowania, trudność z podjęciem decyzji.", paidTease: "Pełny raport rozłoży to na warstwy: co jeszcze działa, co się już rozjechało i gdzie leży największe ryzyko." };
  if (chance <= 69) return { chance, tension, asymmetry, change, tone: "yellow", badge: "Jest potencjał, ale nie bez zastrzeżeń", headline: "Tu coś jeszcze ma sens. Ale nie na autopilocie.", truth: "To nie jest relacja skazana na powtarzanie tego samego. Ale sama dobra wola i nadzieja to za mało.", mirror: "Widać miejsca które wymagają pracy – nie dlatego że coś jest nie do naprawienia, ale dlatego że zostawione same sobie się pogłębią.", summary: "Taki wynik pojawia się gdy relacja ma realny materiał, ale nie obroni się samym sentymentem ani przyzwyczajeniem.", paidTease: "Pełna analiza pokaże co daje nadzieję, co ją podcina i które wzorce są tu kluczowe." };
  return { chance, tension, asymmetry, change, tone: "green", badge: "Układ z realnym potencjałem", headline: "Tu widać grunt. Nie tylko emocje.", truth: "W odpowiedziach jest więcej spójności niż chaosu. To nie jest relacja napędzana wyłącznie lękiem ani nawykiem.", mirror: "To nie znaczy że nie ma słabszych punktów. Znaczy tyle że jest na czym budować, jeśli będziesz to widział.", summary: "Taki wynik pojawia się gdy obok napięcia nadal istnieje realna struktura – kontakt, wzajemność, zdolność do rozmowy.", paidTease: "Pełna analiza pokaże z czego dokładnie bierze się ten potencjał i gdzie mimo wszystko są jego słabsze miejsca." };
}

async function createSession(entryKey: EntryKey): Promise<SessionCreateResponse> {
  const res = await fetch(`${API_BASE}/api/session/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entryKey }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Nie udało się utworzyć sesji.");
  return data;
}

async function updateSession(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/session/update`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Nie udało się zapisać sesji.");
  return data;
}

async function createCheckout(token: string, email: string, consentAcceptedAt: string): Promise<{ url: string }> {
  const res = await fetch(`${API_BASE}/api/create-checkout`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, email, consentAcceptedAt }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.url) throw new Error(data?.error || "Błąd inicjalizacji płatności.");
  return { url: data.url };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTemporaryReportStatus(status: number): boolean {
  // 202 = raport w kolejce / processing
  // 402 = webhook Stripe jeszcze nie oznaczył sesji jako PAID
  // 404 = sesja/raport może jeszcze nie być widoczny po powrocie ze Stripe
  // 409/425 = techniczne stany "jeszcze nie teraz", jeśli backend kiedyś je zwróci
  return status === 202 || status === 402 || status === 404 || status === 409 || status === 425;
}

async function fetchPaidReport(token: string): Promise<FullReport> {
  const MAX_ATTEMPTS = 120; // 120 x 3 s = do 6 minut oczekiwania po płatności
  const INTERVAL_MS = 3000;

  let lastMessage = "Raport jest jeszcze przygotowywany.";

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const res = await fetch(`${API_BASE}/api/report/${encodeURIComponent(token)}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.report) {
        return data.report as FullReport;
      }

      lastMessage = data?.message || data?.error || lastMessage;

      if (isTemporaryReportStatus(res.status)) {
        await wait(INTERVAL_MS);
        continue;
      }

      throw new Error(lastMessage || "Błąd pobierania raportu.");
    } catch (error: any) {
      const message = String(error?.message || "");

      // Krótkie problemy sieciowe po przekierowaniu ze Stripe traktujemy jako stan przejściowy.
      if (/failed to fetch|networkerror|load failed|fetch/i.test(message) && attempt < MAX_ATTEMPTS - 1) {
        await wait(INTERVAL_MS);
        continue;
      }

      if (attempt >= MAX_ATTEMPTS - 1) break;
      throw error;
    }
  }

  throw new Error(
    `${lastMessage} Płatność została przyjęta, ale raport nadal się generuje. Nie płać drugi raz. Zostaw chwilę systemowi i kliknij „Sprawdź raport ponownie” albo sprawdź e-mail.`
  );
}

async function fetchSignedReport(accessToken: string, accessExp: string, accessSig: string): Promise<FullReport> {
  const MAX_ATTEMPTS = 60; // do 3 minut dla linku z maila
  const INTERVAL_MS = 3000;

  let lastMessage = "Raport nie jest jeszcze dostępny.";

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const res = await fetch(
      `${API_BASE}/api/report/signed?token=${encodeURIComponent(accessToken)}&exp=${encodeURIComponent(accessExp)}&sig=${encodeURIComponent(accessSig)}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      }
    );

    const data = await res.json().catch(() => ({}));

    if (res.ok && data?.report) {
      return data.report as FullReport;
    }

    lastMessage = data?.message || data?.error || lastMessage;

    if (isTemporaryReportStatus(res.status)) {
      await wait(INTERVAL_MS);
      continue;
    }

    throw new Error(lastMessage || "Link wygasł albo raport nie jest dostępny.");
  }

  throw new Error(`${lastMessage} Spróbuj odświeżyć link za chwilę.`);
}

async function fetchPreviewFromAPI(token: string, path: EntryConfig, answers: AnswerMap, openText: string): Promise<Preview> {
  const answersArr = Object.entries(answers).map(([qid, oid]) => { const q = path.questions.find((x) => x.id === qid); const opt = q?.options.find((o) => o.id === oid); return { q: q?.text || qid, a: opt?.label || oid }; });
  try {
    const res = await fetch(`${API_BASE}/api/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, path: path.key, mode: "soft", answers: answersArr, openText, customDescription: openText }) });
    const data = await res.json().catch(() => ({}));
    if (data?.crisis) throw new Error("__CRISIS__");
    if (data?.ok && data?.preview) {
      const p = data.preview;
      const tension = typeof p.tensionPercent === "number" ? p.tensionPercent : 50;
      const asymmetry = typeof p.driftPercent === "number" ? p.driftPercent : 50;
      const change = typeof p.rebuildPercent === "number" ? p.rebuildPercent : 50;
      const chance = Math.round(100 - tension * 0.5 - asymmetry * 0.3 + change * 0.2);
      const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
      return { chance: clamp(chance, 5, 95), tension: clamp(tension, 5, 97), asymmetry: clamp(asymmetry, 5, 97), change: clamp(change, 5, 90), tone: chance <= 30 ? "red" : chance <= 60 ? "yellow" : "green", badge: p.subheadline || "Analiza relacji", headline: p.headline || "Wynik gotowy.", truth: p.previewLine || "", mirror: p.sections?.[0]?.text || "", summary: p.sections?.[1]?.text || p.sections?.[0]?.text || "", paidTease: p.closing || "Pełny raport idzie znacznie głębiej." } as Preview;
    }
  } catch (e: any) { if (e?.message === "__CRISIS__") throw e; }
  return buildPreview(path, answers, openText);
}

function LogoBlock() {
  return (
    <div className="ctms-logo-wrap">
      <div className="ctms-logo-mark" />
      <div>
        <div className="ctms-logo">CzyToMaSens<span>.</span></div>
        <div className="ctms-logo-sub">PRYWATNA ANALIZA RELACJI</div>
      </div>
    </div>
  );
}

function Glass({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`ctms-glass ${className}`.trim()} style={style}>{children}</div>;
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return <button className="ctms-btn ctms-btn-primary" onClick={onClick} disabled={disabled}>{children}</button>;
}

function GhostButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button className="ctms-btn ctms-btn-ghost" onClick={onClick}>{children}</button>;
}

function PremiumBadge({ preview }: { preview: Preview }) {
  const color = preview.tone === "red" ? BRAND.danger : preview.tone === "green" ? BRAND.success : BRAND.goldSoft;
  const scoreExplanation = `Wynik pochodzi z trzech osi: napięcie w relacji (${preview.tension}%), asymetria zaangażowania (${preview.asymmetry}%), realność zmiany (${preview.change}%). Im wyższe napięcie i asymetria, tym niższy wynik końcowy.`;
  return (
    <Glass className="ctms-preview-badge">
      <div className="ctms-kicker">NA ILE TO MA SENS</div>
      <div className="ctms-preview-score" style={{ color }}>{preview.chance}%</div>
      <div className="ctms-preview-label">{preview.badge}</div>
      <div className="ctms-preview-truth">{preview.truth}</div>
      <div className="ctms-preview-mirror">{preview.mirror}</div>
      <div className="ctms-score-explanation">{scoreExplanation}</div>
    </Glass>
  );
}

function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try { if (!localStorage.getItem("ctms_cookies_accepted")) setVisible(true); } catch {}
  }, []);
  const accept = () => {
    try { localStorage.setItem("ctms_cookies_accepted", "1"); } catch {}
    setVisible(false);
  };
  if (!visible) return null;
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999, background: "rgba(10,10,10,0.97)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "16px clamp(18px,3vw,36px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
      <p style={{ margin: 0, fontSize: "13px", color: "#A8A099", maxWidth: "700px", lineHeight: 1.6 }}>
        Ta strona używa plików cookies wyłącznie do utrzymania sesji i poprawnego działania. Nie stosujemy cookies reklamowych ani śledzących.
      </p>
      <button onClick={accept} style={{ background: "#C5A059", color: "#050505", border: "none", borderRadius: "6px", padding: "10px 20px", fontWeight: 600, fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" }}>
        Rozumiem
      </button>
    </div>
  );
}

const PROCESSING_MESSAGES = [
  "Analizuję wzorzec relacyjny...",
  "Identyfikuję mechanizmy obronne...",
  "Mapuję dynamikę zaangażowania...",
  "Szukam sprzeczności w odpowiedziach...",
  "Buduję profil przywiązania...",
  "Przygotowuję sekcję lustrzaną...",
  "Finalizuję raport...",
];

function ProcessingScreen() {
  const [msgIndex, setMsgIndex] = React.useState(0);
  const [dots, setDots] = React.useState(0);
  React.useEffect(() => {
    const msgTimer = setInterval(() => { setMsgIndex((v) => (v + 1) % PROCESSING_MESSAGES.length); }, 3500);
    const dotTimer = setInterval(() => { setDots((v) => (v + 1) % 4); }, 500);
    return () => { clearInterval(msgTimer); clearInterval(dotTimer); };
  }, []);
  return (
    <div className="loading-wrap">
      <Glass className="loading-panel">
        <div className="processing-orb">
          <div className="processing-ring" />
          <div className="processing-ring processing-ring--2" />
          <div className="processing-dot" />
        </div>
        <h2 style={{ marginBottom: "12px", fontSize: "clamp(20px,4vw,26px)" }}>Raport jest generowany</h2>
        <div className="processing-message">{PROCESSING_MESSAGES[msgIndex]}{".".repeat(dots)}</div>
        <p style={{ marginTop: "24px", fontSize: "14px", color: "var(--muted)", lineHeight: 1.6 }}>Każde zdanie dotyczy tylko Ciebie.<br />Nie zamykaj karty. To zajmie chwilę.</p>
        <div className="processing-bar"><div className="processing-bar-fill" /></div>
      </Glass>
    </div>
  );
}

const SITE_URL = "https://czytomasens.pl";

const LEGAL_ROUTES: Record<string, LegalKey> = {
  "/regulamin": "regulamin",
  "/polityka-prywatnosci": "prywatnosc",
  "/rodo": "rodo",
  "/kontakt": "kontakt",
};

function normalizePath(value: string): string {
  const path = value.split("?")[0].split("#")[0];
  if (!path || path === "/") return "/";
  return path.replace(/\/+$/, "") || "/";
}

function ensureMeta(selector: string, create: () => HTMLMetaElement): HTMLMetaElement {
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!tag) {
    tag = create();
    document.head.appendChild(tag);
  }
  return tag;
}

function setMetaName(name: string, content: string) {
  const tag = ensureMeta(`meta[name="${name}"]`, () => {
    const element = document.createElement("meta");
    element.setAttribute("name", name);
    return element;
  });
  tag.setAttribute("content", content);
}

function setMetaProperty(property: string, content: string) {
  const tag = ensureMeta(`meta[property="${property}"]`, () => {
    const element = document.createElement("meta");
    element.setAttribute("property", property);
    return element;
  });
  tag.setAttribute("content", content);
}

function setCanonical(path: string) {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", `${SITE_URL}${path === "/" ? "" : path}`);
}

function setStructuredData(id: string, data: Record<string, unknown>) {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export default function App() {
  const [stage, setStage] = useState<Stage>("landing");
  const [selectedPath, setSelectedPath] = useState<EntryKey | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [openText, setOpenText] = useState("");
  const [email, setEmail] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [fullReport, setFullReport] = useState<FullReport | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setConsents] = useState<boolean[]>([false, false, false, false]);
  const [legalOpen, setLegalOpen] = useState<LegalKey>(null);
  const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
  const [interviewAnswer, setInterviewAnswer] = useState("");
  const [interviewBusy, setInterviewBusy] = useState(false);
  const [routePath, setRoutePath] = useState(() => normalizePath(typeof window !== "undefined" ? window.location.pathname : "/"));

  const articleSlugFromRoute = routePath.startsWith("/artykuly/") ? decodeURIComponent(routePath.replace("/artykuly/", "")) : null;
  const routeArticle = articleSlugFromRoute ? ARTICLES.find((article) => article.slug === articleSlugFromRoute) : null;
  const routeLegalKey = LEGAL_ROUTES[routePath] || null;
  const isPublicContentRoute = routePath === "/artykuly" || Boolean(routeArticle) || Boolean(routeLegalKey);

  const navigateTo = (nextPath: string) => {
    const cleanPath = normalizePath(nextPath);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", cleanPath);
      setRoutePath(cleanPath);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const path = useMemo(() => ENTRY_CONFIGS.find((x) => x.key === selectedPath) || null, [selectedPath]);
  const currentQuestion = path?.questions[questionIndex] || null;

  useEffect(() => {
    const handlePopState = () => setRoutePath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const articleTitle = routeArticle?.seoTitle || (routeArticle ? `${routeArticle.title} | CzyToMaSens` : "");
    const articleDescription = routeArticle?.seoDescription || routeArticle?.lead || "";
    const legalTitle = routeLegalKey ? `${LEGAL_CONTENT[routeLegalKey].title} | CzyToMaSens` : "";
    const legalDescription = routeLegalKey ? `Dokument: ${LEGAL_CONTENT[routeLegalKey].title} serwisu CzyToMaSens.` : "";

    const title = routeArticle
      ? articleTitle
      : routePath === "/artykuly"
        ? "Artykuły o relacjach, związkach i schematach | CzyToMaSens"
        : routeLegalKey
          ? legalTitle
          : "CzyToMaSens | Prywatna analiza relacji";

    const description = routeArticle
      ? articleDescription
      : routePath === "/artykuly"
        ? "Artykuły o relacjach, powrotach, niezdrowych związkach, napięciu, bliskości i mechanizmach, których często nie widać od środka."
        : routeLegalKey
          ? legalDescription
          : "Prywatna analiza relacji. Zobacz wzorce, napięcia, asymetrię i mechanizmy, które mogą decydować o tym, czy Twoja relacja ma sens.";

    document.title = title;
    setMetaName("description", description);
    setMetaProperty("og:title", title);
    setMetaProperty("og:description", description);
    setMetaProperty("og:type", routeArticle ? "article" : "website");
    setMetaProperty("og:url", `${SITE_URL}${routePath === "/" ? "" : routePath}`);
    setMetaName("robots", "index,follow");
    setCanonical(routePath);

    if (routeArticle) {
      setStructuredData("ctms-jsonld", {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: routeArticle.title,
        description,
        url: `${SITE_URL}/artykuly/${routeArticle.slug}`,
        mainEntityOfPage: `${SITE_URL}/artykuly/${routeArticle.slug}`,
        publisher: { "@type": "Organization", name: "CzyToMaSens" },
      });
    } else {
      setStructuredData("ctms-jsonld", {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "CzyToMaSens",
        url: SITE_URL,
      });
    }
  }, [routePath, routeArticle, routeLegalKey]);

  useEffect(() => {
    if (!isPublicContentRoute) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const restoredStage: Stage = parsed.stage === "processing" ? (parsed.preview ? "preview" : "landing") : (parsed.stage || "landing");
          setStage(restoredStage);
          setSelectedPath(parsed.selectedPath || null);
          setQuestionIndex(parsed.questionIndex || 0);
          setAnswers(parsed.answers || {});
          setOpenText(parsed.openText || "");
          setEmail(parsed.email || "");
          setPreview(parsed.preview || null);
          setFullReport(parsed.fullReport || null);
          setSessionToken(parsed.sessionToken || null);
          setConsents(parsed.consents || [false, false, false, false]);
          setInterviewState(parsed.interviewState || null);
        }
      } catch {}
    }

    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const token = params.get("token");
    const cancel = params.get("cancel") || params.get("cancelled") || params.get("canceled");
    const accessToken = params.get("access_token");
    const accessExp = params.get("exp");
    const accessSig = params.get("sig");

    if (accessToken && accessExp && accessSig) {
      setBusy(true);
      setError(null);
      setStage("processing");
      setSessionToken(accessToken);

      fetchSignedReport(accessToken, accessExp, accessSig)
        .then((report) => {
          setFullReport(report);
          setSessionToken(accessToken);
          setStage("paid");
          setBusy(false);
        })
        .catch((e: any) => {
          setBusy(false);
          setStage("error");
          setError(friendlyError(e, "Link do raportu nie jest jeszcze dostępny albo wygasł. Spróbuj ponownie za chwilę."));
        })
        .finally(() => {
          window.history.replaceState({}, "", window.location.pathname);
        });

      return;
    }

    if (cancel === "1" || cancel === "true") {
      setBusy(false);
      setStage("preview");
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    if (success === "1" && token) {
      setBusy(true);
      setError(null);
      setStage("processing");
      setSessionToken(token);

      fetchPaidReport(token)
        .then((report) => {
          setFullReport(report);
          setSessionToken(token);
          setStage("paid");
          setBusy(false);
        })
        .catch((e: any) => {
          setBusy(false);
          setStage("error");
          setError(
            friendlyError(
              e,
              "Płatność wróciła poprawnie, ale raport nadal się przygotowuje. Nie płać drugi raz. Kliknij „Sprawdź raport ponownie” albo sprawdź e-mail za chwilę."
            )
          );
        })
        .finally(() => {
          window.history.replaceState({}, "", window.location.pathname);
        });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stage, selectedPath, questionIndex, answers, openText, email, preview, fullReport, sessionToken, interviewState }));
  }, [stage, selectedPath, questionIndex, answers, openText, email, preview, fullReport, sessionToken, interviewState]);

  const ensureSession = async (entryKey: EntryKey): Promise<string> => {
    if (sessionToken) return sessionToken;
    const data = await createSession(entryKey);
    const nextToken = data?.token || data?.sessionId || null;
    if (!nextToken) throw new Error("Nie udało się uzyskać tokenu sesji.");
    setSessionToken(nextToken); return nextToken;
  };

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStage("landing"); setSelectedPath(null); setQuestionIndex(0); setAnswers({}); setOpenText(""); setEmail(""); setPreview(null); setFullReport(null); setSessionToken(null); setBusy(false); setError(null); setConsents([false, false, false, false]); setLegalOpen(null); setInterviewState(null); setInterviewAnswer("");
    window.history.replaceState({}, "", "/");
    setRoutePath("/");
  };

  const startPath = async (key: EntryKey) => {
    setBusy(true); setError(null);
    try {
      const data = await createSession(key);
      const token = data?.token || data?.sessionId || null;
      if (!token) throw new Error("Brak tokenu sesji.");
      setSessionToken(token); setSelectedPath(key); setQuestionIndex(0); setAnswers({}); setOpenText(""); setPreview(null); setFullReport(null); setInterviewState(null);
      setStage("questions");
    } catch (e: any) { setError(friendlyError(e, "Nie udało się rozpocząć analizy.")); setStage("error"); }
    finally { setBusy(false); }
  };

  const answerQuestion = (qid: string, optionId: string) => {
    const next = { ...answers, [qid]: optionId };
    setAnswers(next);
    if (!path) return;
    if (questionIndex >= path.questions.length - 1) { setStage("checkpoint"); return; }
    setQuestionIndex((v) => v + 1);
  };

  const answerCheckpoint = async (optionId: string) => {
    if (!path) return;
    const newAnswers = { ...answers, [`${path.key}_checkpoint`]: optionId };
    setAnswers(newAnswers);
    if (sessionToken) {
      setBusy(true);
      try {
        const res = await fetch(`${API_BASE}/api/interview/start`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: sessionToken, path: path.key, initialContext: "" }) });
        const d = await res.json().catch(() => ({}));
        if (d.ok && d.question) {
          setInterviewState({ path: path.key, currentQuestion: d.question, currentLead: d.lead || "", currentObservation: d.observation || "", history: [], depth: 1, finished: false, exchangeIndex: 0 });
          setInterviewAnswer(""); setStage("interview"); setBusy(false); return;
        }
      } catch {}
      setBusy(false);
    }
    setStage("open_text");
  };

  const sendInterviewAnswer = async () => {
    if (!interviewState || !sessionToken || !interviewAnswer.trim()) return;
    if (hasCrisisContent(interviewAnswer)) { setStage("crisis"); return; }
    const currentExchangeCount = interviewState.history.length + 1;
    const updatedHistory: InterviewExchange[] = [...interviewState.history, { ai: interviewState.currentQuestion, user: interviewAnswer.trim(), lead: interviewState.currentLead, observation: interviewState.currentObservation }];
    
    if (currentExchangeCount > 5) {
      setInterviewBusy(true);
      try {
        await fetch(`${API_BASE}/api/interview/next`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: sessionToken, userAnswer: interviewAnswer.trim() }) }).catch(() => {});
        await fetch(`${API_BASE}/api/interview/finish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: sessionToken }) }).catch(() => {});
      } catch {}
      finally { setInterviewBusy(false); }
      const transcript = updatedHistory.map((e) => `Pytanie: ${e.ai}\nOdpowiedź: ${e.user}`).join("\n\n");
      setInterviewState({ ...interviewState, history: updatedHistory, finished: true }); setOpenText(transcript); setStage("open_text"); return;
    }
    
    setInterviewBusy(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/interview/next`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: sessionToken, userAnswer: interviewAnswer.trim() }) });
      const d = await res.json().catch(() => ({}));
      if (d.crisis) { setStage("crisis"); return; }
      if (!d.ok) throw new Error(d.message || "Błąd wywiadu.");
      
      if (d.finished || updatedHistory.length >= 5) {
        try { await fetch(`${API_BASE}/api/interview/finish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: sessionToken }) }); } catch {}
        const transcript = updatedHistory.map((e) => `Pytanie: ${e.ai}\nOdpowiedź: ${e.user}`).join("\n\n");
        setInterviewState({ ...interviewState, history: updatedHistory, finished: true }); setOpenText(transcript); setStage("open_text");
      } else {
        setInterviewState({ ...interviewState, history: updatedHistory, currentQuestion: d.question, currentLead: d.lead || "", currentObservation: d.observation || "", depth: Math.min(d.depth, 5), exchangeIndex: d.exchangeIndex });
        setInterviewAnswer("");
      }
    } catch (e: any) { setError(friendlyError(e, "Nie udało się przejść dalej.")); }
    finally { setInterviewBusy(false); }
  };

  const goBack = () => {
    setError(null);
    if (stage === "questions") { if (questionIndex === 0) { setStage("entry"); return; } setQuestionIndex((v) => Math.max(0, v - 1)); return; }
    if (stage === "checkpoint") { setStage("questions"); return; }
    if (stage === "interview") { setStage("checkpoint"); return; }
    if (stage === "open_text") { if (interviewState && interviewState.history.length > 0) { setStage("interview"); return; } setStage("checkpoint"); return; }
    if (stage === "preview") { setStage("open_text"); return; }
    if (stage === "consent") { setStage("landing"); return; }
    if (stage === "entry") setStage("consent");
  };

  const buildPreviewAndGo = async () => {
    if (!path) return;
    if (hasCrisisContent(openText)) { setStage("crisis"); return; }
    setBusy(true); setError(null);
    try {
      const token = await ensureSession(path.key);
      let previewData: Preview;
      try { previewData = await fetchPreviewFromAPI(token, path, answers, openText); }
      catch (e: any) { if (e?.message === "__CRISIS__") { setStage("crisis"); setBusy(false); return; } previewData = buildPreview(path, answers, openText); }
      setPreview(previewData);
      await updateSession({ token, path: path.key, answers, openText, preview: previewData, stage: "preview" });
      setStage("preview");
    } catch (e: any) { setError(friendlyError(e, "Nie udało się przygotować pierwszego obrazu sytuacji.")); setStage("error"); }
    finally { setBusy(false); }
  };

  const pay = async () => {
    if (!selectedPath || !preview) { setError("Brak gotowego podglądu."); return; }
    if (!email.includes("@")) { setError("Podaj prawidłowy adres e-mail."); return; }
    setBusy(true); setError(null);
    try {
      const token = await ensureSession(selectedPath);
      await updateSession({ token, path: selectedPath, answers, openText, preview, email, consentAcceptedAt: new Date().toISOString(), stage: "checkout_started" });
      const checkout = await createCheckout(token, email, new Date().toISOString());
      window.location.href = checkout.url;
    } catch (e: any) { setError(friendlyError(e, "Nie udało się rozpocząć płatności.")); setBusy(false); }
  };

  const retryPaidReport = async () => {
    if (!sessionToken) {
      setError("Brak tokenu sesji. Nie klikaj ponownie płatności — najpierw sprawdź mail albo logi płatności.");
      return;
    }

    setBusy(true);
    setError(null);
    setStage("processing");

    try {
      const report = await fetchPaidReport(sessionToken);
      setFullReport(report);
      setStage("paid");
    } catch (e: any) {
      setStage("error");
      setError(
        friendlyError(
          e,
          "Raport nadal się przygotowuje. Nie płać drugi raz. Kliknij „Sprawdź raport ponownie” za chwilę albo sprawdź e-mail."
        )
      );
    } finally {
      setBusy(false);
    }
  };

  const renderPublicContentRoute = () => {
    if (routeLegalKey) {
      const legal = LEGAL_CONTENT[routeLegalKey];
      return (
        <motion.div key={`legal-${routeLegalKey}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <Glass className="question-panel legal-page">
            <div className="eyebrow">DOKUMENTY</div>
            <h1 style={{ marginTop: 0 }}>{legal.title}</h1>
            <div style={{ whiteSpace: "pre-line", color: BRAND.muted, lineHeight: 1.75, fontSize: "15px" }}>{legal.body}</div>
            <div className="section-actions">
              <GhostButton onClick={() => navigateTo("/")}>Wróć na stronę główną</GhostButton>
            </div>
          </Glass>
        </motion.div>
      );
    }

    return (
      <motion.div key={`articles-${routeArticle?.slug || "index"}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        <ArticlesSection
          initialSlug={routeArticle?.slug || null}
          onNavigateHome={() => navigateTo("/artykuly")}
          onNavigateArticle={(slug) => navigateTo(`/artykuly/${slug}`)}
          onStartAnalysis={() => {
            navigateTo("/");
            setStage("consent");
          }}
        />
      </motion.div>
    );
  };


  return (
    <div className="ctms-shell">
      <div className="ctms-noise" />
      <div className="ctms-topbar">
        <LogoBlock />
        {stage !== "landing" && !isPublicContentRoute && <GhostButton onClick={resetAll}>Od początku</GhostButton>}
      </div>

      <main className={`ctms-main ${(["consent","questions","checkpoint","interview","open_text","preview","paid","error","crisis"].includes(stage) || Boolean(routeLegalKey)) ? "narrow" : ""}`}>
        <AnimatePresence mode="wait">

          {stage === "landing" && isPublicContentRoute && renderPublicContentRoute()}

          {stage === "landing" && !isPublicContentRoute && (
            <motion.div key="landing" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <section className="hero-grid">
                <Glass className="glass-panel hero-panel hero-copy">
                  <div className="eyebrow with-line">PRYWATNA ANALIZA RELACJI</div>
                  <div className="hero-kicker">TWOJA RELACJA MA WZORZEC.</div>
                  <h1>Już wiesz, że <span>coś nie gra.</span><br />Tu zobaczysz, co naprawdę się dzieje.</h1>
                  <p style={{ lineHeight: 1.75, color: BRAND.muted, marginBottom: "28px" }}>Nie jesteś tu po potwierdzenie, że wszystko jest okej. Jesteś tu, bo coś nie daje Ci spokoju i chcesz zobaczyć sprawę uczciwie, bez dopowiadania sobie wygodnej wersji. Analiza nie podejmuje decyzji za Ciebie. Pokazuje, czy opierasz ją na faktach, nadziei, lęku, przywiązaniu czy realnej zmianie.</p>
                  <div className="ctms-landing-actions">
                    <PrimaryButton onClick={() => setStage("consent")}>Chcę sprawdzić</PrimaryButton>
                  </div>
                </Glass>
                <div className="hero-side-stack">
                  <Glass className="glass-panel story-panel visual-story">
                    <div className="story-kicker">CO ZOBACZYSZ</div>
                    <h3>To, co trudno zobaczyć od środka</h3>
                    <div className="story-points">
                      <div><span>▸</span><p>Co powtarza się między Wami, zanim jeszcze zaczyna się kolejna rozmowa</p></div>
                      <div><span>▸</span><p>Gdzie nadzieja miesza się z faktami i przez to trudniej podjąć decyzję</p></div>
                      <div><span>▸</span><p>Który sygnał warto sprawdzić, zanim dasz tej relacji kolejną szansę</p></div>
                    </div>
                    <div className="story-lock">
                      <div className="story-lock-icon">🔒</div>
                      <div><strong>Pełny raport</strong><span>Jednorazowo. Raport generowany indywidualnie na podstawie Twoich odpowiedzi.</span></div>
                    </div>
                  </Glass>
                </div>
              </section>
              
              <section style={{ margin: "32px 0 0" }}>
                <Glass style={{ padding: "36px 40px" }}>
                  <div className="eyebrow" style={{ marginBottom: "24px" }}>CZYM TO NIE JEST</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px 40px" }}>
                    {[
                      ["Nie jest testem osobowości.", "Nie dostaniesz swojego „typu”. Dostaniesz obraz konkretnej sytuacji w której teraz jesteś."],
                      ["Nie powie Ci co robić.", "Nie ma tu gotowych zaleceń ani tanich rad. Jest analiza i jedno pytanie, którego nie da się zignorować."],
                      ["Nie oceni Twojego partnera.", "Opisuje mechanizmy, nie wydaje wyroków. Na podstawie Twoich słów, nie cudzych założeń."],
                      ["Nie jest formularzem do odhaczenia.", "Pytania prowadzą głębiej z każdą odpowiedzią. To nie jest ankieta ani lista pól do kliknięcia."]
                    ].map(([title, desc]) => (
                      <div key={title} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                        <span className="text-meta">•</span>
                        <div>
                          <strong style={{ color: BRAND.text, fontSize: "15px", display: "block", marginBottom: "4px" }}>{title}</strong>
                          <span style={{ color: BRAND.muted, fontSize: "15px", lineHeight: "1.65" }}>{desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Glass>
              </section>
              
              <section className="ctms-feature-editorial-grid" style={{ marginTop: "24px" }}>
                <Glass className="feature-card">
                  <div className="feature-top"><span className="feature-no">01</span><span className="feature-icon">◌</span></div>
                  <h3>Schodzi głębiej niż myślisz</h3>
                  <div className="feature-line" />
                  <p>Każde pytanie ma prowadzić do sedna sprawy. Nie chodzi o odhaczanie pól, tylko o uchwycenie mechanizmu.</p>
                </Glass>
                <Glass className="feature-card">
                  <div className="feature-top"><span className="feature-no">02</span><span className="feature-icon">▤</span></div>
                  <h3>Mówi to czego inni nie powiedzą</h3>
                  <div className="feature-line" />
                  <p>Nie pocieszenie. Nie ocena. Precyzyjny obraz tego, co widać z zewnątrz, bez zakładania z góry, kto ma rację.</p>
                </Glass>
                <Glass className="feature-card">
                  <div className="feature-top"><span className="feature-no">03</span><span className="feature-icon">◐</span></div>
                  <h3>Zostajesz z czymś konkretnym</h3>
                  <div className="feature-line" />
                  <p>Nie z listą kroków ani motywacją na dziś. Z obrazem mechanizmu i jednym pytaniem, które z niego wynika.</p>
                </Glass>
              </section>

              <ArticlesSection onNavigateHome={() => navigateTo("/artykuly")} onNavigateArticle={(slug) => navigateTo(`/artykuly/${slug}`)} onStartAnalysis={() => setStage("consent")} />
            </motion.div>
          )}

          {stage === "consent" && (
            <motion.div key="consent" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="question-panel consent-panel">
                <div className="eyebrow">ZANIM WEJDZIESZ</div>
                <h2>Przeczytaj to. Serio.</h2>
                <p className="consent-copy">To narzędzie nie ma Cię straszyć ani pocieszać na siłę. Ma pokazać, co wynika z Twoich odpowiedzi: ryzyka, potencjał i miejsce, w którym warto przestać udawać, że wszystko jest jasne.</p>
                <div className="analysis-boundary">To nie jest diagnoza psychologiczna ani gotowa decyzja. To prywatny obraz wzorca relacji zbudowany wyłącznie na podstawie Twoich odpowiedzi.</div>
                <div className="consent-note">
                  Korzystając dalej, potwierdzasz, że zapoznałeś się z Regulaminem oraz Polityką prywatności i RODO. Pełny raport jest treścią cyfrową przygotowywaną po płatności na podstawie Twoich odpowiedzi. W wyjątkowych sytuacjach technicznych raport może zostać udostępniony w terminie do 14 dni.
                </div>
                <div className="consent-actions">
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton onClick={() => { setStage("entry"); }}>Wchodzę dalej</PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {stage === "entry" && (
            <motion.div key="entry" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="section-head">
                <div><div className="eyebrow">WYBIERZ ŚCIEŻKĘ</div><h2>Co Cię tu przyprowadziło?</h2><p>Wybierz to co najbardziej nie daje Ci spokoju. Pytania i analiza będą dopasowane do Twojej sytuacji.</p></div>
                <GhostButton onClick={goBack}>Wróć</GhostButton>
              </div>
              <div className="entry-grid">
                {ENTRY_CONFIGS.map((entry) => (
                  <Glass key={entry.key} className="entry-card">
                    <div className="eyebrow">ŚCIEŻKA ANALIZY</div>
                    <h3>{entry.title}</h3>
                    <div className="entry-subtitle">{entry.subtitle}</div>
                    <div style={{ margin: "14px 0", padding: "12px 16px", borderLeft: `2px solid ${BRAND.gold}`, background: "rgba(197,160,89,0.05)", fontSize: "13px", color: BRAND.muted, lineHeight: 1.6, fontStyle: "italic" }}>{entry.quote}</div>
                    <div className="entry-intro">{entry.intro}</div>
                    <div style={{ fontSize: "12px", color: BRAND.muted, margin: "8px 0 16px" }}>⏱ {entry.duration}</div>
                    <div className="entry-action"><PrimaryButton onClick={() => startPath(entry.key)}>{busy ? "Przygotowuję..." : "Zacznij analizę"}</PrimaryButton></div>
                  </Glass>
                ))}
              </div>
            </motion.div>
          )}

          {stage === "questions" && path && currentQuestion && (
            <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="section-head compact">
                <div className="eyebrow">{path.title.toUpperCase()}</div>
                <div className="progress-wrap">
                  <span>Pytanie {questionIndex + 1} z {path.questions.length}</span>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${((questionIndex + 1) / path.questions.length) * 100}%` }} /></div>
                </div>
              </div>
              <Glass className="question-panel">
                <div className="question-copy">
                  <div className="question-lead">{currentQuestion.lead}</div>
                  <h3>{currentQuestion.text}</h3>
                </div>
                <div className="answer-grid">
                  {currentQuestion.options.map((opt) => (
                    <button key={opt.id} className="answer-card" onClick={() => answerQuestion(currentQuestion.id, opt.id)}>{opt.label}</button>
                  ))}
                </div>
                <div className="section-actions"><GhostButton onClick={goBack}>Wróć</GhostButton><GhostButton onClick={resetAll}>Od początku</GhostButton></div>
              </Glass>
            </motion.div>
          )}

          {stage === "checkpoint" && path && (
            <motion.div key={`${path.key}-checkpoint`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="question-panel">
                <div className="eyebrow">{path.checkpoint.title}</div>
                <div className="question-copy"><h3>{path.checkpoint.text}</h3></div>
                <div className="answer-grid">
                  {path.checkpoint.options.map((opt) => (
                    <button key={opt.id} className="answer-card" onClick={() => answerCheckpoint(opt.id)}>{busy ? "Ładuję..." : opt.label}</button>
                  ))}
                </div>
                <div className="section-actions"><GhostButton onClick={goBack}>Wróć</GhostButton></div>
              </Glass>
            </motion.div>
          )}

          {stage === "interview" && interviewState && (
            <motion.div key={`interview-${interviewState.exchangeIndex}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="section-head compact">
                <div className="eyebrow">{(ENTRY_CONFIGS.find((x) => x.key === selectedPath)?.title || "").toUpperCase()}</div>
                <div className="progress-wrap">
                  <span>Głębokość {interviewState.depth} z 5</span>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${(interviewState.depth / 5) * 100}%` }} /></div>
                </div>
              </div>
              <Glass className="question-panel">
                <div className="question-copy">
                  {interviewState.currentLead && <div className="question-lead">{interviewState.currentLead}</div>}
                  <h3>{interviewState.currentQuestion}</h3>
                  {interviewState.currentObservation && interviewState.history.length > 0 && (<div style={{ fontSize: "14px", color: BRAND.muted, marginTop: "12px", fontStyle: "italic", lineHeight: 1.6 }}>{interviewState.currentObservation}</div>)}
                </div>
                <textarea className="ctms-textarea" value={interviewAnswer} onChange={(e) => setInterviewAnswer(e.target.value)} placeholder="Odpowiedz konkretnie..." maxLength={2000} />
                <div className="text-meta"><div>{interviewState.history.length > 0 ? `Wymiana ${interviewState.history.length + 1}` : "Pierwsze pytanie"}</div><div>{interviewAnswer.length}/2000</div></div>
                {error && <div className="error-line" style={{ marginTop: "12px" }}>{error}</div>}
                <div className="section-actions">
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton onClick={sendInterviewAnswer} disabled={interviewBusy || interviewAnswer.trim().length < 10}>{interviewBusy ? "Analizuję..." : "Dalej →"}</PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {stage === "open_text" && path && (
            <motion.div key={`${path.key}-open`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="question-panel">
                <div className="eyebrow">OSTATNIA WARSTWA</div>
                <div className="question-copy">
                  <h3>{interviewState?.finished ? "Jest coś, czego nie udało się jeszcze nazwać, a co może być kluczowe?" : path.openPrompt}</h3>
                  <p style={{ color: BRAND.muted, fontSize: "14px", marginTop: "10px", lineHeight: 1.65 }}>Napisz naturalnie, jak do kogoś, kto ma zobaczyć sens w chaosie.</p>
                </div>
                <textarea className="ctms-textarea" value={openText} onChange={(e) => setOpenText(e.target.value)} placeholder="Co konkretnie się dzieje? Opisz fakty..." maxLength={3000} />
                <div className="text-meta"><div>To jest rdzeń analizy.</div><div>{openText.length}/3000</div></div>
                <div className="section-actions">
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton onClick={buildPreviewAndGo} disabled={busy || openText.trim().length < 10}>{busy ? "Analizuję..." : "Pokaż pierwszy obraz sytuacji"}</PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {stage === "crisis" && (
            <motion.div key="crisis" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="question-panel crisis-panel">
                <div className="eyebrow danger">ZATRZYMAJ SIĘ</div>
                <h2>To nie jest właściwe narzędzie dla sytuacji zagrożenia.</h2>
                <p className="consent-copy">Jeśli jest ryzyko przemocy, zagrożenia życia albo skrzywdzenia siebie, przerwij analizę i skorzystaj z natychmiastowej pomocy. Nie analizuj relacji, kiedy jesteś w bezpośrednim zagrożeniu. Najpierw bezpieczeństwo, potem interpretacja.</p>
                <div className="crisis-grid">
                  <Glass className="crisis-box"><strong>112</strong>. Numer alarmowy</Glass>
                  <Glass className="crisis-box"><strong>116 123</strong>. Telefon zaufania dla dorosłych</Glass>
                  <Glass className="crisis-box"><strong>116 111</strong>. Telefon zaufania dla dzieci i młodzieży</Glass>
                </div>
                <div className="section-actions"><GhostButton onClick={resetAll}>Zamknij</GhostButton></div>
              </Glass>
            </motion.div>
          )}

          {stage === "preview" && preview && (
            <motion.div key="preview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="preview-card">
                <div className="preview-hero">
                  <div className="eyebrow">PIERWSZY OBRAZ SYTUACJI</div>
                  <h2>{preview.headline}</h2>
                  <div className="preview-truth-top">{preview.truth}</div>
                  <div className="preview-mirror-top">{preview.mirror}</div>
                </div>
                <PremiumBadge preview={preview} />
                <div className="preview-disclaimer">
                  To nie jest diagnoza ani decyzja za Ciebie. To pierwszy obraz wzorca wynikający z Twoich odpowiedzi: napięcia, asymetrii i realności zmiany.
                </div>
                <div className="metrics-grid">
                  {([[preview.tension, "NAPIĘCIE"], [preview.asymmetry, "ASYMETRIA"], [preview.change, "SZANSA ZMIANY"]] as [number, string][]).map(([value, label]) => (
                    <Glass key={label} className="metric-card"><div className="metric-value">{value}%</div><div className="metric-label">{label}</div></Glass>
                  ))}
                </div>
                <div className="preview-grid">
                  <Glass className="report-section"><div className="eyebrow">CO JUŻ WIDAĆ</div><p>{preview.summary}</p></Glass>
                  <Glass className="report-section"><div className="eyebrow">MECHANIZM</div><p>{preview.tone === "green" ? "Najmocniej działa tu jeszcze wzajemność i struktura." : preview.tone === "yellow" ? "Napięcie miesza się tu z nadzieją i przywiązaniem." : "Najmocniej pracuje tu mechanizm ulgi po napięciu i lęk przed stratą."}</p></Glass>
                  <Glass className="report-section"><div className="eyebrow">CZEGO PODGLĄD NIE ZAWIERA</div><p>{preview.paidTease}</p></Glass>
                </div>
                <Glass className="unlock-panel">
                  <div className="eyebrow">TO TYLKO FRAGMENT</div>
                  <p className="unlock-copy">Pełny raport pokazuje nie tylko wynik, ale cały mechanizm tej historii. Bez diagnozowania, bez oceniania partnera/partnerki i bez gotowej decyzji za Ciebie.</p>
                  <div className="unlock-benefits">
                    {[
                      "co naprawdę trzyma Cię w tej relacji",
                      "gdzie jest największe napięcie i koszt emocjonalny",
                      "czy problemem jest kryzys, schemat czy asymetria",
                      "co daje realną nadzieję, a co tylko ją podtrzymuje",
                      "jaki wzorzec wraca po rozmowach, obietnicach i chwilach ulgi",
                      "jedno pytanie graniczne przed decyzją"
                    ].map((item) => (
                      <div key={item} className="unlock-benefit"><span>•</span><span>{item}</span></div>
                    ))}
                  </div>
                  <div className="unlock-fineprint">Pełny raport ma 17 sekcji generowanych indywidualnie na podstawie Twoich odpowiedzi. Nie jest opinią specjalisty, diagnozą ani terapią. Jest prywatnym lustrem sytuacji.</div>
                  <div className="unlock-form">
                    <input className="ctms-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Twój adres e-mail." />
                    <PrimaryButton onClick={pay} disabled={busy}>{busy ? "Przetwarzanie..." : "Odblokuj pełny raport"}</PrimaryButton>
                  </div>
                </Glass>
                {error && <div className="error-line">{error}</div>}
                <div className="section-actions"><GhostButton onClick={goBack}>Wróć</GhostButton><GhostButton onClick={resetAll}>Od początku</GhostButton></div>
              </Glass>
            </motion.div>
          )}

          {stage === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProcessingScreen />
            </motion.div>
          )}

          {stage === "paid" && fullReport && (
            <motion.div key="paid" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="preview-card">
                <div className="eyebrow">RAPORT PREMIUM</div>
                <div className="report-head">
                  <h2>{fullReport.headline || "Ta relacja daje Ci kontakt, ale nie daje Ci oparcia."}</h2>
                  <p>{fullReport.subheadline || "Największy problem nie leży w jednym zdarzeniu..."}</p>
                </div>
                {typeof fullReport.rebuildPercent === "number" && (
                  <div className="metrics-grid">
                    {([[fullReport.rebuildPercent, "NA ILE TO MA SENS"], [fullReport.tensionPercent || 0, "NAPIĘCIE"], [fullReport.driftPercent || 0, "ASYMETRIA"]] as [number, string][]).map(([value, label]) => (
                      <Glass key={label} className="metric-card"><div className="metric-value">{value}%</div><div className="metric-label">{label}</div></Glass>
                    ))}
                  </div>
                )}
                <div className="report-sections">
                  {(fullReport.sections || []).map((section, i) => (
                    <Glass key={i} className={`report-section report-section--${section.tone || "normal"}`}>
                      <div className={`report-section-title ${section.tone || "normal"}`}>{section.title}</div>
                      <div className="report-section-text">
                        {section.text.split("\n").filter(Boolean).map((para, pi) => (
                          <p key={pi} style={{ margin: "0 0 12px 0", lineHeight: 1.75 }}>{para}</p>
                        ))}
                      </div>
                    </Glass>
                  ))}
                </div>
                {fullReport.closing && <div className="report-closing">{fullReport.closing}</div>}
                <div className="section-actions"><GhostButton onClick={resetAll}>Nowa analiza</GhostButton></div>
              </Glass>
            </motion.div>
          )}


          {stage === "error" && (
            <motion.div key="error" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="question-panel error-panel">
                <div className="eyebrow danger">STATUS RAPORTU</div>
                <h2>Raport nie jest jeszcze gotowy.</h2>
                <p className="consent-copy">
                  {error || "Nie udało się jeszcze pobrać raportu. Jeżeli płatność została pobrana, nie płać drugi raz."}
                </p>
                <p className="consent-copy" style={{ color: BRAND.muted, fontSize: "14px" }}>
                  Jeżeli płatność została pobrana, system powinien dokończyć generowanie raportu w tle i wysłać link na podany adres e-mail.
                </p>
                <div className="section-actions">
                  {sessionToken && <PrimaryButton onClick={retryPaidReport} disabled={busy}>{busy ? "Sprawdzam..." : "Sprawdź raport ponownie"}</PrimaryButton>}
                  <GhostButton onClick={resetAll}>Nowa analiza</GhostButton>
                </div>
              </Glass>
            </motion.div>
          )}


        </AnimatePresence>
      </main>

      <footer className="ctms-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap", padding: "28px 0", color: BRAND.muted, fontSize: "13px" }}>
        <div style={{ color: BRAND.gold, fontWeight: 700 }}>CzyToMaSens.</div>
        <nav style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
          {([
            ["/regulamin", "Regulamin"],
            ["/polityka-prywatnosci", "Polityka prywatności"],
            ["/rodo", "RODO"],
            ["/kontakt", "Kontakt"],
          ] as [string, string][]).map(([href, label]) => (
            <a
              key={href}
              href={href}
              style={{ color: BRAND.muted, textDecoration: "none" }}
              onClick={(event) => {
                event.preventDefault();
                setStage("landing");
                navigateTo(href);
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      </footer>

      {legalOpen && (
        <div className="ctms-modal-backdrop" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.76)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <Glass className="ctms-modal" style={{ width: "min(900px, 100%)", maxHeight: "82vh", overflow: "auto", padding: "30px" }}>
            <div className="section-head compact">
              <div>
                <div className="eyebrow">DOKUMENTY</div>
                <h2>{LEGAL_CONTENT[legalOpen].title}</h2>
              </div>
              <GhostButton onClick={() => setLegalOpen(null)}>Zamknij</GhostButton>
            </div>
            <div style={{ whiteSpace: "pre-line", color: BRAND.muted, lineHeight: 1.75, fontSize: "14px" }}>{LEGAL_CONTENT[legalOpen].body}</div>
          </Glass>
        </div>
      )}

      <CookieBanner />
    </div>
  );
}
