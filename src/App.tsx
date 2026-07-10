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
  | "question_signal"
  | "force_map"
  | "force_signal"
  | "burdens"
  | "burden_signal"
  | "truth_cards"
  | "truth_signal"
  | "short_note"
  | "map_summary"
  | "clarification"
  | "interview"
  | "open_text"
  | "preview"
  | "processing"
  | "paid"
  | "crisis"
  | "error";

type EntryKey = "unease" | "betrayal" | "uncertain" | "asymmetry" | "conflict" | "stagnation" | "returning" | "triangle" | "loop";
type Option = { id: string; label: string; score: number };
type Question = { id: string; lead: string; text: string; options: Option[] };
type AnswerMap = Record<string, string>;
type ForceMapKey = "contactInitiative" | "repairAfterConflict" | "emotionalLabor" | "avoidance" | "fearOfLoss";
type ForceValue = "definitely_me" | "mostly_me" | "balanced" | "mostly_other" | "definitely_other";
type ForceMap = Partial<Record<ForceMapKey, ForceValue>>;
type BurdenItem = { label: string; rank: number };
type ClarificationQuestion = { id: string; lead: string; text: string; signal: string };
type ClarificationAnswerMap = Record<string, string>;
type MapSignal = { label: string; value: string; tone: "normal" | "gold" | "danger" };
type RelationshipMapPayload = {
  forceMap: ForceMap;
  burdens: BurdenItem[];
  truthCards: string[];
  userNote: string;
  clarificationAnswers?: { question: string; answer: string; signal: string }[];
};
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
  whatUserKnows?: string;
  hiddenInsight?: string;
  contradiction?: string;
  concreteConclusion?: string;
  tensionMeaning?: string;
  asymmetryMeaning?: string;
  changeMeaning?: string;
  premiumSpecific?: string;
};

type FullReportSection = { title: string; text: string; tone?: "normal" | "gold" | "danger" };
type FullReport = {
  headline?: string; subheadline?: string; previewLine?: string;
  tensionPercent?: number; driftPercent?: number; rebuildPercent?: number;
  sections?: FullReportSection[]; closing?: string;
};

type InterviewExchange = { ai: string; user: string; lead?: string; observation?: string };
type LocalInterviewQuestion = { lead: string; question: string; observation?: string };
type InterviewState = {
  path: EntryKey; currentQuestion: string; currentLead: string;
  currentObservation: string; history: InterviewExchange[];
  depth: number; finished: boolean; exchangeIndex: number;
  source?: "api" | "local"; localQuestions?: LocalInterviewQuestion[]; localIndex?: number;
};

type SessionCreateResponse = { ok?: boolean; token?: string; sessionId?: string };

const STORAGE_KEY = "ctms_premium_front_v9";

const ENTRY_CONFIGS: EntryConfig[] = [
  {
    key: "unease",
    title: "Coś mi w tej relacji nie daje spokoju",
    subtitle: "Nie zawsze od razu wiadomo, o co chodzi. Ale napięcie które wraca, zwykle nie bierze się znikąd.",
    quote: `„Nie umiem tego dobrze wyjaśnić. Po prostu coś mi w tym nie daje spokoju."`,
    intro: "Dowiesz się czy problem leży w braku jasności, asymetrii, lęku przed stratą, wypaleniu czy schemacie, który dopiero zaczyna być widoczny.",
    duration: "ok. 7 minut",
    questions: [
      { id: "e1", lead: "Zacznij od miejsca, którego nie umiesz nazwać.", text: "Kiedy myślisz o tej relacji, co wraca najczęściej – spokój, niepewność, napięcie czy poczucie że coś Ci umyka?", options: [{ id: "a", label: "Napięcie i poczucie że coś jest nie tak.", score: 3 }, { id: "b", label: "Niepewność. Nie wiem na czym stoję.", score: 2 }, { id: "c", label: "Mieszane uczucia, ale nie cały czas.", score: 1 }, { id: "d", label: "Raczej spokój. Mam tylko konkretne pytania.", score: 0 }] },
      { id: "e2", lead: "Niepokój rzadko pojawia się bez powodu.", text: "Czy potrafisz wskazać konkretne zachowania tej osoby, po których zaczynasz się wycofywać, analizować albo tracić spokój?", options: [{ id: "a", label: "Tak. Jest kilka zachowań które regularnie mnie rozbijają.", score: 3 }, { id: "b", label: "Częściowo. Czuję to, ale trudno mi to nazwać.", score: 2 }, { id: "c", label: "Czasem coś mnie porusza, ale nie widzę stałego wzorca.", score: 1 }, { id: "d", label: "Nie. To bardziej moje myśli niż jej/jego zachowanie.", score: 0 }] },
      { id: "e3", lead: "Zobacz, kto w tej relacji niesie ciężar rozumienia.", text: "Kto częściej próbuje zrozumieć, nazwać i naprawić to co dzieje się między Wami?", options: [{ id: "a", label: "Głównie ja. To ja analizuję i próbuję to utrzymać.", score: 3 }, { id: "b", label: "Częściej ja, choć druga strona czasem też próbuje.", score: 2 }, { id: "c", label: "Różnie. Zależy od sytuacji.", score: 1 }, { id: "d", label: "Oboje. Nie czuję że jestem z tym sam/sama.", score: 0 }] },
      { id: "e4", lead: "Relacja może nie być zła, a jednak nie dawać oparcia.", text: "Czy przy tej osobie częściej czujesz się spokojniej, czy bardziej czujnie i ostrożnie niż kiedyś?", options: [{ id: "a", label: "Bardziej czujnie. Jakbym czekał/czekała na kolejny sygnał.", score: 3 }, { id: "b", label: "Różnie. Są dobre momenty, ale czujność wraca.", score: 2 }, { id: "c", label: "Czasem czuję napięcie, ale nie dominuje.", score: 1 }, { id: "d", label: "Raczej spokojniej. Ta osoba mnie stabilizuje.", score: 0 }] },
      { id: "e5", lead: "Przyszłość pokazuje więcej niż deklaracje.", text: "Kiedy wyobrażasz sobie Was za rok, obraz jest konkretny i spokojny, czy mglisty i pełen znaków zapytania?", options: [{ id: "a", label: "Mglisty. Nie umiem tego zobaczyć bez napięcia.", score: 3 }, { id: "b", label: "Widzę jakieś wersje, ale żadna nie daje mi pewności.", score: 2 }, { id: "c", label: "Jest trochę niepewności, ale widzę kierunek.", score: 1 }, { id: "d", label: "Widzę kierunek. Nie wszystko jest idealne, ale jest grunt.", score: 0 }] },
      { id: "e6", lead: "Ciało często wie wcześniej niż głowa.", text: "Jak reagujesz przed spotkaniem, rozmową albo wiadomością od tej osoby?", options: [{ id: "a", label: "Napięciem. Sprawdzam, przewiduję, układam w głowie scenariusze.", score: 3 }, { id: "b", label: "Często mam niepokój, choć próbuję go tłumaczyć.", score: 2 }, { id: "c", label: "Zdarza się napięcie, ale nie zawsze.", score: 1 }, { id: "d", label: "Naturalnie. Nie czuję że muszę się przygotowywać.", score: 0 }] },
      { id: "e7", lead: "Nazwij koszt, nawet jeśli nie znasz jeszcze przyczyny.", text: "Co ta relacja najczęściej robi z Tobą na co dzień?", options: [{ id: "a", label: "Rozregulowuje mnie. Myślę o niej za dużo i tracę spokój.", score: 3 }, { id: "b", label: "Męczy mnie, ale są momenty które wszystko łagodzą.", score: 2 }, { id: "c", label: "Daje i zabiera. Nie umiem tego jednoznacznie ocenić.", score: 1 }, { id: "d", label: "Raczej mnie wzmacnia, mimo trudniejszych momentów.", score: 0 }] },
      { id: "e8", lead: "Ostatnie pytanie w tej ścieżce.", text: "Gdyby ktoś z zewnątrz zobaczył tylko fakty, nie Twoje nadzieje i lęki, co mógłby zauważyć jako pierwszy?", options: [{ id: "a", label: "Że próbuję utrzymać coś, co nie daje mi spokoju.", score: 3 }, { id: "b", label: "Że jest dużo niejasności i trudno to nazwać.", score: 2 }, { id: "c", label: "Że są trudności, ale nie wszystko jest stracone.", score: 1 }, { id: "d", label: "Że to relacja z problemami, ale z realną wzajemnością.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Gdybyś miał/miała dziś nazwać jedną rzecz, która najbardziej zabiera Ci spokój w tej relacji, co byłoby najbliżej prawdy?", options: [{ id: "a", label: "Brak jasności i ciągłe analizowanie.", score: 3 }, { id: "b", label: "Nierówność. Czuję że ja bardziej to niosę.", score: 2 }, { id: "c", label: "Lęk przed stratą albo przed złą decyzją.", score: 1 }, { id: "d", label: "Konkretny problem, który da się nazwać i omówić.", score: 0 }] },
    openPrompt: "Opisz najprościej jak umiesz, co dokładnie nie daje Ci spokoju w tej relacji, nawet jeśli brzmi to chaotycznie.",
  },
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
    key: "asymmetry",
    title: "Daję więcej niż dostaję",
    subtitle: "Relacja nie musi kończyć się głośno, żeby zaczęła opierać się głównie na Tobie.",
    quote: `„Mam wrażenie, że gdybym przestał/przestała się starać, to wszystko po prostu by zgasło."`,
    intro: "Dowiesz się czy to chwilowa nierówność, czy układ w którym jedna osoba niesie relację za dwoje i coraz bardziej traci w tym siebie.",
    duration: "ok. 7 minut",
    questions: [
      { id: "a1", lead: "Zaangażowanie widać wtedy, kiedy przestajesz ciągnąć.", text: "Co dzieje się z kontaktem, atmosferą i bliskością, gdy to Ty na chwilę przestajesz inicjować?", options: [{ id: "a", label: "Prawie wszystko siada. Jakby relacja nie miała własnego napędu.", score: 3 }, { id: "b", label: "Coś się dzieje, ale wyraźnie mniej i później.", score: 2 }, { id: "c", label: "Druga strona zauważa, choć nie zawsze od razu.", score: 1 }, { id: "d", label: "Relacja dalej działa. Nie opiera się tylko na mnie.", score: 0 }] },
      { id: "a2", lead: "Nie chodzi o liczenie punktów. Chodzi o kierunek.", text: "Kto częściej naprawia atmosferę po napięciu, wraca do rozmowy i próbuje zrozumieć drugą stronę?", options: [{ id: "a", label: "Głównie ja. Bez tego temat zwykle by umarł.", score: 3 }, { id: "b", label: "Częściej ja, choć czasem druga strona też wraca.", score: 2 }, { id: "c", label: "Różnie. Nie ma jednej reguły.", score: 1 }, { id: "d", label: "Oboje. Czuję wzajemność w naprawie.", score: 0 }] },
      { id: "a3", lead: "Czasem człowiek schodzi coraz niżej i nazywa to cierpliwością.", text: "Czy zauważasz, że obniżasz swoje oczekiwania, żeby tylko ta relacja mogła dalej trwać?", options: [{ id: "a", label: "Tak. Proszę już o rzeczy, które powinny być podstawą.", score: 3 }, { id: "b", label: "Trochę tak. Tłumaczę więcej niż powinienem/powinnam.", score: 2 }, { id: "c", label: "Zdarza się, ale próbuję trzymać swoje granice.", score: 1 }, { id: "d", label: "Nie. Moje potrzeby są traktowane poważnie.", score: 0 }] },
      { id: "a4", lead: "Zobacz, kto korzysta z Twojej wyrozumiałości.", text: "Kiedy mówisz, że czegoś potrzebujesz, druga strona realnie to uwzględnia czy tylko uspokaja Cię na chwilę?", options: [{ id: "a", label: "Raczej uspokaja na chwilę. Potem wraca to samo.", score: 3 }, { id: "b", label: "Czasem próbuje, ale bez trwałości.", score: 2 }, { id: "c", label: "Widać próby, choć nie zawsze skuteczne.", score: 1 }, { id: "d", label: "Uwzględnia. Widzę realną zmianę.", score: 0 }] },
      { id: "a5", lead: "Asymetria nie zawsze wygląda jak obojętność.", text: "Czy druga strona daje Ci tyle, żebyś został/została, ale za mało, żebyś poczuł/poczuła spokój?", options: [{ id: "a", label: "Tak. To dokładnie ten układ.", score: 3 }, { id: "b", label: "Często tak to czuję, choć nie chcę tego przyznać.", score: 2 }, { id: "c", label: "Bywa tak, ale nie cały czas.", score: 1 }, { id: "d", label: "Nie. Czuję się wybierany/wybierana, nie tylko zatrzymywany/zatrzymywana.", score: 0 }] },
      { id: "a6", lead: "Sprawdź, jak wygląda odpowiedzialność.", text: "Kiedy pojawia się problem, czy druga strona umie zobaczyć swój udział bez przerzucania wszystkiego na Ciebie?", options: [{ id: "a", label: "Rzadko. Zwykle kończy się na mojej winie albo mojej przesadzie.", score: 3 }, { id: "b", label: "Czasem widzi, ale szybko się broni.", score: 2 }, { id: "c", label: "Bywa trudno, ale potrafi uznać część odpowiedzialności.", score: 1 }, { id: "d", label: "Tak. Umie zobaczyć swój udział i coś z tym zrobić.", score: 0 }] },
      { id: "a7", lead: "Największy koszt nierówności pojawia się po cichu.", text: "Kim się stajesz w tej relacji?", options: [{ id: "a", label: "Kimś bardziej proszącym, czekającym i napiętym niż chcę być.", score: 3 }, { id: "b", label: "Często tracę siebie, ale potem wracam do równowagi.", score: 2 }, { id: "c", label: "Mam trudniejsze momenty, ale nadal czuję siebie.", score: 1 }, { id: "d", label: "Jestem sobą. Ta relacja mnie nie pomniejsza.", score: 0 }] },
      { id: "a8", lead: "Odpowiedz bez usprawiedliwień.", text: "Gdybyś dawał/dawała dokładnie tyle, ile dostajesz, co stałoby się z tą relacją?", options: [{ id: "a", label: "Prawdopodobnie by się rozsypała.", score: 3 }, { id: "b", label: "Mocno by osłabła.", score: 2 }, { id: "c", label: "Byłoby trudniej, ale może coś by się wyrównało.", score: 1 }, { id: "d", label: "Niewiele. Jest w niej wzajemność.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Czy w tej relacji bardziej czujesz się wybrany/wybrana, czy potrzebny/potrzebna do tego, żeby ona w ogóle działała?", options: [{ id: "a", label: "Bardziej potrzebny/potrzebna do utrzymywania tego w całości.", score: 3 }, { id: "b", label: "Trochę wybrany/wybrana, trochę użyteczny/użyteczna.", score: 2 }, { id: "c", label: "Różnie, ale nie chcę ignorować nierówności.", score: 1 }, { id: "d", label: "Wybrany/wybrana. Nie czuję że to ja wszystko dźwigam.", score: 0 }] },
    openPrompt: "Opisz konkretnie, w czym dajesz więcej niż dostajesz i co by się stało, gdybyś przestał/przestała to ciągnąć.",
  },
  {
    key: "conflict",
    title: "Ciągle się kłócimy",
    subtitle: "Nie chodzi już o jedną sprzeczkę. Chodzi o rytm, w którym każda rozmowa może skończyć się napięciem.",
    quote: `„Nie umiemy normalnie rozmawiać. Wszystko zaraz robi się ciężkie."`,
    intro: "Dowiesz się czy to przeciążony okres, różnica stylów komunikacji, czy sposób bycia razem, który coraz bardziej niszczy bliskość.",
    duration: "ok. 7 minut",
    questions: [
      { id: "c1", lead: "Kłótnia sama w sobie nie niszczy relacji. Niszczy to, co dzieje się po niej.", text: "Po konflikcie między Wami częściej pojawia się naprawa i zrozumienie, czy cisza, dystans i kolejny ślad na później?", options: [{ id: "a", label: "Cisza, dystans albo kolejny ślad. Naprawy prawie nie ma.", score: 3 }, { id: "b", label: "Czasem jest naprawa, ale napięcie zostaje.", score: 2 }, { id: "c", label: "Bywa różnie. Nie zawsze umiemy to domknąć.", score: 1 }, { id: "d", label: "Zwykle umiemy wrócić do siebie po konflikcie.", score: 0 }] },
      { id: "c2", lead: "Zobacz, czy kłócicie się o temat, czy o siebie.", text: "Czy Wasze kłótnie dotyczą konkretnych spraw, czy szybko zamieniają się w atak, obronę i wypominanie wszystkiego naraz?", options: [{ id: "a", label: "Szybko idzie w atak, obronę i stare rzeczy.", score: 3 }, { id: "b", label: "Często odpływamy od tematu.", score: 2 }, { id: "c", label: "Zdarza się, ale umiemy czasem wrócić do sedna.", score: 1 }, { id: "d", label: "Zwykle trzymamy się konkretu.", score: 0 }] },
      { id: "c3", lead: "Najważniejsze jest to, czy w konflikcie nadal jesteście po jednej stronie.", text: "Kiedy się kłócicie, czujesz że walczycie z problemem, czy przeciwko sobie?", options: [{ id: "a", label: "Przeciwko sobie. Jakby ktoś musiał wygrać.", score: 3 }, { id: "b", label: "Często tak, choć potem tego żałujemy.", score: 2 }, { id: "c", label: "Bywa ostro, ale czasem wracamy do problemu.", score: 1 }, { id: "d", label: "Raczej z problemem. Nie przeciwko sobie.", score: 0 }] },
      { id: "c4", lead: "Napięcie przed rozmową też jest informacją.", text: "Czy boisz się zaczynać ważne tematy, bo wiesz, że może z tego wyjść kolejna awantura?", options: [{ id: "a", label: "Tak. Często wolę milczeć niż uruchomić konflikt.", score: 3 }, { id: "b", label: "Często się waham, bo wiem jak może się skończyć.", score: 2 }, { id: "c", label: "Czasem, ale nie zawsze.", score: 1 }, { id: "d", label: "Nie. Trudne tematy nie muszą kończyć się awanturą.", score: 0 }] },
      { id: "c5", lead: "Sprawdź, czy konflikt ma granice.", text: "Czy w kłótniach pojawiają się słowa albo zachowania, po których trudno wrócić do normalności?", options: [{ id: "a", label: "Tak. Padają rzeczy, które długo we mnie zostają.", score: 3 }, { id: "b", label: "Zdarza się, choć potem ktoś przeprasza.", score: 2 }, { id: "c", label: "Rzadko, ale granice bywają naruszane.", score: 1 }, { id: "d", label: "Nie. Nawet w konflikcie są granice.", score: 0 }] },
      { id: "c6", lead: "Niektóre pary nie rozwiązują konfliktów. Tylko robią przerwę między nimi.", text: "Czy macie poczucie, że naprawdę rozwiązujecie problemy, czy raczej wracacie do względnego spokoju aż do następnego wybuchu?", options: [{ id: "a", label: "Raczej przerwa między wybuchami. Tematy wracają.", score: 3 }, { id: "b", label: "Część rzeczy wraca, choć próbujemy je zamykać.", score: 2 }, { id: "c", label: "Nie wszystko rozwiązujemy, ale coś się zmienia.", score: 1 }, { id: "d", label: "Rozwiązujemy problemy, nie tylko je przeczekujemy.", score: 0 }] },
      { id: "c7", lead: "Zobacz, jak wygląda Wasz kontakt w spokojniejsze dni.", text: "Kiedy akurat się nie kłócicie, jest między Wami ciepło i normalność, czy raczej napięcie wisi w tle?", options: [{ id: "a", label: "Napięcie wisi w tle prawie cały czas.", score: 3 }, { id: "b", label: "Bywa spokojnie, ale czuję że to kruche.", score: 2 }, { id: "c", label: "Są normalne chwile, choć nie zawsze lekkie.", score: 1 }, { id: "d", label: "Jest ciepło. Konflikty nie zabierają wszystkiego.", score: 0 }] },
      { id: "c8", lead: "Ostatnie pytanie. Bez wybielania.", text: "Gdyby nic się nie zmieniło w sposobie Waszych kłótni, co zrobiłoby to z relacją za rok?", options: [{ id: "a", label: "Mogłoby ją zniszczyć albo już ją niszczy.", score: 3 }, { id: "b", label: "Będzie coraz ciężej i coraz mniej blisko.", score: 2 }, { id: "c", label: "Byłoby trudno, ale może jeszcze do odwrócenia.", score: 1 }, { id: "d", label: "Nie widzę aż takiego ryzyka.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Czy Wasze kłótnie bardziej oczyszczają relację, czy zostawiają w niej coraz więcej rzeczy, których potem nikt nie umie naprawić?", options: [{ id: "a", label: "Zostawiają ślady. Coraz trudniej wrócić do bliskości.", score: 3 }, { id: "b", label: "Czasem oczyszczają, ale coraz częściej ranią.", score: 2 }, { id: "c", label: "Różnie. Widzę i ryzyko, i potencjał.", score: 1 }, { id: "d", label: "Oczyszczają. Po nich zwykle jest więcej jasności.", score: 0 }] },
    openPrompt: "Opisz typową kłótnię między Wami: od czego się zaczyna, gdzie wymyka się spod kontroli i co zostaje po niej później.",
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

const FORCE_MAP_ITEMS: { key: ForceMapKey; title: string; hint: string }[] = [
  { key: "contactInitiative", title: "Kto częściej inicjuje kontakt?", hint: "Nie chodzi o jedną wiadomość, tylko o rytm relacji." },
  { key: "repairAfterConflict", title: "Kto częściej naprawia po konflikcie?", hint: "Kto wraca do rozmowy, łagodzi napięcie albo próbuje domknąć temat." },
  { key: "emotionalLabor", title: "Kto niesie większy ciężar emocjonalny?", hint: "Kto więcej analizuje, tłumaczy, czeka, pilnuje atmosfery." },
  { key: "avoidance", title: "Kto częściej unika trudnych rozmów?", hint: "Wskaż stronę, która częściej odsuwa temat albo znika w ciszę." },
  { key: "fearOfLoss", title: "Kto bardziej boi się utraty tej relacji?", hint: "Nie kto bardziej kocha, tylko kto bardziej boi się konsekwencji końca." },
];

const FORCE_OPTIONS: { value: ForceValue; label: string }[] = [
  { value: "definitely_me", label: "Zdecydowanie ja" },
  { value: "mostly_me", label: "Raczej ja" },
  { value: "balanced", label: "Po równo" },
  { value: "mostly_other", label: "Raczej druga osoba" },
  { value: "definitely_other", label: "Zdecydowanie druga osoba" },
];

const BURDEN_OPTIONS = [
  "brak jasności",
  "kłótnie",
  "cisza",
  "nierówne starania",
  "rutyna / wypalenie",
  "zdrada / kłamstwo",
  "ktoś trzeci",
  "brak bliskości",
  "powroty i rozstania",
  "lęk przed samotnością",
  "kontrola / zazdrość",
  "finanse / codzienność",
  "rodzina / presja z zewnątrz",
  "seks / intymność",
];

const TRUTH_CARD_OPTIONS = [
  "Gdybym przestał/przestała się starać, ta relacja by zgasła.",
  "Po każdej poprawie wracamy w to samo miejsce.",
  "Bardziej boję się końca niż wierzę w zmianę.",
  "Najlepsze momenty zasłaniają mi to, co dzieje się najczęściej.",
  "Ta relacja daje mi emocje, ale nie daje mi oparcia.",
  "Nie wiem, czy chcę tej osoby, czy chcę żeby ta historia miała sens.",
  "Czekam na jasność od kogoś, kto od dawna korzysta z mojego czekania.",
  "Mam więcej nadziei niż faktów, które tę nadzieję potwierdzają.",
];

function forceLabel(value?: ForceValue): string {
  return FORCE_OPTIONS.find((item) => item.value === value)?.label || "Nie zaznaczono";
}

function mapCompletion(forceMap: ForceMap, burdens: BurdenItem[], truthCards: string[]): number {
  const forceDone = FORCE_MAP_ITEMS.filter((item) => Boolean(forceMap[item.key])).length;
  return Math.round(((forceDone / FORCE_MAP_ITEMS.length) * 0.45 + (Math.min(burdens.length, 3) / 3) * 0.3 + (Math.min(truthCards.length, 2) / 2) * 0.25) * 100);
}

function isMeHeavy(value?: ForceValue): boolean {
  return value === "definitely_me" || value === "mostly_me";
}

function isOtherHeavy(value?: ForceValue): boolean {
  return value === "definitely_other" || value === "mostly_other";
}

function hasBurden(burdens: BurdenItem[], fragment: string): boolean {
  return burdens.some((item) => item.label.toLowerCase().includes(fragment.toLowerCase()));
}

function buildMapSignals(forceMap: ForceMap, burdens: BurdenItem[], truthCards: string[]): MapSignal[] {
  const meLoad = FORCE_MAP_ITEMS.filter((item) => isMeHeavy(forceMap[item.key])).length;
  const otherLoad = FORCE_MAP_ITEMS.filter((item) => isOtherHeavy(forceMap[item.key])).length;
  const topBurden = burdens[0]?.label || "brak jednego dominującego ciężaru";
  const asymmetry = meLoad >= 3 ? "ciężar częściej po Twojej stronie" : otherLoad >= 3 ? "ciężar częściej po stronie drugiej osoby" : "układ częściowo zrównoważony";
  const risk = truthCards.some((text) => text.includes("wracamy w to samo")) || hasBurden(burdens, "powroty") ? "powtarzanie tego samego cyklu" :
    truthCards.some((text) => text.includes("boję się końca")) || hasBurden(burdens, "lęk") ? "lęk może mieszać się z decyzją" :
    hasBurden(burdens, "cisza") ? "cisza może zastępować naprawę" :
    hasBurden(burdens, "zdrada") ? "zaufanie wymaga konkretów, nie samych deklaracji" :
    "trzeba odróżnić realną zmianę od chwilowej ulgi";
  const focus = meLoad >= 3 ? "czy relacja działa bez Twojego ciągnięcia" :
    hasBurden(burdens, "brak jasności") ? "czy brak jasności jest przypadkiem, czy wygodnym stanem" :
    hasBurden(burdens, "kłótnie") ? "co zostaje po konflikcie" :
    hasBurden(burdens, "rutyna") ? "czy to spokój, czy rezygnacja" :
    "co naprawdę musi się zmienić w zachowaniu";

  return [
    { label: "Największy ciężar", value: topBurden, tone: burdens.length ? "gold" : "normal" },
    { label: "Układ sił", value: asymmetry, tone: meLoad >= 3 || otherLoad >= 3 ? "danger" : "normal" },
    { label: "Punkt ryzyka", value: risk, tone: "danger" },
    { label: "Do doprecyzowania", value: focus, tone: "gold" },
  ];
}


type VisualBar = { label: string; value: number; text: string; tone?: "normal" | "gold" | "danger" | "green" };

function clampScore(value: number): number {
  return Math.max(5, Math.min(95, Math.round(value)));
}

function buildMapVisualBars(forceMap: ForceMap, burdens: BurdenItem[], truthCards: string[]): VisualBar[] {
  const meLoad = FORCE_MAP_ITEMS.filter((item) => isMeHeavy(forceMap[item.key])).length;
  const otherLoad = FORCE_MAP_ITEMS.filter((item) => isOtherHeavy(forceMap[item.key])).length;
  const imbalance = Math.max(meLoad, otherLoad);
  const highRiskBurden = hasBurden(burdens, "cisza") || hasBurden(burdens, "kłótnie") || hasBurden(burdens, "zdrada") || hasBurden(burdens, "powroty") || hasBurden(burdens, "brak jasności");
  const loopSignal = truthCards.some((text) => text.includes("wracamy") || text.includes("nadziei") || text.includes("czekam"));
  const tension = clampScore(34 + burdens.length * 12 + truthCards.length * 9 + (highRiskBurden ? 12 : 0));
  const asymmetry = clampScore(28 + imbalance * 13 + (meLoad >= 3 || otherLoad >= 3 ? 18 : 0));
  const clarityLoss = (hasBurden(burdens, "brak jasności") ? 28 : 0) + (loopSignal ? 16 : 0) + burdens.length * 5;
  const clarity = clampScore(82 - clarityLoss);
  const change = clampScore(72 - tension * 0.28 - asymmetry * 0.22 - (loopSignal ? 18 : 0) + (clarity > 60 ? 10 : 0));

  return [
    { label: "Napięcie", value: tension, tone: tension >= 70 ? "danger" : tension >= 45 ? "gold" : "green", text: tension >= 70 ? "relacja mocno rozregulowuje" : "napięcie jest widoczne, ale wymaga doprecyzowania" },
    { label: "Asymetria", value: asymmetry, tone: asymmetry >= 70 ? "danger" : asymmetry >= 45 ? "gold" : "green", text: asymmetry >= 70 ? "ciężar nie rozkłada się równo" : "układ sił nie jest jeszcze jednoznaczny" },
    { label: "Jasność", value: clarity, tone: clarity <= 35 ? "danger" : clarity <= 60 ? "gold" : "green", text: clarity <= 35 ? "za dużo rzeczy zostaje bez nazwania" : "część obrazu jest już czytelna" },
    { label: "Zmiana", value: change, tone: change <= 35 ? "danger" : change <= 58 ? "gold" : "green", text: change <= 35 ? "widać więcej cyklu niż przełomu" : "potencjał wymaga sprawdzenia w faktach" },
  ];
}

function buildPreviewVisualBars(preview: Preview): VisualBar[] {
  const clarity = clampScore(100 - Math.max(preview.tension * 0.45, preview.asymmetry * 0.55));
  return [
    { label: "Napięcie", value: preview.tension, tone: preview.tension >= 70 ? "danger" : preview.tension >= 45 ? "gold" : "green", text: preview.tension >= 70 ? "relacja częściej uruchamia czujność niż spokój" : "napięcie jest obecne, ale nie musi dominować" },
    { label: "Asymetria", value: preview.asymmetry, tone: preview.asymmetry >= 70 ? "danger" : preview.asymmetry >= 45 ? "gold" : "green", text: preview.asymmetry >= 70 ? "jedna strona prawdopodobnie niesie więcej ciężaru" : "nierównowaga wymaga dalszego odczytu" },
    { label: "Jasność", value: clarity, tone: clarity <= 35 ? "danger" : clarity <= 60 ? "gold" : "green", text: clarity <= 35 ? "za dużo pozostaje w domysłach" : "część sytuacji daje się już nazwać" },
    { label: "Zmiana", value: preview.change, tone: preview.change <= 35 ? "danger" : preview.change <= 58 ? "gold" : "green", text: preview.change <= 35 ? "na razie słabiej widać trwały zwrot" : "jest przestrzeń do sprawdzenia potencjału" },
  ];
}

function buildCycleSteps(pathKey?: EntryKey, burdens: BurdenItem[] = [], truthCards: string[] = []): string[] {
  if (pathKey === "betrayal" || hasBurden(burdens, "zdrada")) return ["pęknięcie", "kontrola", "chwilowa ulga", "powrót nieufności"];
  if (pathKey === "conflict" || hasBurden(burdens, "kłótnie")) return ["napięcie", "konflikt", "cisza", "powrót wzorca"];
  if (pathKey === "uncertain" || hasBurden(burdens, "brak jasności")) return ["kontakt", "nadzieja", "niejasność", "czekanie"];
  if (pathKey === "loop" || hasBurden(burdens, "powroty") || truthCards.some((text) => text.includes("wracamy"))) return ["oddalenie", "tęsknota", "powrót", "ten sam problem"];
  if (pathKey === "asymmetry" || hasBurden(burdens, "nierówne")) return ["staranie", "brak odpowiedzi", "dopasowanie", "zmęczenie"];
  return ["sygnał", "napięcie", "doprecyzowanie", "wniosek"];
}

function VisualBars({ items }: { items: VisualBar[] }) {
  return (
    <div className="visual-bars">
      {items.map((item) => (
        <div key={item.label} className={`visual-bar-item ${item.tone || "normal"}`}>
          <div className="visual-bar-head"><strong>{item.label}</strong><span>{item.value}%</span></div>
          <div className="visual-bar-track"><div className="visual-bar-fill" style={{ width: `${item.value}%` }} /></div>
          <div className="visual-bar-text">{item.text}</div>
        </div>
      ))}
    </div>
  );
}

function cycleStepDescription(step: string): string {
  const normalized = step.toLowerCase();
  const descriptions: Record<string, string> = {
    "kontakt": "jest punkt zaczepienia",
    "napięcie do udźwignięcia": "problem nie musi dominować",
    "rozmowa": "jest przestrzeń na nazwanie sprawy",
    "równowaga": "możliwy powrót do spokoju",
    "różnica": "nie wszystko musi oznaczać kryzys",
    "naprawa": "ważne jest konkretne zachowanie",
    "powrót równowagi": "relacja może się regulować",
    "trudność": "coś wymaga nazwania",
    "nazwanie": "problem robi się czytelniejszy",
    "współpraca": "liczy się udział obu stron",
    "kierunek": "widać następny krok",
    "działa": "są elementy, które trzymają układ",
    "obciąża": "jest koszt, którego nie warto pomijać",
    "wymaga sprawdzenia": "bez doprecyzowania łatwo o zły wniosek",
    "wniosek": "dopiero całość pokaże obraz",
    "bliskość": "jest coś, co nadal przyciąga",
    "ciężar": "jednocześnie pojawia się obciążenie",
    "próba naprawy": "jest ruch w stronę poprawy",
    "niepewność": "nie wszystko daje stabilny grunt",
    "pęknięcie": "coś naruszyło zaufanie",
    "kontrola": "pojawia się potrzeba sprawdzania",
    "chwilowa ulga": "napięcie spada tylko na moment",
    "powrót nieufności": "stary lęk wraca do układu",
    "napięcie": "koszt emocjonalny rośnie",
    "konflikt": "spór zastępuje rozmowę",
    "cisza": "brak naprawy utrwala dystans",
    "powrót wzorca": "problem wraca w podobnej formie",
    "nadzieja": "pojawia się oczekiwanie zmiany",
    "niejasność": "brakuje stabilnej odpowiedzi",
    "czekanie": "decyzja zostaje odłożona",
    "oddalenie": "kontakt słabnie",
    "tęsknota": "brak zaczyna działać jak magnes",
    "powrót": "relacja znów się zbliża",
    "ten sam problem": "wraca coś, co nie zostało domknięte",
    "staranie": "jedna strona mocno inwestuje",
    "brak odpowiedzi": "druga strona nie daje podobnego ruchu",
    "dopasowanie": "pojawia się schodzenie z własnych potrzeb",
    "zmęczenie": "koszt zaczyna być widoczny",
    "sygnał": "coś zaczyna się powtarzać",
    "doprecyzowanie": "jedna rzecz może zmienić odczyt",
  };
  return descriptions[normalized] || "ten element dopowie dalsza część analizy";
}

function CycleDiagram({ steps }: { steps: string[] }) {
  return (
    <div className="cycle-diagram" aria-label="Możliwy układ relacji">
      {steps.map((step, index) => (
        <React.Fragment key={`${step}-${index}`}>
          <div className="cycle-step">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step}</strong>
            <em>{cycleStepDescription(step)}</em>
          </div>
          {index < steps.length - 1 && <div className="cycle-arrow">↓</div>}
        </React.Fragment>
      ))}
    </div>
  );
}


type InsightMode = "supportive" | "mixed" | "difficult";
type PauseVariant = "questions" | "force" | "burdens" | "truth";

type PauseInsight = {
  mode: InsightMode;
  eyebrow: string;
  title: string;
  text: string;
  takeaway?: string;
  notProof?: string;
  bars: VisualBar[];
  chips?: string[];
  cycle?: string[];
  quote?: string;
};

function averageQuestionScore(path: EntryConfig | null, answers: AnswerMap): number {
  if (!path) return 1.5;
  const scores = path.questions
    .map((q) => q.options.find((opt) => opt.id === answers[q.id])?.score)
    .filter((v): v is number => typeof v === "number");
  const checkpointScore = path.checkpoint.options.find((opt) => opt.id === answers[`${path.key}_checkpoint`])?.score;
  if (typeof checkpointScore === "number") scores.push(checkpointScore);
  if (!scores.length) return 1.5;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function relationshipMode(path: EntryConfig | null, answers: AnswerMap, forceMap: ForceMap, burdens: BurdenItem[], truthCards: string[]): InsightMode {
  const avg = averageQuestionScore(path, answers);
  const meLoad = FORCE_MAP_ITEMS.filter((item) => isMeHeavy(forceMap[item.key])).length;
  const otherLoad = FORCE_MAP_ITEMS.filter((item) => isOtherHeavy(forceMap[item.key])).length;
  const imbalance = Math.max(meLoad, otherLoad);
  const hardBurdenCount = burdens.filter((b) => /zdrada|kłamstwo|cisza|kłótnie|powroty|rozstania|ktoś trzeci|brak jasności|nierówne/i.test(b.label)).length;
  const hardTruth = truthCards.some((t) => /wracamy|boję się końca|czekam|zgasła|nie daje mi oparcia/i.test(t));
  if (avg <= 0.95 && imbalance <= 1 && hardBurdenCount <= 1 && !hardTruth) return "supportive";
  if (avg >= 2.05 || imbalance >= 3 || hardBurdenCount >= 2 || hardTruth) return "difficult";
  return "mixed";
}

function modeLabel(mode: InsightMode): string {
  if (mode === "supportive") return "sporo gruntu";
  if (mode === "difficult") return "wymaga uwagi";
  return "mieszany sygnał";
}

function buildAdaptiveBars(mode: InsightMode, variant: PauseVariant, path: EntryConfig | null, answers: AnswerMap, forceMap: ForceMap, burdens: BurdenItem[], truthCards: string[]): VisualBar[] {
  const avg = averageQuestionScore(path, answers);
  const questionRisk = clampScore(18 + avg * 25);
  const questionStrength = clampScore(88 - avg * 21);
  const forceBars = buildMapVisualBars(forceMap, burdens, truthCards);

  if (variant === "questions") {
    if (mode === "supportive") return [
      { label: "Spokój", value: questionStrength, tone: "green", text: "odpowiedzi częściej pokazują możliwość rozmowy niż chaos" },
      { label: "Trudność", value: questionRisk, tone: questionRisk > 55 ? "gold" : "green", text: "jest temat do sprawdzenia, ale nie wygląda na cały obraz" },
      { label: "Grunt", value: clampScore(questionStrength - 6), tone: "green", text: "widać coś, na czym można oprzeć dalszy odczyt" },
    ];
    if (mode === "difficult") return [
      { label: "Koszt", value: questionRisk, tone: "danger", text: "odpowiedzi pokazują, że sytuacja zabiera sporo spokoju" },
      { label: "Jasność", value: clampScore(100 - questionRisk), tone: "danger", text: "część spraw zostaje domyślana zamiast nazwana" },
      { label: "Ruch", value: clampScore(82 - questionRisk), tone: "gold", text: "trzeba sprawdzić, czy zmieniają się zachowania, nie tylko nastrój" },
    ];
    return [
      { label: "Działa", value: clampScore(questionStrength), tone: "green", text: "są elementy, które mogą dawać tej relacji oparcie" },
      { label: "Męczy", value: clampScore(questionRisk), tone: "gold", text: "jest też koszt, którego nie da się pominąć" },
      { label: "Niejasne", value: clampScore(60 - avg * 8), tone: "gold", text: "trzeba oddzielić fakty od nadziei i domysłów" },
    ];
  }

  if (variant === "force") return forceBars.slice(0, 3).map((bar) => ({
    ...bar,
    text: bar.label.toLowerCase().includes("napraw")
      ? "chodzi o to, kto wraca do rozmowy i bierze sprawę na siebie"
      : bar.label.toLowerCase().includes("inicj")
        ? "chodzi o to, kto częściej robi pierwszy ruch"
        : bar.text
  }));

  if (variant === "burdens") {
    const base = burdens.slice(0, 3);
    if (!base.length) return [{ label: "Brak jednego ciężaru", value: 35, tone: "green", text: "problem może być sytuacyjny albo jeszcze za słabo nazwany" }];
    return base.map((b, i) => ({
      label: `${b.rank}. ${b.label}`,
      value: clampScore(92 - i * 18),
      tone: mode === "supportive" ? "green" : mode === "difficult" ? "danger" : "gold",
      text: i === 0 ? "to nie jest wniosek, tylko miejsce które najmocniej wpływa na dalsze pytania" : "to dopowiada, gdzie relacja traci lekkość albo jasność"
    }));
  }

  return buildPreviewVisualBars({ chance: 50, tension: forceBars[0]?.value || questionRisk, asymmetry: forceBars[1]?.value || 50, change: forceBars[3]?.value || questionStrength, badge: "", headline: "", truth: "", mirror: "", summary: "", paidTease: "", tone: "yellow" }).slice(0, 3);
}

function buildAdaptiveCycle(mode: InsightMode, variant: PauseVariant, pathKey?: EntryKey, burdens: BurdenItem[] = [], truthCards: string[] = []): string[] {
  if (mode === "supportive") {
    if (variant === "force") return ["różnica", "rozmowa", "naprawa", "powrót równowagi"];
    if (variant === "burdens") return ["trudność", "nazwanie", "współpraca", "kierunek"];
    return ["kontakt", "napięcie do udźwignięcia", "rozmowa", "równowaga"];
  }
  if (mode === "mixed") {
    if (variant === "burdens") return ["bliskość", "ciężar", "próba naprawy", "niepewność"];
    return ["działa", "obciąża", "wymaga sprawdzenia", "wniosek"];
  }
  return buildCycleSteps(pathKey, burdens, truthCards);
}

function buildPauseInsight(variant: PauseVariant, path: EntryConfig | null, answers: AnswerMap, forceMap: ForceMap, burdens: BurdenItem[], truthCards: string[]): PauseInsight {
  const mode = relationshipMode(path, answers, forceMap, burdens, truthCards);
  const bars = buildAdaptiveBars(mode, variant, path, answers, forceMap, burdens, truthCards);
  const cycle = buildAdaptiveCycle(mode, variant, path?.key, burdens, truthCards);
  const topBurden = burdens[0]?.label;
  const truth = truthCards[0];

  if (variant === "questions") {
    if (mode === "supportive") return {
      mode, eyebrow: "PO PIERWSZYCH ODPOWIEDZIACH",
      title: "Na razie nie widać, żeby problem przykrywał całą relację",
      text: "To nie jest pochwała ani werdykt. Pierwsze odpowiedzi pokazują, że obok trudności może być też kontakt, rozmowa albo coś, co nadal daje oparcie.",
      takeaway: "Dalsze kroki sprawdzą, czy ten grunt jest realny w zachowaniu, nie tylko w deklaracjach.",
      notProof: "To jeszcze nie znaczy, że wszystko jest dobrze.",
      bars, cycle
    };
    if (mode === "difficult") return {
      mode, eyebrow: "PO PIERWSZYCH ODPOWIEDZIACH",
      title: "Pierwszy sygnał jest taki: ta sytuacja kosztuje sporo spokoju",
      text: "Nie chodzi o to, że jedna odpowiedź przesądza wynik. Chodzi o to, że kilka odpowiedzi idzie w podobną stronę: więcej napięcia, domysłów albo czekania niż stabilności.",
      takeaway: "Teraz trzeba sprawdzić, czy ten koszt wynika z chwilowego kryzysu, czy z czegoś, co wraca regularnie.",
      notProof: "To nie jest jeszcze decyzja, że relacja nie ma sensu.",
      bars, cycle
    };
    return {
      mode, eyebrow: "PO PIERWSZYCH ODPOWIEDZIACH",
      title: "Tu nie wychodzi proste „dobrze” albo „źle”",
      text: "W odpowiedziach są jednocześnie rzeczy, które mogą trzymać relację, i takie, które ją obciążają. Dlatego wynik nie powinien iść na skróty.",
      takeaway: "Dalej sprawdzimy, kto co niesie i co powtarza się najczęściej.",
      notProof: "To nie jest jeszcze gotowy wniosek, tylko kierunek dalszego sprawdzania.",
      bars, cycle
    };
  }

  if (variant === "force") {
    if (mode === "supportive") return {
      mode, eyebrow: "PO UKŁADZIE SIŁ",
      title: "Ciężar nie wygląda na oczywiście jednostronny",
      text: "To ważne, bo relacja może mieć trudne miejsca, a mimo to nie opierać się wyłącznie na wysiłku jednej osoby.",
      takeaway: "Wynik będzie dalej sprawdzał, czy ta względna równowaga utrzymuje się też przy konfliktach i decyzjach.",
      notProof: "To nie unieważnia problemów, tylko pokazuje, że nie wszystko trzeba czytać jako brak wzajemności.",
      bars, cycle
    };
    if (mode === "difficult") return {
      mode, eyebrow: "PO UKŁADZIE SIŁ",
      title: "Najmocniej widać pytanie: kto naprawdę dźwiga tę relację",
      text: "Jeśli jedna osoba częściej zaczyna rozmowę, naprawia po konflikcie albo pilnuje kontaktu, problem nie leży tylko w uczuciach. Leży też w podziale ciężaru.",
      takeaway: "Dalszy wynik powinien sprawdzić, czy druga strona odpowiada działaniem, czy tylko chwilową obecnością.",
      notProof: "To nie jest ocena partnera. To sprawdzenie, jak rozkłada się odpowiedzialność.",
      bars, cycle
    };
    return {
      mode, eyebrow: "PO UKŁADZIE SIŁ",
      title: "Równowaga nie jest pełna, ale nie wszystko jest po jednej stronie",
      text: "To sygnał mieszany. Część ciężaru może być po Twojej stronie, ale nie widać jeszcze, czy to stały układ, czy reakcja na konkretny etap.",
      takeaway: "Następny krok pokaże, co najbardziej obciąża tę relację w praktyce.",
      notProof: "To nie jest jeszcze dowód na jednostronność.",
      bars, cycle
    };
  }

  if (variant === "burdens") {
    if (mode === "supportive") return {
      mode, eyebrow: "PO WYBORZE CIĘŻARÓW",
      title: topBurden ? `Najbardziej trzeba nazwać: ${topBurden}` : "Nie ma jednego ciężaru, który przykrywa wszystko",
      text: topBurden ? "To wygląda bardziej jak temat do uporządkowania niż automatyczny dowód, że relacja jest zła." : "Czasem problem nie jest jednym wielkim ciężarem, tylko kilkoma drobnymi napięciami, które zbierają się po czasie.",
      takeaway: "Wynik nie powinien robić z tego dramatu, jeśli odpowiedzi pokazują też współpracę i kontakt.",
      notProof: "Samo wskazanie ciężaru nie mówi jeszcze, czy druga strona chce i potrafi coś zmienić.",
      bars, cycle, chips: burdens.map((b) => b.label)
    };
    if (mode === "difficult") return {
      mode, eyebrow: "PO WYBORZE CIĘŻARÓW",
      title: topBurden ? `${topBurden} nie jest tylko etykietą problemu` : "Ciężar zaczyna ustawiać dalszy odczyt",
      text: "Najważniejsze nie jest samo słowo, które zaznaczyłeś. Ważniejsze jest to, czy ten temat wraca, zmienia Twoje zachowanie i zostawia Cię z większym kosztem niż drugą stronę.",
      takeaway: "Dalsze pytanie ma sprawdzić konkretną sytuację z życia, żeby raport nie powtórzył tylko zaznaczenia.",
      notProof: "To jeszcze nie mówi, kto jest winny. Mówi, gdzie trzeba szukać faktów.",
      bars, cycle, chips: burdens.map((b) => b.label)
    };
    return {
      mode, eyebrow: "PO WYBORZE CIĘŻARÓW",
      title: topBurden ? `Najmocniej wraca temat: ${topBurden}` : "Ciężar nie jest jeszcze jednoznaczny",
      text: "Ten wybór jest punktem zaczepienia, nie gotowym raportem. Trzeba jeszcze sprawdzić, czy to chwilowe napięcie, czy coś, co powtarza się w podobny sposób.",
      takeaway: "Raport powinien z tego wyciągnąć wniosek, a nie przepisać nazwę zaznaczonego kafelka.",
      notProof: "Sama nazwa problemu nie wystarczy do uczciwej oceny.",
      bars, cycle, chips: burdens.map((b) => b.label)
    };
  }

  if (mode === "supportive") return {
    mode, eyebrow: "PO MOMENCIE PRAWDY",
    title: "To zdanie nie musi oznaczać końca",
    text: "Może pokazywać miejsce, które domaga się rozmowy, a nie dowód, że wszystko się rozsypuje.",
    takeaway: "Jeśli w odpowiedziach jest wzajemność, wynik ma ją pokazać uczciwie.",
    notProof: "Jedno mocne zdanie nie powinno przykrywać całego obrazu.",
    bars, cycle, quote: truth
  };
  if (mode === "difficult") return {
    mode, eyebrow: "PO MOMENCIE PRAWDY",
    title: "To zdanie może pokazywać coś, czego nie chcesz już omijać",
    text: "Nie dlatego, że samo zdanie przesądza o relacji. Dlatego, że często trafia dokładnie tam, gdzie człowiek przestał już wierzyć własnym tłumaczeniom.",
    takeaway: "Ostatnie pytania mają sprawdzić fakt z życia, a nie tylko Twoje odczucie.",
    notProof: "To nadal nie jest wyrok. To wskazanie miejsca do sprawdzenia.",
    bars, cycle, quote: truth
  };
  return {
    mode, eyebrow: "PO MOMENCIE PRAWDY",
    title: "To jest punkt do rozróżnienia, nie gotowa odpowiedź",
    text: "Wybrane zdanie pomaga zobaczyć, gdzie miesza się realny problem, lęk, przywiązanie albo zmęczenie.",
    takeaway: "Dlatego na końcu dopytamy o konkret, który może zmienić odczyt.",
    notProof: "Nie będziemy udawać pewności tam, gdzie jej jeszcze nie ma.",
    bars, cycle, quote: truth
  };
}

function PauseInsightPanel({ insight, onBack, onNext, nextLabel = "Dalej →" }: { insight: PauseInsight; onBack: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <motion.div key={`${insight.eyebrow}-${insight.title}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="section-head compact">
        <div>
          <div className="eyebrow">{insight.eyebrow}</div>
          <h2>{insight.title}</h2>
          <p>{insight.text}</p>
        </div>
        <div className={`mode-pill ${insight.mode}`}>{modeLabel(insight.mode)}</div>
      </div>
      <Glass className={`question-panel relationship-map-panel pause-panel ${insight.mode}`}>
        {insight.quote && <div className="pause-quote">„{insight.quote}”</div>}
        <div className="pause-grid">
          <div className="pause-visual-card">
            <div className="eyebrow">CO TO MOŻE OZNACZAĆ</div>
            <VisualBars items={insight.bars} />
          </div>
          <div className="pause-visual-card">
            <div className="eyebrow">CZEGO JESZCZE NIE WIEMY</div>
            <CycleDiagram steps={insight.cycle || []} />
            {insight.chips && insight.chips.length > 0 && (
              <div className="pause-chip-row">
                {insight.chips.map((chip) => <span key={chip}>{chip}</span>)}
              </div>
            )}
          </div>
        </div>
        <div className="pause-explain-grid">
          {insight.takeaway && <div><span>Wniosek na teraz</span><strong>{insight.takeaway}</strong></div>}
          {insight.notProof && <div><span>To jeszcze nie znaczy</span><strong>{insight.notProof}</strong></div>}
        </div>
        <div className="section-actions">
          <GhostButton onClick={onBack}>Wróć</GhostButton>
          <PrimaryButton onClick={onNext}>{nextLabel}</PrimaryButton>
        </div>
      </Glass>
    </motion.div>
  );
}

function uniqueClarifications(items: ClarificationQuestion[]): ClarificationQuestion[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function buildClarificationQuestions(path: EntryConfig, forceMap: ForceMap, burdens: BurdenItem[], truthCards: string[], note: string): ClarificationQuestion[] {
  const candidates: ClarificationQuestion[] = [];
  const meLoad = FORCE_MAP_ITEMS.filter((item) => isMeHeavy(forceMap[item.key])).length;

  if (meLoad >= 3 || isMeHeavy(forceMap.repairAfterConflict) || isMeHeavy(forceMap.emotionalLabor)) {
    candidates.push({ id: "asymmetry-reality", signal: "Kto ciągnie kontakt", lead: "Nie pytamy, kto bardziej kocha. Pytamy, co dzieje się, gdy Ty na chwilę przestajesz ciągnąć temat.", text: "Gdybyś przez kilka dni nie zaczynał/zaczynała rozmowy, nie wracał/wracała do problemu i nie próbował/próbowała naprawiać, co najpewniej by się wydarzyło?" });
  }
  if (hasBurden(burdens, "cisza") || isOtherHeavy(forceMap.avoidance)) {
    candidates.push({ id: "silence-pattern", signal: "Cisza po trudnym momencie", lead: "Tu liczy się zwykły przebieg sytuacji, nie interpretacja.", text: "Kiedy robi się cicho po kłótni albo napięciu: ile to zwykle trwa, kto pierwszy wraca do kontaktu i czy po tym coś się realnie zmienia?" });
  }
  if (hasBurden(burdens, "kłótnie")) {
    candidates.push({ id: "conflict-after", signal: "Co zostaje po kłótni", lead: "Nie chodzi o to, jak mocna była kłótnia. Chodzi o to, co zostało po niej.", text: "Przypomnij sobie ostatnie 2–3 kłótnie. Co po nich naprawdę zmieniło się w zachowaniu którejkolwiek ze stron?" });
  }
  if (hasBurden(burdens, "zdrada") || path.key === "betrayal") {
    candidates.push({ id: "trust-proof", signal: "Co dzieje się po kłamstwie", lead: "Tu nie wystarczy, że ktoś przeprosił. Liczy się to, co robi później.", text: "Co dziś bardziej utrudnia Ci zaufanie: samo wydarzenie, czy to, jak druga strona zachowuje się po nim? Podaj jeden konkretny przykład." });
  }
  if (hasBurden(burdens, "brak jasności") || path.key === "uncertain") {
    candidates.push({ id: "clarity-cost", signal: "Co nadal nie jest nazwane", lead: "Nie chodzi o wielkie deklaracje. Chodzi o jedną rzecz, której brak najbardziej męczy.", text: "Co dokładnie nadal jest między Wami niejasne i co Ty przez to robisz więcej: czekasz, piszesz pierwszy/pierwsza, tłumaczysz, odpuszczasz swoje potrzeby?" });
  }
  if (hasBurden(burdens, "powroty") || truthCards.some((text) => text.includes("wracamy w to samo")) || path.key === "loop") {
    candidates.push({ id: "cycle-proof", signal: "Czy poprawa zostaje", lead: "Najłatwiej pomylić ulgę po napięciu z prawdziwą zmianą.", text: "Kiedy robi się lepiej, co później zostaje na dłużej: konkretne zachowanie, inny sposób rozmowy, większa odpowiedzialność — czy głównie chwilowy spokój?" });
  }
  if (truthCards.some((text) => text.includes("boję się końca")) || hasBurden(burdens, "lęk")) {
    candidates.push({ id: "fear-vs-choice", signal: "Czego boisz się naprawdę", lead: "Czasem trudno odróżnić miłość od strachu przed pustką po tej historii.", text: "Co byłoby dla Ciebie trudniejsze: stracić tę osobę, czy uznać, że ta historia nie poszła tam, gdzie miała pójść?" });
  }
  if (hasBurden(burdens, "rutyna") || path.key === "stagnation") {
    candidates.push({ id: "stagnation-proof", signal: "Czy jest jeszcze kontakt", lead: "Brak kłótni nie zawsze oznacza bliskość.", text: "Po czym poznajesz, że między Wami jest jeszcze ciekawość, bliskość albo chęć bycia razem, a nie tylko przyzwyczajenie?" });
  }
  if (path.key === "triangle" || hasBurden(burdens, "ktoś trzeci")) {
    candidates.push({ id: "third-person-meaning", signal: "Co ta osoba pokazała", lead: "Trzecia osoba nie zawsze jest przyczyną. Czasem tylko odsłania brak, który był wcześniej.", text: "Gdyby tej trzeciej osoby w ogóle nie było, jaki problem w obecnej relacji i tak zostałby na stole?" });
  }

  candidates.push({ id: "one-change", signal: "Jeden konkret", lead: "Na końcu liczy się to, co ktoś robi, nie to, co obiecuje.", text: "Co musiałoby się zmienić w zachowaniu tej osoby, żebyś poczuł/poczuła: „to nie jest tylko chwilowa poprawa”?" });
  candidates.push({ id: "missing-context", signal: "Jedna rzecz z życia", lead: "Żeby wynik nie brzmiał jak przepisanie odpowiedzi, potrzebny jest jeden fakt, nie ogólny opis.", text: `Jaki jeden konkretny fakt z tej relacji najbardziej zmieniłby ocenę sytuacji, gdyby ktoś z boku go poznał?` });

  const unique = uniqueClarifications(candidates);
  const strongSignals = burdens.length + truthCards.length + (meLoad >= 3 ? 1 : 0) + (note.trim().length < 40 ? 1 : 0);
  const limit = strongSignals >= 5 ? 3 : strongSignals >= 3 ? 2 : 1;
  return unique.slice(0, limit);
}

const LOCAL_INTERVIEW_QUESTIONS: Record<EntryKey, LocalInterviewQuestion[]> = {
  unease: [
    { lead: "Najpierw trzeba nazwać, gdzie zaczyna się napięcie.", question: "Kiedy najczęściej czujesz, że coś jest nie tak: po rozmowach, przy ciszy, przy planach, przy braku kontaktu czy przy myśli o przyszłości?", observation: "Nie szukamy jeszcze decyzji. Szukamy punktu, w którym relacja traci spokój." },
    { lead: "Niepokój zwykle ma swój powtarzalny moment.", question: "Jaka sytuacja wraca najczęściej i za każdym razem zostawia Cię z podobnym uczuciem?", observation: "Interesuje nas to, co wraca, nie jednorazowa sytuacja." },
    { lead: "Teraz oddziel fakty od tłumaczeń.", question: "Co konkretnie widzisz w zachowaniu tej osoby, a co dopowiadasz sobie, żeby to jakoś utrzymać w całości?", observation: "To pomaga oddzielić fakt od tłumaczenia." },
  ],
  betrayal: [
    { lead: "Po zdradzie najważniejsze są nie słowa, tylko ciężar odpowiedzialności.", question: "Co ta osoba realnie zmieniła od tamtej sytuacji, a co zostało tylko na poziomie przeprosin albo obietnic?", observation: "Odbudowa zaufania zaczyna się tam, gdzie druga strona przestaje oczekiwać, że ból po prostu minie." },
    { lead: "Sprawdź, czy żyjesz już normalnie, czy nadal w trybie kontroli.", question: "W jakich momentach najczęściej wraca potrzeba sprawdzania, pytania albo analizowania szczegółów?", observation: "Stała czujność nie jest spokojem. Jest kosztem, który relacja zaczęła pobierać." },
    { lead: "Zaufanie wraca przez zachowanie, nie przez zmęczenie tematem.", question: "Co musiałoby się wydarzyć, żebyś naprawdę poczuł/poczuła, że nie musisz już pilnować tej historii?", observation: "To pytanie pokazuje, czy oczekujesz realnej zmiany, czy tylko ulgi od napięcia." },
  ],
  uncertain: [
    { lead: "Niejasność rzadko trwa przypadkiem.", question: "Co dokładnie jest między Wami niedopowiedziane: status, zaangażowanie, przyszłość, wyłączność czy odpowiedzialność za relację?", observation: "Im dłużej coś pozostaje niejasne, tym bardziej zaczyna ustawiać całą relację." },
    { lead: "Zobacz, kto płaci za brak definicji.", question: "Co Ty robisz więcej właśnie dlatego, że nie masz jasności: czekasz, dopasowujesz się, tłumaczysz, inicjujesz, kontrolujesz emocje?", observation: "Brak jasności nie jest neutralny. Ktoś zwykle ponosi jego koszt." },
    { lead: "Teraz najprostszy test.", question: "Gdyby ta osoba naprawdę chciała dać Ci spokój i pewność, co mogłaby zrobić już teraz, bez wielkich deklaracji?", observation: "Ta odpowiedź odróżnia realną trudność od wygodnej nieokreśloności." },
  ],
  asymmetry: [
    { lead: "Asymetrię widać najlepiej wtedy, gdy przestajesz ciągnąć.", question: "Co realnie stałoby się z kontaktem, bliskością i rozmowami, gdybyś przez chwilę przestał/przestała inicjować i naprawiać?", observation: "To pytanie pokazuje, czy relacja stoi na dwóch osobach, czy głównie na Twoim wysiłku." },
    { lead: "Nie chodzi tylko o ilość starań, ale o ich ciężar.", question: "Które rzeczy w tej relacji bierzesz na siebie prawie automatycznie, choć coraz bardziej Cię to męczy?", observation: "Czasem dopiero po takim pytaniu widać, ile rzeczy robisz automatycznie." },
    { lead: "Teraz nazwij koszt.", question: "Kim stajesz się przy tej osobie, kiedy znowu próbujesz utrzymać coś, czego druga strona nie niesie tak samo?", observation: "Najważniejszy nie jest sam wysiłek, tylko to, co ten wysiłek robi z Tobą." },
  ],
  conflict: [
    { lead: "Kłótnia nie jest problemem sama w sobie. Problemem jest to, co zostaje po niej.", question: "Co najczęściej dzieje się po konflikcie: naprawa, cisza, dystans, kolejne wypominanie czy udawanie, że nic się nie stało?", observation: "Relację bardziej definiuje sposób naprawy niż sam fakt sporu." },
    { lead: "Sprawdź, o co naprawdę walczycie.", question: "Czy Wasze kłótnie dotyczą konkretnych spraw, czy po chwili zamieniają się w walkę o rację, uwagę, szacunek albo kontrolę?", observation: "Jeśli temat znika, a zostaje walka, kłótnia przestaje cokolwiek naprawiać." },
    { lead: "Teraz najważniejsze: czy konflikt coś zmienia.", question: "Po ostatnich trzech kłótniach co realnie zmieniło się w zachowaniu którejkolwiek ze stron?", observation: "Jeśli po konflikcie nie ma zmiany, konflikt staje się tylko cyklem napięcia." },
  ],
  stagnation: [
    { lead: "Cisza w relacji może być spokojem albo rezygnacją.", question: "Po czym poznajesz, że między Wami jest jeszcze żywy kontakt, a nie tylko przyzwyczajenie i poprawne funkcjonowanie obok siebie?", observation: "Brak awantur nie zawsze oznacza bliskość." },
    { lead: "Zobacz, co zniknęło jako pierwsze.", question: "Czego najbardziej brakuje Ci z wcześniejszej wersji tej relacji: rozmów, ciekawości, dotyku, planów, lekkości czy poczucia bycia wybranym/wybraną?", observation: "To, co zniknęło pierwsze, często pokazuje prawdziwe miejsce pęknięcia." },
    { lead: "Teraz bez sentymentu.", question: "Co dzisiaj realnie trzyma Was razem, jeśli odłożysz wspomnienia, obowiązki i lęk przed zmianą?", observation: "Ta odpowiedź odróżnia relację żywą od relacji podtrzymywanej rozpędem." },
  ],
  returning: [
    { lead: "Tęsknota potrafi wygładzać powód rozstania.", question: "Który element tej relacji najłatwiej dziś idealizujesz, mimo że wcześniej właśnie on bolał albo wracał jako problem?", observation: "Po rozstaniu pamięć często przepuszcza ulgę, a zatrzymuje najlepsze kadry." },
    { lead: "Powrót ma sens tylko wtedy, gdy wracacie do czegoś innego.", question: "Co konkretnie musiałoby być inne po powrocie i skąd miałoby wynikać, że to nie będzie kolejna ta sama próba?", observation: "Bez konkretu powrót bywa tylko powrotem do znanego bólu." },
    { lead: "Oddziel osobę od niedomkniętej historii.", question: "Czego bardziej nie umiesz puścić: tej konkretnej osoby czy wersji zakończenia, której nadal dla siebie chcesz?", observation: "Czasem nie trzyma człowiek, tylko potrzeba, żeby historia wreszcie miała sens." },
  ],
  triangle: [
    { lead: "Trzecia osoba rzadko jest tylko trzecią osobą.", question: "Co ta osoba uruchomiła w Tobie, czego od dawna nie czułeś/czułaś w obecnej relacji?", observation: "Nowa fascynacja często pokazuje brak, który istniał wcześniej." },
    { lead: "Sprawdź, czy patrzysz na człowieka, czy na obietnicę wyjścia.", question: "Co w tej trzeciej osobie jest realnie poznane, a co jest jeszcze wyobrażeniem, kontrastem albo ucieczką od napięcia?", observation: "To ważne, bo wyobrażenie prawie zawsze jest lżejsze niż codzienność." },
    { lead: "Teraz wróć do obecnej relacji.", question: "Gdyby nie było tej trzeciej osoby, jaki problem w obecnej relacji nadal musiałby zostać nazwany?", observation: "To pytanie oddziela nową historię od starego pęknięcia." },
  ],
  loop: [
    { lead: "Pętla ma swój rytm.", question: "Jak wygląda ostatni pełny cykl między Wami: co uruchomiło napięcie, co doprowadziło do powrotu i co potem znowu zaczęło znikać?", observation: "Dopóki nie nazwiesz tego rytmu, każdy powrót może wyglądać jak nowy start." },
    { lead: "Sprawdź, czy po powrotach zostaje zmiana, czy tylko ulga.", question: "Co po ostatnim powrocie naprawdę utrzymało się dłużej niż kilka tygodni?", observation: "Ulga po odzyskaniu kontaktu może bardzo łatwo udawać naprawę." },
    { lead: "Teraz najtrudniejsze.", question: "Co daje Ci ten cykl, mimo że jednocześnie Cię męczy: intensywność, poczucie bycia potrzebnym/potrzebną, nadzieję, adrenalinę czy uniknięcie pustki?", observation: "Czasem człowieka trzyma nie tylko osoba, ale cały rytm napięcia i ulgi." },
  ],
};

function createLocalInterviewState(path: EntryConfig): InterviewState {
  const localQuestions = LOCAL_INTERVIEW_QUESTIONS[path.key];
  const first = localQuestions[0];
  return {
    path: path.key,
    currentQuestion: first.question,
    currentLead: first.lead,
    currentObservation: first.observation || "",
    history: [],
    depth: 1,
    finished: false,
    exchangeIndex: 0,
    source: "local",
    localQuestions,
    localIndex: 0,
  };
}

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
  
  if (chance <= 24) return { chance, tension, asymmetry, change, tone: "red", badge: "Dużo napięcia i mało stabilnego gruntu", headline: "To nie wygląda jak coś, co samo się uspokoi.", truth: "Najmocniej widać, że trudne momenty nie kończą się realną naprawą. One raczej zostają w tle i wracają przy kolejnej sytuacji.", mirror: "Uczucie może tu nadal być, ale coraz częściej miesza się z czujnością, czekaniem albo próbą utrzymania czegoś, co nie daje spokoju.", summary: "Ten wynik pojawia się, gdy relacja zaczyna kosztować więcej energii, niż daje oparcia: przez chaos, nierówne starania, brak jasności albo powroty do tego samego problemu.", paidTease: "Pełny raport pokaże, co konkretnie trzyma Cię przy tej relacji, co jest nadzieją, a co realną zmianą po drugiej stronie." };
  if (chance <= 49) return { chance, tension, asymmetry, change, tone: "yellow", badge: "Są dobre momenty, ale nie ma pełnego spokoju", headline: "Coś tu jeszcze trzyma. Ale coś innego wyraźnie męczy.", truth: "Nie chodzi tylko o to, że jest trudno. Chodzi o to, że trudność wraca i zaczyna ustawiać całą relację.", mirror: "Widać przywiązanie, ale obok niego widać też zmęczenie, nierówne starania albo niepewność, która trwa zbyt długo, żeby ją zbyć przypadkiem.", summary: "Ten wynik pojawia się, gdy uczucie nadal ma znaczenie, ale nie wystarcza do tego, żeby dać stabilność, jasność i poczucie wzajemności.", paidTease: "Pełny raport pokaże, co jeszcze działa, co już Cię kosztuje i po czym odróżnić prawdziwą zmianę od chwilowego uspokojenia." };
  if (chance <= 69) return { chance, tension, asymmetry, change, tone: "yellow", badge: "Jest potencjał, ale wymaga konkretów", headline: "Tu coś jeszcze ma sens. Ale nie na autopilocie.", truth: "Nie wygląda to jak relacja skazana na powtarzanie tego samego. Ale sama dobra wola nie wystarczy, jeśli po trudnych momentach nie pojawia się inny sposób działania.", mirror: "Są miejsca, na których można budować. Są też takie, których nie warto zostawiać bez nazwania, bo z czasem zwykle robią się większe.", summary: "Ten wynik pojawia się, gdy relacja ma jeszcze realny materiał, ale nie obroni się samym sentymentem, przyzwyczajeniem albo obietnicami.", paidTease: "Pełny raport pokaże, co daje podstawy do nadziei, co ją osłabia i jaki konkretny sygnał warto teraz sprawdzić." };
  return { chance, tension, asymmetry, change, tone: "green", badge: "Widać stabilniejszy grunt", headline: "Tu jest coś, na czym można budować.", truth: "W odpowiedziach jest więcej spójności niż chaosu. To nie wygląda jak relacja trzymana wyłącznie lękiem albo przyzwyczajeniem.", mirror: "To nie znaczy, że wszystko jest idealne. Znaczy tyle, że obok trudności widać kontakt, wzajemność i zdolność wracania do rozmowy.", summary: "Ten wynik pojawia się, gdy relacja ma nie tylko emocje, ale też pewien grunt: odpowiedzialność, rozmowę, konsekwencję albo wspólny kierunek.", paidTease: "Pełny raport pokaże, skąd bierze się ten potencjał i które słabsze miejsca warto sprawdzić, zanim urosną." };
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


function normalizeSectionKey(value: string): string {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findSectionText(sections: FullReportSection[], key: string, fallback = ""): string {
  const normalizedKey = normalizeSectionKey(key);
  const aliases: Record<string, string[]> = {
    "co uzytkownik sam juz wie": ["co juz wiesz", "to juz wiesz", "co jest jasne"],
    "co wynika ale nie zostalo powiedziane wprost": ["co z tego wynika", "czego mogles nie nazwac", "co jest pod spodem"],
    "najwieksza sprzecznosc": ["gdzie jest rozjazd", "co sie nie sklada", "najwiekszy rozjazd"],
    "jeden konkretny wniosek": ["jeden wniosek", "najwazniejszy wniosek", "co warto zabrac"],
    "co dokladnie daje premium": ["co daje pelny raport", "co dostaniesz w pelnym raporcie", "co bedzie dalej"],
    "metryka napiecie": ["napiecie", "koszt emocjonalny"],
    "metryka asymetria": ["ciezar po stronach", "nierowny ciezar", "kto niesie wiecej"],
    "metryka zmiana": ["szansa na zmiane", "realnosc zmiany", "czy widac zmiane"],
  };
  const keys = [normalizedKey, ...(aliases[normalizedKey] || []).map(normalizeSectionKey)];
  const found = sections.find((section) => {
    const title = normalizeSectionKey(section.title || "");
    return keys.some((candidate) => title.includes(candidate) || candidate.includes(title));
  });
  return (found?.text || fallback || "").trim();
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 25000): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function fetchPreviewFromAPI(token: string, path: EntryConfig, answers: AnswerMap, openText: string, relationshipMap?: RelationshipMapPayload): Promise<Preview> {
  const answersArr = Object.entries(answers).map(([qid, oid]) => { const q = path.questions.find((x) => x.id === qid); const opt = q?.options.find((o) => o.id === oid); return { q: q?.text || qid, a: opt?.label || oid }; });
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, path: path.key, mode: "soft", answers: answersArr, openText, customDescription: openText, relationshipMap }) }, 10000);
    const data = await res.json().catch(() => ({}));
    if (data?.crisis) throw new Error("__CRISIS__");
    if (data?.ok && data?.preview) {
      const p = data.preview;
      const tension = typeof p.tensionPercent === "number" ? p.tensionPercent : 50;
      const asymmetry = typeof p.driftPercent === "number" ? p.driftPercent : 50;
      const change = typeof p.rebuildPercent === "number" ? p.rebuildPercent : 50;
      const chance = Math.round(100 - tension * 0.5 - asymmetry * 0.3 + change * 0.2);
      const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
      const sections: FullReportSection[] = Array.isArray(p.sections) ? p.sections : [];
      const whatUserKnows = findSectionText(sections, "co uzytkownik sam juz wie", sections[0]?.text || "");
      const hiddenInsight = findSectionText(sections, "co wynika ale nie zostalo powiedziane wprost", sections[1]?.text || sections[0]?.text || "");
      const contradiction = findSectionText(sections, "najwieksza sprzecznosc", "Na tym etapie nie chodzi o szukanie winy. Chodzi o sprawdzenie, czy Twoje nadzieje zgadzają się z tym, co regularnie dzieje się między Wami.");
      const concreteConclusion = findSectionText(sections, "jeden konkretny wniosek", sections[1]?.text || p.previewLine || "");
      const premiumSpecific = findSectionText(sections, "co dokladnie daje premium", p.closing || "Pełny raport pokaże, co naprawdę trzyma tę relację, gdzie rozmijają się nadzieje z faktami i jaki następny krok ma sens.");
      return {
        chance: clamp(chance, 5, 95),
        tension: clamp(tension, 5, 97),
        asymmetry: clamp(asymmetry, 5, 97),
        change: clamp(change, 5, 90),
        tone: chance <= 30 ? "red" : chance <= 60 ? "yellow" : "green",
        badge: p.subheadline || "Analiza relacji",
        headline: p.headline || "Wynik gotowy.",
        truth: p.previewLine || concreteConclusion,
        mirror: hiddenInsight,
        summary: concreteConclusion || hiddenInsight || whatUserKnows,
        paidTease: premiumSpecific,
        whatUserKnows,
        hiddenInsight,
        contradiction,
        concreteConclusion,
        tensionMeaning: findSectionText(sections, "metryka napiecie"),
        asymmetryMeaning: findSectionText(sections, "metryka asymetria"),
        changeMeaning: findSectionText(sections, "metryka zmiana"),
        premiumSpecific,
      } as Preview;
    }
  } catch (e: any) { if (e?.message === "__CRISIS__") throw e; }
  return buildPreview(path, answers, openText);
}



function previewFallbackText(preview: Preview, key: keyof Preview, fallback = ""): string {
  const raw = preview[key];
  const text = typeof raw === "string" ? raw.trim() : "";
  if (text) return text;
  const fb = typeof fallback === "string" ? fallback.trim() : "";
  if (fb) return fb;
  return "Na tym etapie nie da się tego uczciwie nazwać jednym zdaniem. Dalsza część wyniku pokazuje, co już widać i czego jeszcze nie warto przesądzać.";
}

function metricExplanationCards(preview: Preview) {
  const fallbackTension = preview.tension >= 70
    ? "Ta liczba pokazuje, że relacja częściej uruchamia czujność, napięcie albo potrzebę analizowania niż spokojny kontakt. Nie mówi, kto ma rację. Pokazuje koszt, który pojawia się po Twojej stronie."
    : preview.tension >= 45
      ? "To nie wygląda na pełny spokój, ale też nie musi oznaczać rozpadu. Liczba pokazuje, że są miejsca, w których kontakt wymaga dopowiedzenia albo naprawy."
      : "Napięcie nie wychodzi tu jako główny ciężar. Jeśli coś przeszkadza, prawdopodobnie trzeba patrzeć bardziej na konkretne zachowania niż na ogólne poczucie kryzysu.";

  const fallbackAsymmetry = preview.asymmetry >= 70
    ? "Ta liczba pokazuje, że ciężar kontaktu, naprawy albo czekania może częściej leżeć po jednej stronie. Ważne jest nie samo uczucie, tylko to, kto realnie coś robi, kiedy pojawia się problem."
    : preview.asymmetry >= 45
      ? "Tu widać pewną nierówność, ale nie wystarczy nazwać jej problemem. Trzeba sprawdzić, czy jest chwilowa, czy powtarza się zawsze wtedy, gdy robi się trudniej."
      : "Ciężar nie wygląda na mocno jednostronny. Jeśli odpowiedzi były szczere, relacja ma więcej wzajemności niż układu, w którym jedna osoba ciągnie wszystko za dwoje.";

  const fallbackChange = preview.change <= 35
    ? "Ta liczba nie mówi, że nic nie da się zrobić. Mówi, że w odpowiedziach słabiej widać trwałe zachowania, które realnie przesuwają relację w lepsze miejsce."
    : preview.change <= 60
      ? "Widać jakiś potencjał, ale nie wystarczy sama ulga po rozmowie albo dobra chwila. Najważniejsze pytanie brzmi: czy po trudnym momencie coś naprawdę zmienia się w zachowaniu."
      : "Tu widać więcej realnego ruchu niż samej nadziei. To nie znaczy, że wszystko jest proste, ale odpowiedzi pokazują punkty, na których można się oprzeć.";

  return [
    { label: "Napięcie", value: preview.tension, text: previewFallbackText(preview, "tensionMeaning", fallbackTension) },
    { label: "Ciężar po stronach", value: preview.asymmetry, text: previewFallbackText(preview, "asymmetryMeaning", fallbackAsymmetry) },
    { label: "Realność zmiany", value: preview.change, text: previewFallbackText(preview, "changeMeaning", fallbackChange) },
  ];
}


function ensurePreview(value: any, fallback: Preview): Preview {
  if (!value || typeof value !== "object") return fallback;
  const chance = Number(value.chance);
  const tension = Number(value.tension);
  const asymmetry = Number(value.asymmetry);
  const change = Number(value.change);
  if (![chance, tension, asymmetry, change].every(Number.isFinite)) return fallback;
  return {
    ...fallback,
    ...value,
    chance: clamp(chance, 5, 95),
    tension: clamp(tension, 5, 97),
    asymmetry: clamp(asymmetry, 5, 97),
    change: clamp(change, 5, 90),
    badge: typeof value.badge === "string" && value.badge.trim() ? value.badge : fallback.badge,
    headline: typeof value.headline === "string" && value.headline.trim() ? value.headline : fallback.headline,
    truth: typeof value.truth === "string" && value.truth.trim() ? value.truth : fallback.truth,
    mirror: typeof value.mirror === "string" && value.mirror.trim() ? value.mirror : fallback.mirror,
    summary: typeof value.summary === "string" && value.summary.trim() ? value.summary : fallback.summary,
    paidTease: typeof value.paidTease === "string" && value.paidTease.trim() ? value.paidTease : fallback.paidTease,
    tone: value.tone === "red" || value.tone === "yellow" || value.tone === "green" ? value.tone : fallback.tone,
  } as Preview;
}

function dominantPreviewAxis(preview: Preview): string {
  const unresolved = 100 - preview.change;
  if (preview.tension >= preview.asymmetry && preview.tension >= unresolved) return "napięcie";
  if (preview.asymmetry >= preview.tension && preview.asymmetry >= unresolved) return "asymetria";
  return "realność zmiany";
}

function buildPreviewMap(path: EntryConfig, preview: Preview) {
  const axis = dominantPreviewAxis(preview);
  const riskText = preview.change <= 30
    ? "Największe ryzyko jest takie, że chwilowe uspokojenie po rozmowie może wyglądać jak zmiana, choć nie musi niczego przesuwać w zachowaniu."
    : preview.change <= 55
      ? "Największe ryzyko leży w tym, że część rzeczy jeszcze działa, ale nie wiadomo, czy wystarczy to do trwałej zmiany."
      : "Największe ryzyko nie polega na braku potencjału, tylko na tym, że słabsze miejsca zostaną zlekceważone, bo wynik wygląda względnie dobrze.";
  const axisText = axis === "napięcie"
    ? "Najmocniej wybija się napięcie: relacja nie daje prostego spokoju, tylko wymusza czujność, reakcję albo obronę."
    : axis === "asymetria"
      ? "Najmocniej wybija się asymetria: widać różnicę między tym, kto niesie ciężar relacji, a kto częściej zostawia rzeczy bez domknięcia."
      : "Najmocniej wybija się pytanie o realność zmiany: nie chodzi o deklaracje, tylko o to, czy zachowanie rzeczywiście przesuwa relację w lepsze miejsce.";
  const pathQuestion: Record<EntryKey, string> = {
    unease: "Czy ten niepokój jest sygnałem konkretnego pęknięcia, czy sumą wielu drobnych rzeczy, których nie da się już ignorować?",
    betrayal: "Czy odbudowa zaufania dzieje się realnie, czy tylko temat zdrady został zmęczony i wypchnięty z rozmów?",
    uncertain: "Czy brak jasności jest przejściowy, czy stał się wygodnym układem, w którym jedna osoba czeka, a druga nie musi decydować?",
    asymmetry: "Czy to jeszcze chwilowa nierówność, czy relacja zaczęła działać głównie dzięki Twojemu wysiłkowi?",
    conflict: "Czy kłótnie rozwiązują problem, czy tylko zostawiają ciszę, dystans i kolejny powód do następnej walki?",
    stagnation: "Czy to spokojniejszy etap relacji, czy moment, w którym obie strony przestały już naprawdę po siebie sięgać?",
    returning: "Czy chcesz wrócić do tej osoby, czy do wersji historii, która wreszcie miałaby dobre zakończenie?",
    triangle: "Czy trzecia osoba jest realną odpowiedzią, czy tylko pokazuje brak, który istniał wcześniej?",
    loop: "Czy wracacie do miłości, czy do znajomego cyklu napięcia, ulgi i kolejnego rozczarowania?",
  };
  return [
    { label: "Najmocniejszy sygnał", text: axisText },
    { label: "Największe ryzyko", text: riskText },
    { label: "Pytanie, którego jeszcze nie widać w wyniku", text: pathQuestion[path.key] },
    { label: "Co wymaga pogłębienia", text: "Pełny raport rozdziela fakty, nadzieję, koszt emocjonalny i realną zmianę, zamiast zostawiać Cię tylko z jednym procentem." },
  ];
}

function buildPremiumSamples(path: EntryConfig, preview: Preview) {
  const mechanism = dominantPreviewAxis(preview);
  const conflictSample = path.key === "conflict" ? "czy kłótnia jest próbą rozwiązania problemu, czy sposobem walki o wpływ, uwagę albo kontrolę" : "jaki wzorzec naprawdę organizuje tę relację i dlaczego wraca mimo rozmów";
  return [
    { title: "Co tu naprawdę działa", text: mechanism === "napięcie" ? conflictSample : "czy główny ciężar leży w napięciu, braku jasności, nierównych staraniach, chwilowych poprawach czy braku konkretnej zmiany" },
    { title: "Kto niesie więcej", text: "kto częściej inicjuje, naprawia, czeka, wraca do rozmowy i zostaje z napięciem po trudnych momentach" },
    { title: "Co wygląda jak poprawa", text: "czy po trudnych momentach naprawdę zmienia się zachowanie, czy tylko na chwilę robi się spokojniej" },
  ];
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
  return (
    <Glass className="ctms-preview-badge ctms-preview-badge--clean">
      <div className="ctms-kicker">PIERWSZY ODCZYT</div>
      <div className="ctms-preview-score" style={{ color }}>{preview.chance}%</div>
      <div className="ctms-preview-label">{preview.badge}</div>
      <div className="ctms-preview-truth">{preview.truth}</div>
      <div className="ctms-preview-mirror">{preview.mirror}</div>
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
  "Czytam odpowiedzi",
  "Sprawdzam przykłady",
  "Układam pierwszy wynik",
  "Kończę podsumowanie",
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
        <h2 style={{ marginBottom: "12px", fontSize: "clamp(20px,4vw,26px)" }}>Przygotowuję wynik</h2>
        <div className="processing-message">{PROCESSING_MESSAGES[msgIndex]}{".".repeat(dots)}</div>
        <p style={{ marginTop: "24px", fontSize: "14px", color: "var(--muted)", lineHeight: 1.6 }}>To potrwa chwilę. Zaraz pokażemy pierwszy wynik.</p>
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
  const [forceMap, setForceMap] = useState<ForceMap>({});
  const [burdens, setBurdens] = useState<BurdenItem[]>([]);
  const [truthCards, setTruthCards] = useState<string[]>([]);
  const [relationshipNote, setRelationshipNote] = useState("");
  const [clarificationQuestions, setClarificationQuestions] = useState<ClarificationQuestion[]>([]);
  const [clarificationAnswers, setClarificationAnswers] = useState<ClarificationAnswerMap>({});
  const [clarificationIndex, setClarificationIndex] = useState(0);
  const [clarificationDraft, setClarificationDraft] = useState("");
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
    if (typeof window === "undefined") return;
    if (isPublicContentRoute) return;

    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    const raf = window.requestAnimationFrame(scrollToTop);
    return () => window.cancelAnimationFrame(raf);
  }, [stage, questionIndex, clarificationIndex, isPublicContentRoute]);

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
        ? "Artykuły o relacjach, powrotach, niepewności, bliskości i sytuacjach, które od środka trudno nazwać."
        : routeLegalKey
          ? legalDescription
          : "Prywatna analiza relacji. Zobacz, co naprawdę wraca między Wami, kto niesie większy ciężar i czy ta relacja ma jeszcze sens.";

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
          setForceMap(parsed.forceMap || {});
          setBurdens(parsed.burdens || []);
          setTruthCards(parsed.truthCards || []);
          setRelationshipNote(parsed.relationshipNote || "");
          setClarificationQuestions(parsed.clarificationQuestions || []);
          setClarificationAnswers(parsed.clarificationAnswers || {});
          setClarificationIndex(parsed.clarificationIndex || 0);
          setClarificationDraft(parsed.clarificationDraft || "");
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stage, selectedPath, questionIndex, answers, openText, email, preview, fullReport, sessionToken, interviewState, forceMap, burdens, truthCards, relationshipNote, clarificationQuestions, clarificationAnswers, clarificationIndex, clarificationDraft }));
  }, [stage, selectedPath, questionIndex, answers, openText, email, preview, fullReport, sessionToken, interviewState, forceMap, burdens, truthCards, relationshipNote, clarificationQuestions, clarificationAnswers, clarificationIndex, clarificationDraft]);

  const ensureSession = async (entryKey: EntryKey): Promise<string> => {
    if (sessionToken) return sessionToken;
    const data = await createSession(entryKey);
    const nextToken = data?.token || data?.sessionId || null;
    if (!nextToken) throw new Error("Nie udało się uzyskać tokenu sesji.");
    setSessionToken(nextToken); return nextToken;
  };

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStage("landing"); setSelectedPath(null); setQuestionIndex(0); setAnswers({}); setOpenText(""); setEmail(""); setPreview(null); setFullReport(null); setSessionToken(null); setBusy(false); setError(null); setConsents([false, false, false, false]); setLegalOpen(null); setInterviewState(null); setInterviewAnswer(""); setForceMap({}); setBurdens([]); setTruthCards([]); setRelationshipNote(""); setClarificationQuestions([]); setClarificationAnswers({}); setClarificationIndex(0); setClarificationDraft("");
    window.history.replaceState({}, "", "/");
    setRoutePath("/");
  };

  const startPath = async (key: EntryKey) => {
    setBusy(true); setError(null);
    try {
      const data = await createSession(key);
      const token = data?.token || data?.sessionId || null;
      if (!token) throw new Error("Brak tokenu sesji.");
      setSessionToken(token); setSelectedPath(key); setQuestionIndex(0); setAnswers({}); setOpenText(""); setPreview(null); setFullReport(null); setInterviewState(null); setForceMap({}); setBurdens([]); setTruthCards([]); setRelationshipNote(""); setClarificationQuestions([]); setClarificationAnswers({}); setClarificationIndex(0); setClarificationDraft(""); setClarificationQuestions([]); setClarificationAnswers({}); setClarificationIndex(0); setClarificationDraft("");
      setStage("questions");
    } catch (e: any) { setError(friendlyError(e, "Nie udało się rozpocząć analizy.")); setStage("error"); }
    finally { setBusy(false); }
  };

  const answerQuestion = (qid: string, optionId: string) => {
    const next = { ...answers, [qid]: optionId };
    setAnswers(next);
    if (!path) return;
    if (questionIndex >= path.questions.length - 1) { setStage("question_signal"); return; }
    setQuestionIndex((v) => v + 1);
  };

  const answerCheckpoint = async (optionId: string) => {
    if (!path) return;
    const newAnswers = { ...answers, [`${path.key}_checkpoint`]: optionId };
    setAnswers(newAnswers);
    setStage("force_map");
  };

  const setForceValue = (key: ForceMapKey, value: ForceValue) => {
    setForceMap((current) => ({ ...current, [key]: value }));
  };

  const toggleBurden = (label: string) => {
    setBurdens((current) => {
      const exists = current.find((item) => item.label === label);
      if (exists) {
        return current.filter((item) => item.label !== label).map((item, index) => ({ ...item, rank: index + 1 }));
      }
      if (current.length >= 3) return current;
      return [...current, { label, rank: current.length + 1 }];
    });
  };

  const toggleTruthCard = (text: string) => {
    setTruthCards((current) => {
      if (current.includes(text)) return current.filter((item) => item !== text);
      if (current.length >= 2) return current;
      return [...current, text];
    });
  };

  const relationshipMapPayload = (clarificationsOverride?: ClarificationAnswerMap): RelationshipMapPayload => {
    const answersSource = clarificationsOverride || clarificationAnswers;
    return {
      forceMap,
      burdens,
      truthCards,
      userNote: relationshipNote.trim(),
      clarificationAnswers: clarificationQuestions.map((q) => ({
        question: q.text,
        signal: q.signal,
        answer: (answersSource[q.id] || "").trim(),
      })).filter((item) => item.answer),
    };
  };

  const buildCompositeOpenText = (clarificationsOverride?: ClarificationAnswerMap): string => {
    const forceLines = FORCE_MAP_ITEMS
      .map((item) => `- ${item.title}: ${forceLabel(forceMap[item.key])}`)
      .join("\n");
    const burdenLines = burdens.length
      ? burdens.map((item) => `${item.rank}. ${item.label}`).join("\n")
      : "Brak wskazanych ciężarów.";
    const truthLines = truthCards.length
      ? truthCards.map((item) => `- ${item}`).join("\n")
      : "Brak wybranych zdań prawdy.";
    const note = relationshipNote.trim() || "Brak dodatkowej notatki.";
    return `MAPA RELACJI — dane kliknięte przez użytkownika\n\nUKŁAD SIŁ\n${forceLines}\n\nNAJWIĘKSZE CIĘŻARY\n${burdenLines}\n\nMOMENT PRAWDY\n${truthLines}\n\nDODATKOWA MYŚL UŻYTKOWNIKA\n${note}`;
  };

  const prepareMapSummary = () => {
    if (!path) return;
    const nextQuestions = buildClarificationQuestions(path, forceMap, burdens, truthCards, relationshipNote);
    setClarificationQuestions(nextQuestions);
    setClarificationAnswers({});
    setClarificationIndex(0);
    setClarificationDraft("");
    setStage("map_summary");
  };

  const goToClarification = () => {
    if (!clarificationQuestions.length) {
      buildPreviewAndGo({});
      return;
    }
    setClarificationIndex(0);
    setClarificationDraft(clarificationAnswers[clarificationQuestions[0].id] || "");
    setStage("clarification");
  };

  const saveClarificationAndNext = (skip = false) => {
    const question = clarificationQuestions[clarificationIndex];
    if (!question) { buildPreviewAndGo(clarificationAnswers); return; }
    const nextAnswers = { ...clarificationAnswers, [question.id]: skip ? "" : clarificationDraft.trim() };
    setClarificationAnswers(nextAnswers);
    if (clarificationIndex >= clarificationQuestions.length - 1) {
      buildPreviewAndGo(nextAnswers);
      return;
    }
    const nextIndex = clarificationIndex + 1;
    setClarificationIndex(nextIndex);
    setClarificationDraft(nextAnswers[clarificationQuestions[nextIndex].id] || "");
  };

  const sendInterviewAnswer = async () => {
    if (!interviewState || !sessionToken || !interviewAnswer.trim()) return;
    if (hasCrisisContent(interviewAnswer)) { setStage("crisis"); return; }
    const currentExchangeCount = interviewState.history.length + 1;
    const updatedHistory: InterviewExchange[] = [...interviewState.history, { ai: interviewState.currentQuestion, user: interviewAnswer.trim(), lead: interviewState.currentLead, observation: interviewState.currentObservation }];

    if (interviewState.source === "local") {
      const localQuestions = interviewState.localQuestions || [];
      const nextIndex = (interviewState.localIndex ?? 0) + 1;
      if (nextIndex < localQuestions.length) {
        const nextQuestion = localQuestions[nextIndex];
        setInterviewState({
          ...interviewState,
          history: updatedHistory,
          currentQuestion: nextQuestion.question,
          currentLead: nextQuestion.lead,
          currentObservation: nextQuestion.observation || "",
          depth: nextIndex + 1,
          exchangeIndex: nextIndex,
          localIndex: nextIndex,
        });
        setInterviewAnswer("");
        return;
      }
      const transcript = updatedHistory.map((e) => `Pytanie: ${e.ai}\nOdpowiedź: ${e.user}`).join("\n\n");
      setInterviewState({ ...interviewState, history: updatedHistory, finished: true });
      setOpenText(transcript);
      setStage("open_text");
      setInterviewAnswer("");
      return;
    }
    
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
    if (stage === "question_signal") { setStage("questions"); return; }
    if (stage === "checkpoint") { setStage("question_signal"); return; }
    if (stage === "force_map") { setStage("checkpoint"); return; }
    if (stage === "force_signal") { setStage("force_map"); return; }
    if (stage === "burdens") { setStage("force_signal"); return; }
    if (stage === "burden_signal") { setStage("burdens"); return; }
    if (stage === "truth_cards") { setStage("burden_signal"); return; }
    if (stage === "truth_signal") { setStage("truth_cards"); return; }
    if (stage === "short_note") { setStage("truth_signal"); return; }
    if (stage === "map_summary") { setStage("short_note"); return; }
    if (stage === "clarification") {
      if (clarificationIndex > 0) {
        const prevIndex = clarificationIndex - 1;
        setClarificationIndex(prevIndex);
        setClarificationDraft(clarificationAnswers[clarificationQuestions[prevIndex]?.id] || "");
        return;
      }
      setStage("map_summary"); return;
    }
    if (stage === "interview") { setStage("checkpoint"); return; }
    if (stage === "open_text") { if (interviewState && interviewState.history.length > 0) { setStage("interview"); return; } setStage("truth_cards"); return; }
    if (stage === "preview") { setStage(clarificationQuestions.length ? "clarification" : "map_summary"); return; }
    if (stage === "consent") { setStage("landing"); return; }
    if (stage === "entry") setStage("consent");
  };

  const buildPreviewAndGo = async (clarificationsOverride?: ClarificationAnswerMap) => {
    if (!path) return;
    const relationshipMap = relationshipMapPayload(clarificationsOverride);
    const finalOpenText = buildCompositeOpenText(clarificationsOverride);
    if (hasCrisisContent(finalOpenText)) { setStage("crisis"); return; }

    setOpenText(finalOpenText);
    setBusy(true);
    setError(null);
    setStage("processing");

    try {
      let token = sessionToken || "";
      try {
        token = await ensureSession(path.key);
      } catch {
        token = "";
      }

      let previewData: Preview;
      const localFallback = buildPreview(path, answers, finalOpenText);
      try {
        if (token) {
          previewData = await Promise.race([
            fetchPreviewFromAPI(token, path, answers, finalOpenText, relationshipMap),
            new Promise<Preview>((resolve) => window.setTimeout(() => resolve(localFallback), 12000)),
          ]);
        } else {
          previewData = localFallback;
        }
      } catch (e: any) {
        if (e?.message === "__CRISIS__") { setStage("crisis"); return; }
        previewData = localFallback;
      }

      previewData = ensurePreview(previewData, localFallback);
      setPreview(previewData);

      if (token) {
        updateSession({ token, path: path.key, answers, openText: finalOpenText, relationshipMap, preview: previewData, stage: "preview" })
          .catch(() => {});
      }

      setStage("preview");
    } catch (e: any) {
      setPreview(buildPreview(path, answers, finalOpenText));
      setStage("preview");
    } finally {
      setBusy(false);
    }
  };

  const pay = async () => {
    if (!selectedPath || !preview) { setError("Brak gotowego podglądu."); return; }
    if (!email.includes("@")) { setError("Podaj prawidłowy adres e-mail."); return; }
    setBusy(true); setError(null);
    try {
      const token = await ensureSession(selectedPath);
      await updateSession({ token, path: selectedPath, answers, openText, relationshipMap: relationshipMapPayload(), preview, email, consentAcceptedAt: new Date().toISOString(), stage: "checkout_started" });
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
                  <div className="hero-kicker">PRYWATNA ANALIZA TEJ KONKRETNEJ RELACJI</div>
                  <h1>Zobacz, <span>co naprawdę dzieje się między Wami.</span></h1>
                  <p className="hero-main-copy">CzyToMaSens pomaga uporządkować sytuację w relacji: co wraca, kto częściej niesie ciężar, gdzie brakuje jasności i czy widać realną zmianę. To nie jest quiz osobowości, czat ani gotowa rada.</p>
                  <div className="hero-value-grid">
                    <div><strong>1</strong><span>zaznaczasz fakty</span></div>
                    <div><strong>2</strong><span>dopowiadasz jeden przykład</span></div>
                    <div><strong>3</strong><span>dostajesz pierwszy odczyt sytuacji</span></div>
                  </div>
                  <div className="ctms-landing-actions">
                    <PrimaryButton onClick={() => setStage("consent")}>Rozpocznij analizę relacji</PrimaryButton>
                  </div>
                </Glass>
                <div className="hero-side-stack">
                  <Glass className="glass-panel story-panel map-preview-card">
                    <div className="story-kicker">CO DOSTANIESZ</div>
                    <h3>Nie ocenę partnera. Nie diagnozę. Odczyt tego, co w tej relacji naprawdę się powtarza.</h3>
                    <div className="mini-map-board">
                      <div className="mini-map-node main"><span>Największy ciężar</span><strong>Cisza po konflikcie</strong></div>
                      <div className="mini-map-node"><span>Układ sił</span><strong>Ty częściej naprawiasz</strong></div>
                      <div className="mini-map-node"><span>Moment prawdy</span><strong>Po poprawie wraca to samo</strong></div>
                      <div className="mini-map-node"><span>Doprecyzowanie</span><strong>Co dzieje się, gdy przestajesz ciągnąć?</strong></div>
                    </div>
                    <div className="mini-signal-strip">
                      <div><span>Napięcie</span><strong>85%</strong></div>
                      <div><span>Asymetria</span><strong>70%</strong></div>
                      <div><span>Zmiana</span><strong>25%</strong></div>
                    </div>
                    <div className="story-lock">
                      <div className="story-lock-icon">◆</div>
                      <div><strong>Pierwszy obraz sytuacji</strong><span>Krótki wynik pokazuje główny sygnał, największe ryzyko i jeden konkretny wniosek.</span></div>
                    </div>
                  </Glass>
                </div>
              </section>
              
              <section className="not-this-section">
                <Glass className="not-this-strip">
                  <div className="not-this-head">
                    <div className="eyebrow">CZYM TO NIE JEST</div>
                    <p>To prywatne narzędzie do uporządkowania relacji, nie poradnia i nie wyrocznia.</p>
                  </div>
                  <div className="not-this-grid">
                    {[
                      ["Nie test osobowości", "Nie dostajesz typu. Dostajesz obraz konkretnej sytuacji."],
                      ["Nie instrukcja co zrobić", "Wynik pokazuje, co się powtarza i gdzie decyzja wymaga jasności."],
                      ["Nie ocena partnera", "Opisuje układ i zachowania, nie wydaje wyroków."],
                      ["Nie formularz", "Kilka wyborów i krótkie dopowiedzenie. Bez długiego formularza."]
                    ].map(([title, desc]) => (
                      <div key={title} className="not-this-item">
                        <span>•</span>
                        <div><strong>{title}</strong><small>{desc}</small></div>
                      </div>
                    ))}
                  </div>
                </Glass>
              </section>
              
              <section className="ctms-feature-editorial-grid process-grid" style={{ marginTop: "24px" }}>
                <Glass className="feature-card process-card">
                  <div className="feature-top"><span className="feature-no">01</span><span className="feature-icon">◌</span></div>
                  <h3>Mapa Relacji</h3>
                  <div className="feature-line" />
                  <p>Wybierasz ciężary, układ sił i Moment prawdy. Bez pisania wypracowania i bez technicznych wykresów.</p>
                </Glass>
                <Glass className="feature-card process-card">
                  <div className="feature-top"><span className="feature-no">02</span><span className="feature-icon">▤</span></div>
                  <h3>Doprecyzowanie</h3>
                  <div className="feature-line" />
                  <p>System dopytuje o 1–3 miejsca, które najbardziej zmieniają interpretację. Nie pyta o wszystko. Pyta o sedno.</p>
                </Glass>
                <Glass className="feature-card process-card">
                  <div className="feature-top"><span className="feature-no">03</span><span className="feature-icon">◐</span></div>
                  <h3>Pierwszy obraz</h3>
                  <div className="feature-line" />
                  <p>Dostajesz pierwszy odczyt: co Cię kosztuje najwięcej, gdzie ciężar nie rozkłada się równo i czy widać realną zmianę.</p>
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


          {stage === "question_signal" && path && (
            <PauseInsightPanel
              insight={buildPauseInsight("questions", path, answers, forceMap, burdens, truthCards)}
              onBack={goBack}
              onNext={() => setStage("checkpoint")}
              nextLabel="Dalej →"
            />
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


          {stage === "force_map" && path && (
            <motion.div key={`${path.key}-force-map`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="section-head compact">
                <div>
                  <div className="eyebrow">MAPA RELACJI · KROK 1 Z 4</div>
                  <h2>Układ sił</h2>
                  <p>Nie przesuwasz suwaków. Po prostu zaznaczasz, po której stronie częściej leży ciężar danego elementu.</p>
                </div>
                <div className="progress-wrap">
                  <span>{mapCompletion(forceMap, burdens, truthCards)}%</span>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${mapCompletion(forceMap, burdens, truthCards)}%` }} /></div>
                </div>
              </div>
              <Glass className="question-panel relationship-map-panel">
                <div className="map-step-note">
                  Teraz odpowiadasz na kilka osobnych pytań o to, jak rozkłada się ciężar relacji. Przy każdym wybierz najbliższą odpowiedź, nie idealną.
                </div>
                <div className="force-map-list">
                  {FORCE_MAP_ITEMS.map((item, index) => (
                    <div key={item.key} className="force-map-item force-map-item--stepped">
                      <div className="force-map-copy">
                        <div className="force-question-index">Pytanie {index + 1} z {FORCE_MAP_ITEMS.length}</div>
                        <strong>{item.title}</strong>
                        <span>{item.hint}</span>
                      </div>
                      <div className="force-options" role="group" aria-label={item.title}>
                        {FORCE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            className={`force-option ${forceMap[item.key] === opt.value ? "selected" : ""}`}
                            onClick={() => setForceValue(item.key, opt.value)}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="section-actions">
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton onClick={() => setStage("force_signal")} disabled={FORCE_MAP_ITEMS.some((item) => !forceMap[item.key])}>Dalej →</PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}


          {stage === "force_signal" && path && (
            <PauseInsightPanel
              insight={buildPauseInsight("force", path, answers, forceMap, burdens, truthCards)}
              onBack={goBack}
              onNext={() => setStage("burdens")}
              nextLabel="Dalej →"
            />
          )}

          {stage === "burdens" && path && (
            <motion.div key={`${path.key}-burdens`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="section-head compact">
                <div>
                  <div className="eyebrow">MAPA RELACJI · KROK 2 Z 4</div>
                  <h2>Co najbardziej ciąży?</h2>
                  <p>Wybierz maksymalnie trzy rzeczy. Kolejność kliknięcia oznacza wagę: 1 to największy ciężar.</p>
                </div>
                <div className="progress-wrap">
                  <span>{burdens.length}/3</span>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${(burdens.length / 3) * 100}%` }} /></div>
                </div>
              </div>
              <Glass className="question-panel relationship-map-panel">
                <div className="burden-grid">
                  {BURDEN_OPTIONS.map((label) => {
                    const selected = burdens.find((item) => item.label === label);
                    return (
                      <button
                        key={label}
                        type="button"
                        className={`burden-chip ${selected ? "selected" : ""}`}
                        onClick={() => toggleBurden(label)}
                      >
                        {selected && <span className="burden-rank">{selected.rank}</span>}
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="map-step-note">
                  Bez przeciągania i bez precyzyjnego celowania. Klikasz tylko to, co faktycznie najbardziej ustawia tę relację.
                </div>
                <div className="section-actions">
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton onClick={() => setStage("burden_signal")} disabled={burdens.length < 1}>Dalej →</PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}


          {stage === "burden_signal" && path && (
            <PauseInsightPanel
              insight={buildPauseInsight("burdens", path, answers, forceMap, burdens, truthCards)}
              onBack={goBack}
              onNext={() => setStage("truth_cards")}
              nextLabel="Dalej →"
            />
          )}

          {stage === "truth_cards" && path && (
            <motion.div key={`${path.key}-truth-cards`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="section-head compact">
                <div>
                  <div className="eyebrow">MAPA RELACJI · KROK 3 Z 4</div>
                  <h2>Moment prawdy</h2>
                  <p>Zaznacz jedno albo dwa zdania, które najbardziej trafiają w to, czego nie chcesz już obchodzić dookoła.</p>
                </div>
                <div className="progress-wrap">
                  <span>{truthCards.length}/2</span>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${(truthCards.length / 2) * 100}%` }} /></div>
                </div>
              </div>
              <Glass className="question-panel relationship-map-panel">
                <div className="truth-card-grid">
                  {TRUTH_CARD_OPTIONS.map((text) => {
                    const selected = truthCards.includes(text);
                    return (
                      <button
                        key={text}
                        type="button"
                        className={`truth-card-choice ${selected ? "selected" : ""}`}
                        onClick={() => toggleTruthCard(text)}
                      >
                        <span className="truth-check">{selected ? "✓" : ""}</span>
                        <span>{text}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="map-step-note">
                  To nie jest test. Chodzi o rozpoznanie zdania, które robi największe „klik” w Twojej sytuacji.
                </div>
                <div className="section-actions">
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton onClick={() => setStage("truth_signal")} disabled={truthCards.length < 1}>Dalej →</PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}


          {stage === "truth_signal" && path && (
            <PauseInsightPanel
              insight={buildPauseInsight("truth", path, answers, forceMap, burdens, truthCards)}
              onBack={goBack}
              onNext={() => setStage("short_note")}
              nextLabel="Dalej →"
            />
          )}

          {stage === "short_note" && path && (
            <motion.div key={`${path.key}-short-note`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="section-head compact">
                <div>
                  <div className="eyebrow">MAPA RELACJI · KROK 4 Z 4</div>
                  <h2>Jedno zdanie od Ciebie</h2>
                  <p>Dopisz jedną rzecz, której nie było w odpowiedziach. Może być jednym zdaniem.</p>
                </div>
                <div className="progress-wrap">
                  <span>Ostatni krok</span>
                  <div className="progress-track"><div className="progress-fill" style={{ width: "100%" }} /></div>
                </div>
              </div>
              <Glass className="question-panel relationship-map-panel">
                <div className="map-summary-box">
                  <div>
                    <span>Układ sił</span>
                    <strong>{FORCE_MAP_ITEMS.filter((item) => forceMap[item.key]).length}/{FORCE_MAP_ITEMS.length}</strong>
                  </div>
                  <div>
                    <span>Ciężary</span>
                    <strong>{burdens.map((item) => `${item.rank}. ${item.label}`).join(" · ") || "brak"}</strong>
                  </div>
                  <div>
                    <span>Moment prawdy</span>
                    <strong>{truthCards.length ? `${truthCards.length} zaznaczone` : "brak"}</strong>
                  </div>
                </div>
                <textarea
                  className="ctms-textarea ctms-textarea--short"
                  value={relationshipNote}
                  onChange={(e) => setRelationshipNote(e.target.value)}
                  placeholder="Np. Po kłótni ja próbuję wrócić do rozmowy, a druga strona milczy przez kilka dni."
                  maxLength={500}
                />
                <div className="text-meta"><div>Opcjonalnie, ale bardzo pomaga analizie.</div><div>{relationshipNote.length}/500</div></div>
                <div className="section-actions">
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton onClick={prepareMapSummary} disabled={busy}>Dalej →</PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}


          {stage === "map_summary" && path && (
            <motion.div key={`${path.key}-map-summary`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="section-head compact">
                <div>
                  <div className="eyebrow">PRZED WYNIKIEM</div>
                  <h2>Nie zgadujemy. Dopytamy o konkret</h2>
                  <p>Wybory pokazały kierunek. Teraz potrzebny jest przykład z życia, żeby raport nie powtórzył tylko tego, co zostało kliknięte.</p>
                </div>
                <div className="progress-wrap">
                  <span>Mapa gotowa</span>
                  <div className="progress-track"><div className="progress-fill" style={{ width: "100%" }} /></div>
                </div>
              </div>
              <Glass className="question-panel relationship-map-panel signal-panel">
                <div className="signal-orbit" aria-hidden="true">
                  <div className="signal-core">Mapa<br />Relacji</div>
                  <span className="signal-dot dot-a" />
                  <span className="signal-dot dot-b" />
                  <span className="signal-dot dot-c" />
                </div>
                <div className="signal-grid">
                  {buildMapSignals(forceMap, burdens, truthCards).map((signal) => (
                    <div key={signal.label} className={`signal-card ${signal.tone}`}>
                      <span>{signal.label}</span>
                      <strong>{signal.value}</strong>
                    </div>
                  ))}
                </div>
                <div className="visual-insight-panel">
                  <div className="eyebrow">CO TRZEBA SPRAWDZIĆ</div>
                  <VisualBars items={buildMapVisualBars(forceMap, burdens, truthCards)} />
                </div>
                <div className="cycle-panel">
                  <div className="eyebrow">MOŻLIWY PRZEBIEG</div>
                  <CycleDiagram steps={buildCycleSteps(path.key, burdens, truthCards)} />
                </div>
                <div className="map-step-note strong-note">
                  Jeszcze {clarificationQuestions.length || 1} {clarificationQuestions.length === 1 ? "konkretna odpowiedź" : clarificationQuestions.length === 2 ? "konkretne odpowiedzi" : "konkretne odpowiedzi"}. Chodzi o przykład, nie o długi opis.
                </div>
                <div className="section-actions">
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton onClick={goToClarification}>Dalej →</PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {stage === "clarification" && path && clarificationQuestions[clarificationIndex] && (
            <motion.div key={`${path.key}-clarification-${clarificationIndex}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="section-head compact">
                <div>
                  <div className="eyebrow">JEDEN KONKRET {clarificationIndex + 1} Z {clarificationQuestions.length}</div>
                  <h2>{clarificationQuestions[clarificationIndex].signal}</h2>
                  <p>{clarificationQuestions[clarificationIndex].lead} Odpowiedz zwyczajnie, na przykładzie jednej sytuacji.</p>
                </div>
                <div className="progress-wrap">
                  <span>{clarificationIndex + 1}/{clarificationQuestions.length}</span>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${((clarificationIndex + 1) / clarificationQuestions.length) * 100}%` }} /></div>
                </div>
              </div>
              <Glass className="question-panel relationship-map-panel clarification-panel">
                <div className="clarification-question">
                  {clarificationQuestions[clarificationIndex].text}
                </div>
                <textarea
                  className="ctms-textarea clarification-textarea"
                  value={clarificationDraft}
                  onChange={(e) => setClarificationDraft(e.target.value)}
                  placeholder="Np. Po ostatniej kłótni ja napisałem pierwszy, ona odpisała po dwóch dniach i temat już nie wrócił."
                  maxLength={700}
                />
                <div className="text-meta"><div>Wystarczą konkrety. Nie pisz wypracowania.</div><div>{clarificationDraft.length}/700</div></div>
                <div className="section-actions">
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <GhostButton onClick={() => saveClarificationAndNext(true)}>Pomiń</GhostButton>
                  <PrimaryButton onClick={() => saveClarificationAndNext(false)} disabled={busy || clarificationDraft.trim().length < 12}>{clarificationIndex >= clarificationQuestions.length - 1 ? (busy ? "Analizuję..." : "Pokaż pierwszy obraz sytuacji") : "Dalej →"}</PrimaryButton>
                </div>
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
                  <h3>{interviewState?.finished ? "Jest coś, czego jeszcze nie nazwałeś, a co może być kluczowe?" : path.openPrompt}</h3>
                  <p style={{ color: BRAND.muted, fontSize: "14px", marginTop: "10px", lineHeight: 1.65 }}>Napisz naturalnie, jak do kogoś, kto ma zobaczyć sens w chaosie.</p>
                </div>
                <textarea className="ctms-textarea" value={openText} onChange={(e) => setOpenText(e.target.value)} placeholder="Co konkretnie się dzieje? Opisz fakty..." maxLength={3000} />
                <div className="text-meta"><div>To jest rdzeń analizy.</div><div>{openText.length}/3000</div></div>
                <div className="section-actions">
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton onClick={() => buildPreviewAndGo()} disabled={busy || openText.trim().length < 10}>{busy ? "Analizuję..." : "Pokaż pierwszy obraz sytuacji"}</PrimaryButton>
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

          {stage === "preview" && (() => {
            const safePreview = preview || (path ? buildPreview(path, answers, openText || buildCompositeOpenText(clarificationAnswers)) : null);
            const previewForRender = safePreview;
            return previewForRender ? (
            (() => { const preview = previewForRender; return (
            <motion.div key="preview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="preview-card preview-card--report">
                <div className="preview-hero">
                  <div className="eyebrow">PIERWSZY OBRAZ SYTUACJI</div>
                  <h2>{preview.headline}</h2>
                  <div className="preview-truth-top">{preview.truth}</div>
                  <div className="preview-mirror-top">{preview.mirror}</div>
                </div>
                <PremiumBadge preview={preview} />
                <div className="preview-disclaimer">
                  To nie jest diagnoza ani decyzja za Ciebie. To krótki odczyt sytuacji: co już widać, co może Cię mylić i co warto sprawdzić dalej.
                </div>
                <Glass className="preview-visual-panel">
                  <div className="eyebrow">CO POKAZUJĄ ODPOWIEDZI</div>
                  <VisualBars items={buildPreviewVisualBars(preview)} />
                  {path && (
                    <div className="preview-cycle-wrap">
                      <div className="eyebrow">CO MOŻE SIĘ POWTARZAĆ</div>
                      <CycleDiagram steps={buildCycleSteps(path.key, burdens, truthCards)} />
                    </div>
                  )}
                </Glass>
                <div className="metrics-grid">
                  {([[preview.tension, "NAPIĘCIE"], [preview.asymmetry, "ASYMETRIA"], [preview.change, "SZANSA ZMIANY"]] as [number, string][]).map(([value, label]) => (
                    <Glass key={label} className="metric-card"><div className="metric-value">{value}%</div><div className="metric-label">{label}</div></Glass>
                  ))}
                </div>
                <Glass className="preview-metrics-explained">
                  <div className="eyebrow">CO WARTO ZOBACZYĆ W TYCH WYNIKACH</div>
                  <div className="metric-explain-grid">
                    {metricExplanationCards(preview).map((item) => (
                      <div key={item.label} className="metric-explain-card">
                        <div className="metric-explain-head"><strong>{item.label}</strong><span>{item.value}%</span></div>
                        <p>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </Glass>
                <Glass className="preview-analysis-panel">
                  <div className="eyebrow">NAJWAŻNIEJSZE Z TEJ CZĘŚCI</div>
                  <div className="preview-analysis-grid">
                    <div className="preview-analysis-item">
                      <span>01</span>
                      <strong>Fakt, którego nie trzeba już udowadniać</strong>
                      <p>{previewFallbackText(preview, "whatUserKnows", preview.summary)}</p>
                    </div>
                    <div className="preview-analysis-item highlight">
                      <span>02</span>
                      <strong>Co to zmienia</strong>
                      <p>{previewFallbackText(preview, "hiddenInsight", preview.mirror)}</p>
                    </div>
                    <div className="preview-analysis-item">
                      <span>03</span>
                      <strong>Co wymaga sprawdzenia</strong>
                      <p>{previewFallbackText(preview, "contradiction", "Sprawdź, czy to, na co liczysz, zgadza się z tym, co rzeczywiście regularnie dzieje się między Wami.")}</p>
                    </div>
                    <div className="preview-analysis-item conclusion">
                      <span>04</span>
                      <strong>Konkretny wniosek</strong>
                      <p>{previewFallbackText(preview, "concreteConclusion", preview.summary)}</p>
                    </div>
                  </div>
                </Glass>
                <div className="preview-grid">
                  <Glass className="report-section"><div className="eyebrow">NAJWAŻNIEJSZY WNIOSEK</div><p>{preview.summary}</p></Glass>
                  <Glass className="report-section"><div className="eyebrow">CO TO ZMIENIA</div><p>{preview.tone === "green" ? "Ten wynik nie mówi, że wszystko jest idealne. Mówi, że w odpowiedziach widać elementy, na których realnie można się oprzeć." : preview.tone === "yellow" ? "Ten wynik nie rozstrzyga za Ciebie. Pokazuje, że obok nadziei działa też coś, czego nie warto już tłumaczyć przypadkiem." : "Ten wynik nie mówi tylko, że jest trudno. Pokazuje, że trudność zaczęła mieć powtarzalny kształt."}</p></Glass>
                  <Glass className="report-section"><div className="eyebrow">CO DAJE PEŁNA ANALIZA</div><p>{preview.paidTease}</p></Glass>
                </div>
                {path && (
                  <Glass className="preview-map-panel">
                    <div className="eyebrow">CO JUŻ SIĘ RYSUJE</div>
                    <div className="preview-map-grid">
                      {buildPreviewMap(path, preview).map((item) => (
                        <div key={item.label} className="preview-map-item">
                          <strong>{item.label}</strong>
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </Glass>
                )}
                {path && (
                  <Glass className="unlock-panel unlock-panel--strong">
                    <div className="eyebrow">CO DOSTAJESZ W PEŁNEJ ANALIZIE</div>
                    <p className="unlock-copy">Nie chodzi o dłuższą wersję tych samych zdań. Pełny raport pokazuje, gdzie ten układ się zapętla, co daje prawdziwą nadzieję, co tylko ją udaje i jakie są trzy możliwe dalsze scenariusze.</p>
                    <div className="premium-sample-grid">
                      {buildPremiumSamples(path, preview).map((item, index) => (
                        <div key={item.title} className="premium-sample-card">
                          <div className="premium-sample-no">0{index + 1}</div>
                          <strong>{item.title}</strong>
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="unlock-benefits">
                      {[
                        "co naprawdę trzyma Cię w tej relacji",
                        "gdzie jest największe napięcie i koszt emocjonalny",
                        "czy problem wraca, czy da się go realnie zatrzymać",
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
                      <PrimaryButton onClick={pay} disabled={busy}>{busy ? "Przetwarzanie..." : "Pokaż pełną analizę tej relacji"}</PrimaryButton>
                    </div>
                  </Glass>
                )}
                {error && <div className="error-line">{error}</div>}
                <div className="section-actions"><GhostButton onClick={goBack}>Wróć</GhostButton><GhostButton onClick={resetAll}>Od początku</GhostButton></div>
              </Glass>
            </motion.div>
            ); })()
            ) : <ProcessingScreen />;
          })()}

          {stage === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProcessingScreen />
            </motion.div>
          )}

          {stage === "paid" && fullReport && (
            <motion.div key="paid" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="preview-card preview-card--report paid-report-card">
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
