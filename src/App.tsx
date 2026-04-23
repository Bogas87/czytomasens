import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function readApiBase(): string {
  try {
    const metaEnv =
      typeof import.meta !== "undefined" ? (import.meta as any)?.env : undefined;
    const value = metaEnv?.VITE_API_BASE;
    return typeof value === "string" ? value.replace(/\/$/, "") : "";
  } catch {
    return "";
  }
}

const API_BASE = readApiBase();

const BRAND = {
  bg: "#050505",
  panel: "rgba(255,255,255,0.035)",
  panelStrong: "rgba(255,255,255,0.055)",
  border: "rgba(255,255,255,0.08)",
  text: "#F5F1EA",
  muted: "#AAA198",
  gold: "#C5A059",
  danger: "#E2A3A3",
  success: "#B9D4B3",
  yellow: "#D7B978",
};

type Stage =
  | "landing"
  | "consent"
  | "entry"
  | "questions"
  | "checkpoint"
  | "open_text"
  | "preview"
  | "processing"
  | "paid"
  | "crisis"
  | "error";

type EntryKey =
  | "betrayal"
  | "uncertain"
  | "stagnation"
  | "returning"
  | "triangle"
  | "loop";

type Option = {
  id: string;
  label: string;
  score: number;
};

type Question = {
  id: string;
  lead: string;
  text: string;
  options: Option[];
};

type EntryConfig = {
  key: EntryKey;
  title: string;
  subtitle: string;
  intro: string;
  questions: Question[];
  checkpoint: {
    title: string;
    text: string;
    options: Option[];
  };
  openPrompt: string;
};

type AnswerMap = Record<string, string>;

type Preview = {
  chance: number;
  tension: number;
  asymmetry: number;
  change: number;
  badge: string;
  headline: string;
  mirror: string;
  summary: string;
  paidTease: string;
  tone: "red" | "yellow" | "green";
  truthLine: string;
};

type FullReport = {
  headline?: string;
  subheadline?: string;
  previewLine?: string;
  tensionPercent?: number;
  driftPercent?: number;
  rebuildPercent?: number;
  sections?: { title: string; text: string; tone?: "normal" | "gold" | "danger" }[];
  closing?: string;
};

type SessionCreateResponse = {
  ok?: boolean;
  token?: string;
  sessionId?: string;
};

const STORAGE_KEY = "ctms_premium_front_v4";

const CONSENTS = [
  "Rozumiem, że to narzędzie ma charakter analityczny i rozwojowy, a nie medyczny, psychoterapeutyczny ani prawny.",
  "Rozumiem, że wynik raportu jest interpretacją opartą na moich odpowiedziach i nie stanowi nieomylnego werdyktu o drugiej osobie.",
  "Wyrażam zgodę na przetwarzanie podanych przeze mnie danych w celu wygenerowania raportu i realizacji usługi cyfrowej.",
];

const SOCIAL_PROOF = [
  "„Pierwszy raz coś nazwało to tak wprost, bez pocieszania.”",
  "„Najgorsze było to, że ten wynik brzmiał dokładnie jak moja sytuacja.”",
  "„To nie dało mi komfortu. Dało mi jasność. I tego właśnie potrzebowałam.”",
];

const ENTRY_CONFIGS: EntryConfig[] = [
  {
    key: "betrayal",
    title: "Po zdradzie albo utracie zaufania",
    subtitle:
      "Tu nie chodzi już tylko o fakt. Chodzi o to, co ta historia zrobiła z poczuciem bezpieczeństwa.",
    intro:
      "Ta ścieżka sprawdza nie tylko ranę, ale też to, czy po niej pojawiła się odpowiedzialność, przejrzystość i realna odbudowa.",
    questions: [
      {
        id: "b1",
        lead: "Po pęknięciu liczą się nie słowa, tylko sposób dźwigania szkody.",
        text:
          "Czy druga strona naprawdę wzięła odpowiedzialność, czy raczej próbowała rozmyć winę?",
        options: [
          { id: "a", label: "Rozmywała winę i mieszała odpowiedzialność", score: 3 },
          { id: "b", label: "Brała odpowiedzialność, ale niespójnie", score: 2 },
          { id: "c", label: "Wzięła ją realnie i konkretnie", score: 0 },
        ],
      },
      {
        id: "b2",
        lead: "Zaufanie nie wraca od deklaracji. Wraca od przewidywalności.",
        text:
          "Czy po tym wydarzeniu pojawiła się większa przejrzystość, czy nadal żyjesz w napięciu i domysłach?",
        options: [
          { id: "a", label: "Nadal żyję głównie w napięciu", score: 3 },
          { id: "b", label: "Trochę się poprawiło, ale nie do końca", score: 2 },
          { id: "c", label: "Tak, zrobiło się dużo jaśniej", score: 0 },
        ],
      },
      {
        id: "b3",
        lead: "Ciało zwykle wie szybciej niż głowa.",
        text:
          "Czy mimo prób naprawy nadal łapiesz się na czujności, kontroli albo ciągłym sprawdzaniu?",
        options: [
          { id: "a", label: "Tak, bardzo mocno", score: 3 },
          { id: "b", label: "Czasem tak", score: 2 },
          { id: "c", label: "Nie, to prawie już nie wraca", score: 0 },
        ],
      },
      {
        id: "b4",
        lead: "Tu wychodzi prawda o naprawie.",
        text:
          "Gdy wracasz do bólu, druga strona jest obecna i cierpliwa, czy bardziej zirytowana, że temat jeszcze żyje?",
        options: [
          { id: "a", label: "Raczej zirytowana albo uciekająca", score: 3 },
          { id: "b", label: "Bywa różnie", score: 2 },
          { id: "c", label: "Jest obecna i cierpliwa", score: 0 },
        ],
      },
    ],
    checkpoint: {
      title: "Checkpoint",
      text:
        "Co dziś bardziej trzyma tę relację: poczucie bezpieczeństwa czy lęk przed stratą i nadzieja, że jeszcze się ułoży?",
      options: [
        { id: "a", label: "Bardziej lęk i nadzieja", score: 3 },
        { id: "b", label: "Jedno i drugie", score: 2 },
        { id: "c", label: "Raczej bezpieczeństwo", score: 0 },
      ],
    },
    openPrompt:
      "Napisz bez wygładzania: co dokładnie pękło po utracie zaufania i po czym poznajesz, że do dziś nie wróciło w pełni?",
  },
  {
    key: "uncertain",
    title: "Nie wiem, na czym stoję",
    subtitle:
      "Nadzieja miesza się z niejasnością, a Ty ciągle próbujesz to jakoś sobie wytłumaczyć.",
    intro:
      "Ta ścieżka sprawdza, czy Twoja niepewność wynika z realnej złożoności, czy z długiego oswajania chaosu.",
    questions: [
      {
        id: "u1",
        lead: "Gdy coś jest ciągle niejasne, zwykle komuś to służy.",
        text:
          "Czy często masz wrażenie, że nie do końca wiesz, co właściwie dla tej osoby znaczysz?",
        options: [
          { id: "a", label: "Tak, bardzo często", score: 3 },
          { id: "b", label: "Czasem", score: 2 },
          { id: "c", label: "Nie, to jest raczej jasne", score: 0 },
        ],
      },
      {
        id: "u2",
        lead: "Słowa i czyny rzadko rozjeżdżają się przez przypadek miesiącami.",
        text:
          "Czy druga strona mówi rzeczy dające nadzieję, ale jej zachowanie nie idzie za tym?",
        options: [
          { id: "a", label: "Tak, dokładnie tak to działa", score: 3 },
          { id: "b", label: "Bywa różnie", score: 2 },
          { id: "c", label: "Nie, jest raczej spójność", score: 0 },
        ],
      },
      {
        id: "u3",
        lead: "Czyjaś uwaga pojawiająca się głównie przy Twoim wycofaniu też coś mówi.",
        text:
          "Czy druga strona daje Ci uwagę głównie wtedy, gdy zaczynasz się wycofywać?",
        options: [
          { id: "a", label: "Tak, dokładnie tak", score: 3 },
          { id: "b", label: "Czasem tak", score: 2 },
          { id: "c", label: "Nie, tego nie widzę", score: 0 },
        ],
      },
      {
        id: "u4",
        lead: "Kto chce jasno, zwykle nie boi się jasności.",
        text:
          "Gdy próbujesz doprecyzować, czym to właściwie jest, druga strona wchodzi w konkret czy rozmywa temat?",
        options: [
          { id: "a", label: "Rozmywa temat", score: 3 },
          { id: "b", label: "Trochę dopowiada, ale bez konkretu", score: 2 },
          { id: "c", label: "Wchodzi w konkret", score: 0 },
        ],
      },
    ],
    checkpoint: {
      title: "Checkpoint",
      text:
        "Czy Twoja niepewność wynika bardziej z realnej złożoności sytuacji, czy z tego, że druga strona daje Ci za mało jasności?",
      options: [
        { id: "a", label: "Raczej z za małej jasności", score: 3 },
        { id: "b", label: "Jedno i drugie", score: 2 },
        { id: "c", label: "Raczej z samej złożoności", score: 0 },
      ],
    },
    openPrompt:
      "Napisz bez upiększania: co dokładnie Ci tu nie pasuje, mimo że może jeszcze nie umiesz tego nazwać jednym zdaniem?",
  },
  {
    key: "stagnation",
    title: "To trwa, ale coraz mniej tam życia",
    subtitle:
      "Brak wielkich awantur nie musi oznaczać spokoju. Czasem oznacza wygasanie.",
    intro:
      "Ta ścieżka bada, czy między Wami jest cisza stabilna, czy cisza obojętności.",
    questions: [
      {
        id: "s1",
        lead: "Relacja gaśnie najpierw w drobiazgach.",
        text:
          "Czy coraz częściej czujesz, że jesteście obok siebie, ale nie naprawdę ze sobą?",
        options: [
          { id: "a", label: "Tak, dokładnie tak", score: 3 },
          { id: "b", label: "Czasem", score: 2 },
          { id: "c", label: "Nie, nadal czuję połączenie", score: 0 },
        ],
      },
      {
        id: "s2",
        lead: "Gdy jedna strona ciągnie całość, to już nie jest równowaga.",
        text:
          "Czy masz poczucie, że to Ty częściej inicjujesz rozmowę, bliskość albo ratowanie atmosfery?",
        options: [
          { id: "a", label: "Tak, głównie ja", score: 3 },
          { id: "b", label: "Po części", score: 2 },
          { id: "c", label: "Nie, to jest raczej obustronne", score: 0 },
        ],
      },
      {
        id: "s3",
        lead: "Długie usprawiedliwianie bywa sposobem na niepatrzenie prawdzie w oczy.",
        text:
          "Czy coraz częściej tłumaczysz brak zaangażowania drugiej strony stresem albo trudnym czasem?",
        options: [
          { id: "a", label: "Tak, często to robię", score: 3 },
          { id: "b", label: "Czasem", score: 2 },
          { id: "c", label: "Nie, widzę to dość jasno", score: 0 },
        ],
      },
      {
        id: "s4",
        lead: "Prawda często wychodzi wtedy, gdy przestajesz ciągnąć wszystko sam.",
        text:
          "Gdybyś dziś przestał inicjować kontakt i ratować atmosferę, ta relacja dalej miałaby własny napęd?",
        options: [
          { id: "a", label: "Nie, raczej by siadła", score: 3 },
          { id: "b", label: "Nie wiem, mam wątpliwości", score: 2 },
          { id: "c", label: "Tak, myślę że by się utrzymała", score: 0 },
        ],
      },
    ],
    checkpoint: {
      title: "Checkpoint",
      text:
        "Czy dziś bardziej czujesz zmęczenie tą relacją czy realną chęć budowania jej dalej?",
      options: [
        { id: "a", label: "Bardziej zmęczenie", score: 3 },
        { id: "b", label: "Jedno i drugie", score: 2 },
        { id: "c", label: "Raczej realną chęć budowania", score: 0 },
      ],
    },
    openPrompt:
      "Napisz szczerze: co dokładnie zgasło między Wami i od kiedy coraz trudniej Ci udawać, że to tylko chwilowe?",
  },
  {
    key: "returning",
    title: "Po rozstaniu nie wiem, czy wracać",
    subtitle:
      "Tęsknota potrafi udawać sens. Tu trzeba oddzielić brak domknięcia od realnej szansy.",
    intro:
      "Ta ścieżka odróżnia realny sens powrotu od głodu kontaktu, samotności i przywiązania.",
    questions: [
      {
        id: "r1",
        lead: "Tęsknić można za człowiekiem, ale też za ulgą po jego powrocie.",
        text:
          "Czy bardziej tęsknisz za tą osobą, czy za poczuciem, że nie jesteś sam i coś jeszcze może wrócić?",
        options: [
          { id: "a", label: "Bardziej za ulgą i możliwością powrotu", score: 3 },
          { id: "b", label: "Trudno to oddzielić", score: 2 },
          { id: "c", label: "Naprawdę bardziej za tą osobą", score: 0 },
        ],
      },
      {
        id: "r2",
        lead: "To, dlaczego się skończyło, dalej ma znaczenie.",
        text:
          "Czy powody rozstania były czymś głębokim i powtarzalnym, czy raczej wynikały z jednego kryzysu?",
        options: [
          { id: "a", label: "Były głębokie i powtarzalne", score: 3 },
          { id: "b", label: "Po trochu jedno i drugie", score: 2 },
          { id: "c", label: "Raczej pojedynczy kryzys", score: 0 },
        ],
      },
      {
        id: "r3",
        lead: "Rozłąka lubi wygładzać to, co wcześniej bolało.",
        text:
          "Czy zauważasz, że po czasie pamiętasz głównie dobre momenty, a słabiej czujesz to, co Cię niszczyło?",
        options: [
          { id: "a", label: "Tak, mam tendencję do idealizowania", score: 3 },
          { id: "b", label: "Trochę tak", score: 2 },
          { id: "c", label: "Nie, widzę całość dość jasno", score: 0 },
        ],
      },
      {
        id: "r4",
        lead: "Powrót bez nowych zasad zwykle kończy się starym układem.",
        text:
          "Gdyby doszło do powrotu, czy wiesz jasno, czego już więcej nie chcesz powtórzyć?",
        options: [
          { id: "a", label: "Nie, bardziej chcę wrócić niż mam jasność", score: 3 },
          { id: "b", label: "Częściowo", score: 2 },
          { id: "c", label: "Tak, mam to dość jasno", score: 0 },
        ],
      },
    ],
    checkpoint: {
      title: "Checkpoint",
      text:
        "Gdybyś miał odjąć samotność, tęsknotę i lęk przed ostatecznością — czy nadal równie mocno chciałbyś wrócić?",
      options: [
        { id: "a", label: "Nie, wtedy to byłoby słabsze", score: 3 },
        { id: "b", label: "Nie wiem", score: 2 },
        { id: "c", label: "Tak, nadal mocno", score: 0 },
      ],
    },
    openPrompt:
      "Napisz uczciwie: za czym naprawdę tęsknisz po tym rozstaniu i co w Tobie najmocniej pcha Cię dziś w stronę powrotu?",
  },
  {
    key: "triangle",
    title: "Jest ktoś trzeci i wszystko się miesza",
    subtitle:
      "Pojawienie się innej osoby nie zawsze jest przyczyną. Czasem obnaża to, czego brakowało wcześniej.",
    intro:
      "Ta ścieżka sprawdza, czy nowa osoba jest impulsem, ucieczką, czy sygnałem głębszego rozpadu obecnej relacji.",
    questions: [
      {
        id: "t1",
        lead: "To rzadko bierze się znikąd.",
        text:
          "Czy pojawienie się tej osoby uderzyło Cię dlatego, że w obecnej relacji czegoś od dawna brakowało?",
        options: [
          { id: "a", label: "Tak, bardzo to odsłoniło", score: 3 },
          { id: "b", label: "Po części", score: 2 },
          { id: "c", label: "Nie, to raczej osobna historia", score: 1 },
        ],
      },
      {
        id: "t2",
        lead: "Fantazja działa inaczej niż relacja w codzienności.",
        text:
          "Czy znasz tę nową osobę na tyle realnie, żeby oceniać ją poza emocjonalnym uniesieniem?",
        options: [
          { id: "a", label: "Nie, to bardziej napięcie i wyobrażenie", score: 2 },
          { id: "b", label: "Trochę tak", score: 1 },
          { id: "c", label: "Tak, znam ją dość realnie", score: 0 },
        ],
      },
      {
        id: "t3",
        lead: "Czasem nie szukamy kogoś, tylko wyjścia z własnego utknięcia.",
        text:
          "Czy ta nowa osoba daje Ci bardziej ekscytację, czy poczucie zobaczenia czegoś, czego od dawna Ci brakowało?",
        options: [
          { id: "a", label: "Bardziej poczucie zobaczenia", score: 3 },
          { id: "b", label: "Jedno i drugie", score: 2 },
          { id: "c", label: "Bardziej ekscytację i impuls", score: 1 },
        ],
      },
      {
        id: "t4",
        lead: "Najgorzej, gdy trwa się w zawieszeniu i konsumuje oba światy.",
        text:
          "Czy dziś bardziej odkładasz decyzję, niż naprawdę próbujesz zobaczyć, co jest prawdą o obecnej relacji?",
        options: [
          { id: "a", label: "Tak, jestem w zawieszeniu", score: 3 },
          { id: "b", label: "Po części", score: 2 },
          { id: "c", label: "Nie, próbuję patrzeć uczciwie", score: 0 },
        ],
      },
    ],
    checkpoint: {
      title: "Checkpoint",
      text:
        "Gdyby tej trzeciej osoby nagle nie było, czy problem w obecnej relacji i tak dalej byłby dla Ciebie poważny?",
      options: [
        { id: "a", label: "Tak, i tak byłby poważny", score: 3 },
        { id: "b", label: "Nie wiem, ale chyba tak", score: 2 },
        { id: "c", label: "Nie, wtedy wszystko byłoby prostsze", score: 0 },
      ],
    },
    openPrompt:
      "Napisz uczciwie: czego naprawdę szukasz w tej trzeciej osobie i co to mówi o tym, czego już nie znajdujesz w obecnej relacji?",
  },
  {
    key: "loop",
    title: "Kręcimy się w kółko",
    subtitle:
      "Wracacie do siebie, odchodzicie, znowu wracacie — i nic realnie się nie zmienia.",
    intro:
      "Ta ścieżka rozbiera cykl napięcie–ulga–powrót–kolejny zjazd.",
    questions: [
      {
        id: "l1",
        lead: "Silne emocje często mylą się z głębią.",
        text:
          "Czy najmocniej czujesz tę relację wtedy, gdy coś się sypie albo ktoś odchodzi?",
        options: [
          { id: "a", label: "Tak, wtedy wszystko robi się najmocniejsze", score: 3 },
          { id: "b", label: "Czasem tak", score: 2 },
          { id: "c", label: "Nie, bliskość nie zależy od dramatu", score: 0 },
        ],
      },
      {
        id: "l2",
        lead: "Ciągłe gaszenie pożaru też staje się rytmem.",
        text:
          "Czy masz poczucie, że bardziej walczysz o utrzymanie kontaktu niż naprawdę w nim jesteś?",
        options: [
          { id: "a", label: "Tak, to bardziej walka niż relacja", score: 3 },
          { id: "b", label: "Bywa różnie", score: 2 },
          { id: "c", label: "Nie, czuję obecność i spójność", score: 0 },
        ],
      },
      {
        id: "l3",
        lead: "Obietnice bez nowego zachowania to tylko nowa wersja starego.",
        text:
          "Czy po kolejnych kryzysach pojawiały się konkretne zmiany, które utrzymały się dłużej niż chwilę?",
        options: [
          { id: "a", label: "Nie, raczej słowa niż realna zmiana", score: 3 },
          { id: "b", label: "Trochę tak, ale niestabilnie", score: 2 },
          { id: "c", label: "Tak, były konkretne i trwałe zmiany", score: 0 },
        ],
      },
      {
        id: "l4",
        lead: "Prawdziwa relacja daje kierunek, nie tylko chwilę ulgi.",
        text:
          "Czy kiedy myślisz o przyszłości, czujesz spokój czy raczej napięcie i niepewność?",
        options: [
          { id: "a", label: "Raczej napięcie i niepewność", score: 3 },
          { id: "b", label: "Mieszankę jednego i drugiego", score: 2 },
          { id: "c", label: "Raczej spokój", score: 0 },
        ],
      },
    ],
    checkpoint: {
      title: "Checkpoint",
      text:
        "Kiedy wracasz do tej osoby, co jest silniejsze: realna poprawa czy ulga, że znowu nie tracisz kontaktu?",
      options: [
        { id: "a", label: "Bardziej ulga niż realna poprawa", score: 3 },
        { id: "b", label: "Po trochu jedno i drugie", score: 2 },
        { id: "c", label: "Raczej realna poprawa", score: 0 },
      ],
    },
    openPrompt:
      "Napisz bez filtra: co dokładnie wraca między Wami i dlaczego mimo tego nadal trudno Ci to odciąć?",
  },
];

function safeNumber(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function hasCrisisContent(text: string): boolean {
  const patterns = [
    /nie\s+chc[eę]\s+[zż]y[cć]/i,
    /samob[oó]j/i,
    /zabij(e|ę|esz|a)/i,
    /boj[eę]\s+si[eę].*(zabije|uderzy|skrzywdzi)/i,
    /pobi[łl]/i,
    /przemoc/i,
    /grozi/i,
    /n[oó][zż]/i,
    /krew/i,
  ];
  return patterns.some((re) => re.test(text));
}

function buildTruthLine(path: EntryConfig, chance: number, openText: string): string {
  const lower = openText.toLowerCase();

  if (chance <= 24) {
    if (path.key === "loop") {
      return "Najbardziej nie trzyma Was tu już rozwój relacji, tylko ulga po kolejnym powrocie.";
    }
    if (path.key === "betrayal") {
      return "To nie wygląda jak rana, która naprawdę się zabliźnia. Bardziej jak rana, wokół której nauczyliście się chodzić.";
    }
    if (path.key === "uncertain") {
      return "Najmocniej boli tu nie brak odpowiedzi. Najmocniej boli to, że za długo próbujesz nie nazywać tego po imieniu.";
    }
    if (path.key === "stagnation") {
      return "To już bardziej przypomina wygaszanie niż chwilowy kryzys.";
    }
    if (path.key === "returning") {
      return "To, co Cię cofa, wygląda bardziej na głód ulgi niż na realny fundament do powrotu.";
    }
    if (path.key === "triangle") {
      return "Problemem nie jest tylko ktoś trzeci. Problemem jest to, co jego pojawienie się tak wyraźnie odsłoniło.";
    }
  }

  if (chance <= 49) {
    if (lower.includes("boję") || lower.includes("strach")) {
      return "W tej historii obok więzi bardzo mocno pracuje też lęk. A lęk długo potrafi udawać sens.";
    }
    return "Jeszcze nie wszystko tu pękło, ale już zdecydowanie nie wszystko tu jest zdrowe i stabilne.";
  }

  if (chance <= 69) {
    return "Coś tu jeszcze ma wartość, ale samo przywiązanie nie wystarczy, żeby to bezpiecznie unieść dalej.";
  }

  return "Tu nadal widać realny materiał, ale nawet relacja z potencjałem może się rozjechać, jeśli zignoruje swoje słabsze miejsca.";
}

function buildPreview(path: EntryConfig, answers: AnswerMap, openText: string): Preview {
  const scoreMap = new Map<string, number>();

  for (const q of path.questions) {
    for (const opt of q.options) {
      scoreMap.set(`${q.id}:${opt.id}`, opt.score);
    }
  }

  for (const opt of path.checkpoint.options) {
    scoreMap.set(`${path.key}_checkpoint:${opt.id}`, opt.score);
  }

  let total = 0;
  for (const [qid, oid] of Object.entries(answers)) {
    total += scoreMap.get(`${qid}:${oid}`) ?? 0;
  }

  const max = path.questions.length * 3 + 3;
  const intensity = max > 0 ? total / max : 0;
  const textPenalty =
    openText.trim().length > 220 ? 4 : openText.trim().length > 120 ? 2 : 0;

  const chance = safeNumber(
    100 - Math.round(intensity * 76) - textPenalty,
    8,
    88
  );
  const tension = safeNumber(Math.round(28 + intensity * 59), 14, 96);
  const asymmetry = safeNumber(Math.round(24 + intensity * 62), 12, 97);
  const change = safeNumber(Math.round(74 - intensity * 48), 8, 84);

  const truthLine = buildTruthLine(path, chance, openText);

  if (chance <= 24) {
    return {
      chance,
      tension,
      asymmetry,
      change,
      truthLine,
      tone: "red",
      badge: "Wzorzec wysokiego ryzyka",
      headline:
        "To bardziej wygląda na relację kosztowną emocjonalnie niż na układ, który sam się naprostuje.",
      mirror:
        "Na dziś więcej wskazuje tu na przeciążający mechanizm niż na stabilny grunt. Coś jeszcze Cię trzyma, ale coraz mniej przypomina to bezpieczeństwo, a coraz bardziej napięcie, przywiązanie albo lęk przed odpuszczeniem.",
      summary:
        "Ten wynik zwykle pojawia się wtedy, gdy w środku relacji działa już nie tylko uczucie, ale też chaos, nierówność, powracające rozjazdy albo chroniczny brak jasności. To nie musi oznaczać jednego prostego wyroku. Ale oznacza, że dalsze trwanie bez realnej zmiany będzie kosztowne.",
      paidTease:
        "Pełny raport rozpisze, co tu naprawdę trzyma Cię najmocniej: więź, lęk, przywiązanie, iluzja zmiany czy brak domknięcia.",
    };
  }

  if (chance <= 49) {
    return {
      chance,
      tension,
      asymmetry,
      change,
      truthLine,
      tone: "yellow",
      badge: "Układ chwiejny i niespójny",
      headline: "Tu bardziej widać chwiejność niż spójność.",
      mirror:
        "Coś jeszcze tę relację trzyma, ale obok tego widać już rozjazdy, które nie są drobiazgiem. To nie wygląda jak zwykły chwilowy zjazd, tylko jak układ, który potrafi trwać długo i jednocześnie powoli wyczerpywać.",
      summary:
        "Ten wynik zwykle pojawia się tam, gdzie obok przywiązania albo nadziei mocno pracują już też inne siły: niejasność, zmęczenie, nierówne zaangażowanie, trudność z odcięciem albo chroniczny brak stabilności. To jeszcze nie czarna ściana, ale to też nie jest spokojny grunt.",
      paidTease:
        "Pełny raport rozłoży tę relację na warstwy: co jeszcze działa, co już się rozjechało i gdzie leży największe ryzyko dalszego trwania.",
    };
  }

  if (chance <= 69) {
    return {
      chance,
      tension,
      asymmetry,
      change,
      truthLine,
      tone: "yellow",
      badge: "Jest potencjał, ale nie bez zastrzeżeń",
      headline: "Tu coś jeszcze ma sens, ale nie na autopilocie.",
      mirror:
        "Nie wygląda to ani na historię całkowicie pustą, ani na relację oczywiście skazaną na powtarzanie tego samego. Widać jednak miejsca, które wymagają więcej niż samej dobrej woli i nadziei, że jakoś się ułoży.",
      summary:
        "Ten wynik zwykle oznacza relację, która ma jeszcze materiał, ale nie obroni się samym sentymentem albo przywiązaniem. Potrzebuje spójności działań, jasności i czegoś bardziej realnego niż tylko chęć, żeby nie stracić tego, co już było.",
      paidTease:
        "W pełnej wersji dostajesz rozkład: co daje nadzieję, co ją podcina i które mechanizmy najmocniej wpływają na ten wynik.",
    };
  }

  return {
    chance,
    tension,
    asymmetry,
    change,
    truthLine,
    tone: "green",
    badge: "Układ z realnym potencjałem",
    headline: "Tu jeszcze widać grunt, nie tylko emocje.",
    mirror:
      "Na tym etapie w odpowiedziach jest więcej spójności niż chaosu. To nie znaczy, że nie ma słabszych punktów. Znaczy tyle, że ta relacja nie wygląda wyłącznie na historię napędzaną lękiem, niejasnością albo samym nawykiem wracania.",
    summary:
      "Ten wynik zwykle pojawia się tam, gdzie obok napięcia nadal istnieje też realna struktura: kontakt, wzajemność, zdolność do rozmowy albo szansa na zmianę oparta na czymś więcej niż impuls. To nie jest gwarancja, ale jest materiał, który może mieć rzeczywistą wartość.",
    paidTease:
      "Pełna analiza pokaże, z czego dokładnie bierze się ten potencjał i gdzie mimo wszystko ukryte są jego słabsze miejsca.",
  };
}

async function createSession(entryKey: EntryKey): Promise<SessionCreateResponse> {
  const res = await fetch(`${API_BASE}/api/session/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entryKey }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Nie udało się utworzyć sesji.");
  return data;
}

async function updateSession(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/session/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Nie udało się zapisać sesji.");
  return data;
}

async function createCheckout(
  token: string,
  email: string,
  consentAcceptedAt: string
): Promise<{ url: string }> {
  const res = await fetch(`${API_BASE}/api/create-checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, email, consentAcceptedAt }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || "Błąd inicjalizacji płatności.");
  }
  return { url: data.url };
}

async function fetchPaidReport(token: string): Promise<FullReport> {
  const MAX_ATTEMPTS = 20;
  const INTERVAL_MS = 3000;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const res = await fetch(`${API_BASE}/api/report/${encodeURIComponent(token)}`);
    if (res.status === 202) {
      await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
      continue;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.error || "Błąd pobierania raportu.");
    }

    if (!data?.report) {
      throw new Error("Serwer nie zwrócił raportu.");
    }

    return data.report as FullReport;
  }

  throw new Error(
    "Raport jest nadal przygotowywany. Sprawdź e-mail — wyślemy Ci bezpieczny link, gdy będzie gotowy."
  );
}

function LogoBlock() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: BRAND.gold,
            boxShadow: `0 0 28px ${BRAND.gold}`,
          }}
        />
        <div
          style={{
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: -1.4,
            color: BRAND.text,
          }}
        >
          CzyToMaSens<span style={{ color: BRAND.gold }}>.</span>
        </div>
      </div>
      <div style={{ color: BRAND.muted, letterSpacing: 4, fontSize: 11 }}>
        PRYWATNA ANALIZA RELACJI
      </div>
    </div>
  );
}

function Glass({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${BRAND.panelStrong}, ${BRAND.panel})`,
        border: `1px solid ${BRAND.border}`,
        borderRadius: 30,
        boxShadow: "0 24px 90px rgba(0,0,0,0.34)",
        backdropFilter: "blur(18px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        borderRadius: 999,
        padding: "16px 24px",
        background: BRAND.gold,
        color: "#101010",
        border: `1px solid ${BRAND.gold}`,
        fontWeight: 800,
        fontSize: 15,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        borderRadius: 999,
        padding: "16px 22px",
        background: "rgba(255,255,255,0.03)",
        color: BRAND.text,
        border: `1px solid ${BRAND.border}`,
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function PremiumBadge({ preview }: { preview: Preview }) {
  const color =
    preview.tone === "red"
      ? BRAND.danger
      : preview.tone === "green"
      ? BRAND.success
      : BRAND.yellow;

  return (
    <Glass style={{ padding: 28, textAlign: "center", borderColor: color }}>
      <div style={{ color: BRAND.muted, letterSpacing: 4, fontSize: 11 }}>
        NA ILE TO MA SENS
      </div>
      <div
        style={{
          fontSize: "clamp(64px, 12vw, 92px)",
          lineHeight: 1,
          fontWeight: 900,
          color,
          marginTop: 8,
        }}
      >
        {preview.chance}%
      </div>
      <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800 }}>
        {preview.badge}
      </div>
      <div style={{ marginTop: 12, color: BRAND.text, fontSize: 18, lineHeight: 1.65 }}>
        {preview.truthLine}
      </div>
      <div style={{ marginTop: 12, color: BRAND.muted, lineHeight: 1.7 }}>
        {preview.mirror}
      </div>
    </Glass>
  );
}

function ProgressBar({
  index,
  total,
}: {
  index: number;
  total: number;
}) {
  const percent = safeNumber(Math.round(((index + 1) / total) * 100), 0, 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ color: BRAND.muted, fontSize: 14 }}>{percent}%</div>
      <div
        style={{
          width: 120,
          height: 3,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: BRAND.gold,
          }}
        />
      </div>
    </div>
  );
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
  const [consents, setConsents] = useState<boolean[]>([false, false, false]);

  const path = useMemo(
    () => ENTRY_CONFIGS.find((x) => x.key === selectedPath) || null,
    [selectedPath]
  );

  const currentQuestion = path?.questions[questionIndex] || null;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setStage(parsed.stage || "landing");
        setSelectedPath(parsed.selectedPath || null);
        setQuestionIndex(parsed.questionIndex || 0);
        setAnswers(parsed.answers || {});
        setOpenText(parsed.openText || "");
        setEmail(parsed.email || "");
        setPreview(parsed.preview || null);
        setFullReport(parsed.fullReport || null);
        setSessionToken(parsed.sessionToken || null);
        setConsents(parsed.consents || [false, false, false]);
      }
    } catch {
      // ignore restore error
    }

    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const token = params.get("token");
    const cancel =
      params.get("cancel") || params.get("cancelled") || params.get("canceled");

    if (cancel === "1" || cancel === "true") {
      setBusy(false);
      setStage("preview");
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    if (success === "1" && token) {
      setBusy(true);
      setStage("processing");

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
            e?.message ||
              "Płatność wróciła poprawnie, ale nie udało się pobrać raportu."
          );
        })
        .finally(() => {
          window.history.replaceState({}, "", window.location.pathname);
        });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        stage,
        selectedPath,
        questionIndex,
        answers,
        openText,
        email,
        preview,
        fullReport,
        sessionToken,
        consents,
      })
    );
  }, [
    stage,
    selectedPath,
    questionIndex,
    answers,
    openText,
    email,
    preview,
    fullReport,
    sessionToken,
    consents,
  ]);

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStage("landing");
    setSelectedPath(null);
    setQuestionIndex(0);
    setAnswers({});
    setOpenText("");
    setEmail("");
    setPreview(null);
    setFullReport(null);
    setSessionToken(null);
    setBusy(false);
    setError(null);
    setConsents([false, false, false]);
    window.history.replaceState({}, "", window.location.pathname);
  };

  const startPath = async (key: EntryKey) => {
    setBusy(true);
    setError(null);
    try {
      const data = await createSession(key);
      setSessionToken(data?.token || data?.sessionId || null);
      setSelectedPath(key);
      setQuestionIndex(0);
      setAnswers({});
      setOpenText("");
      setPreview(null);
      setFullReport(null);
      setStage("questions");
    } catch (e: any) {
      setError(e?.message || "Nie udało się rozpocząć sesji.");
      setStage("error");
    } finally {
      setBusy(false);
    }
  };

  const answerQuestion = (qid: string, optionId: string) => {
    const next = { ...answers, [qid]: optionId };
    setAnswers(next);

    if (!path) return;

    if (questionIndex >= path.questions.length - 1) {
      setStage("checkpoint");
      return;
    }

    setQuestionIndex((v) => Math.max(0, v + 1));
  };

  const answerCheckpoint = (optionId: string) => {
    if (!path) return;
    setAnswers((prev) => ({ ...prev, [`${path.key}_checkpoint`]: optionId }));
    setStage("open_text");
  };

  const goBack = () => {
    setError(null);

    if (stage === "questions") {
      if (questionIndex === 0) {
        setStage("entry");
        return;
      }
      setQuestionIndex((v) => Math.max(0, v - 1));
      return;
    }

    if (stage === "checkpoint") {
      setStage("questions");
      return;
    }

    if (stage === "open_text") {
      setStage("checkpoint");
      return;
    }

    if (stage === "preview") {
      setStage("open_text");
      return;
    }

    if (stage === "consent") {
      setStage("landing");
      return;
    }

    if (stage === "entry") {
      setStage("consent");
    }
  };

  const buildPreviewAndGo = async () => {
    if (!path) return;

    if (hasCrisisContent(openText)) {
      setStage("crisis");
      return;
    }

    const previewData = buildPreview(path, answers, openText);
    setPreview(previewData);

    try {
      if (sessionToken) {
        await updateSession({
          token: sessionToken,
          path: path.key,
          answers,
          openText,
          preview: previewData,
          stage: "preview",
        });
      }
    } catch {
      // silent fallback
    }

    setStage("preview");
  };

  const pay = async () => {
    if (!sessionToken) {
      setError("Brak tokenu sesji.");
      return;
    }

    if (!email.includes("@")) {
      setError("Podaj prawidłowy e-mail.");
      return;
    }

    if (!preview || !selectedPath) {
      setError("Brak gotowego preview do zapisania.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await updateSession({
        token: sessionToken,
        path: selectedPath,
        answers,
        openText,
        preview,
        email,
        consentAcceptedAt: new Date().toISOString(),
        stage: "checkout_started",
      });

      const checkout = await createCheckout(
        sessionToken,
        email,
        new Date().toISOString()
      );

      window.location.href = checkout.url;
    } catch (e: any) {
      setError(e?.message || "Nie udało się rozpocząć płatności.");
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background:
          "radial-gradient(circle at 12% 8%, rgba(197,160,89,0.15), transparent 28%), radial-gradient(circle at 85% 10%, rgba(255,255,255,0.05), transparent 20%), #050505",
        color: BRAND.text,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div className="page-wrap">
        <div className="topbar">
          <LogoBlock />
          {stage !== "landing" && <GhostButton onClick={resetAll}>Od początku</GhostButton>}
        </div>

        <AnimatePresence mode="wait">
          {stage === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="hero-grid">
                <Glass style={{ padding: 38, minHeight: 560 }}>
                  <div
                    style={{
                      color: BRAND.gold,
                      fontSize: 12,
                      letterSpacing: 5,
                      marginBottom: 18,
                    }}
                  >
                    NIE TEST. NIE TERAPIA. NIE LUKIER.
                  </div>

                  <div className="hero-title">
                    Coś Ci tu nie gra.
                    <br />
                    I bardzo możliwe,
                    <br />
                    że już to wiesz.
                  </div>

                  <div className="hero-copy">
                    To nie ma Cię pogłaskać. To ma oddzielić to, co naprawdę
                    dzieje się w tej relacji, od tego, co jeszcze próbujesz
                    obronić nadzieją, przywiązaniem albo strachem przed końcem.
                  </div>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
                    <PrimaryButton onClick={() => setStage("consent")}>
                      Rozpocznij wgląd w relację
                    </PrimaryButton>
                    <GhostButton onClick={() => setStage("entry")}>
                      Zobacz, od czego możesz zacząć
                    </GhostButton>
                  </div>

                  <div className="feature-grid">
                    {[
                      [
                        "Rozmowa, nie quiz",
                        "System nie wrzuca wszystkich w jedną listę pytań. Wchodzi przez problem, a potem schodzi głębiej.",
                      ],
                      [
                        "Lustro, nie pocieszanie",
                        "Tu nie chodzi o ładne zdania. Chodzi o trafność, napięcie i nazwanie mechanizmu, który już działa.",
                      ],
                      [
                        "Preview, które wbija hak",
                        "Najpierw widzisz kierunek i jedno mocne lustro. Dopiero potem decydujesz, czy chcesz zejść głębiej.",
                      ],
                    ].map(([t, d]) => (
                      <Glass key={t} style={{ padding: 20, borderRadius: 24 }}>
                        <div style={{ fontWeight: 800, fontSize: 20 }}>{t}</div>
                        <div style={{ marginTop: 10, color: BRAND.muted, lineHeight: 1.65 }}>
                          {d}
                        </div>
                      </Glass>
                    ))}
                  </div>
                </Glass>

                <div style={{ display: "grid", gap: 18 }}>
                  <Glass style={{ padding: 26 }}>
                    <div
                      style={{
                        color: BRAND.gold,
                        fontSize: 12,
                        letterSpacing: 4,
                        marginBottom: 14,
                      }}
                    >
                      WEJŚCIA PROBLEMOWE
                    </div>
                    <div style={{ display: "grid", gap: 14, lineHeight: 1.7 }}>
                      <div>Wracacie do siebie i nic się nie naprawia.</div>
                      <div>To trwa, ale coraz mniej tam życia.</div>
                      <div>Była zdrada, kłamstwo albo pęknięcie zaufania.</div>
                      <div>Jest ktoś trzeci i wszystko się miesza.</div>
                      <div>Po rozstaniu nie wiesz, czy wracać.</div>
                      <div>Niby nic wielkiego się nie stało, ale coś Ci nie pasuje.</div>
                    </div>
                  </Glass>

                  <Glass style={{ padding: 26 }}>
                    <div
                      style={{
                        color: BRAND.gold,
                        fontSize: 12,
                        letterSpacing: 4,
                        marginBottom: 14,
                      }}
                    >
                      CO DOSTAJESZ
                    </div>
                    <div style={{ fontSize: 20, lineHeight: 1.7, color: BRAND.muted }}>
                      Najpierw darmowe lustro sytuacji. Potem pełny raport premium:
                      mechanizmy, ryzyka, scenariusze, praktyczne wskazówki i jasny werdykt.
                    </div>
                  </Glass>

                  <Glass style={{ padding: 26 }}>
                    <div
                      style={{
                        color: BRAND.gold,
                        fontSize: 12,
                        letterSpacing: 4,
                        marginBottom: 14,
                      }}
                    >
                      GŁOSY PO PIERWSZYCH ANALIZACH
                    </div>
                    <div style={{ display: "grid", gap: 12, color: BRAND.muted, lineHeight: 1.75 }}>
                      {SOCIAL_PROOF.map((item) => (
                        <div key={item}>{item}</div>
                      ))}
                    </div>
                  </Glass>
                </div>
              </div>
            </motion.div>
          )}

          {stage === "consent" && (
            <motion.div
              key="consent"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Glass style={{ padding: 34, maxWidth: 900, margin: "0 auto" }}>
                <div
                  style={{
                    color: BRAND.gold,
                    fontSize: 12,
                    letterSpacing: 5,
                    marginBottom: 18,
                  }}
                >
                  ZANIM WEJDZIESZ GŁĘBIEJ
                </div>

                <div className="section-title">To ma być trafne, nie miłe.</div>

                <div style={{ marginTop: 18, color: BRAND.muted, lineHeight: 1.8, fontSize: 17 }}>
                  Ten produkt analizuje wzorce i dynamikę relacji. Nie zastępuje terapii,
                  diagnozy ani porady prawnej. Po płatności dostajesz treść cyfrową od razu.
                  To wejście jest dla ludzi, którzy chcą widzieć jaśniej, nie ładniej.
                </div>

                <div style={{ display: "grid", gap: 14, marginTop: 24 }}>
                  {CONSENTS.map((text, idx) => (
                    <label
                      key={idx}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                        lineHeight: 1.75,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={consents[idx]}
                        onChange={(e) => {
                          const next = [...consents];
                          next[idx] = e.target.checked;
                          setConsents(next);
                        }}
                        style={{ marginTop: 4 }}
                      />
                      <span>{text}</span>
                    </label>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton
                    onClick={() => setStage("entry")}
                    disabled={!consents.every(Boolean)}
                  >
                    Rozumiem, wchodzę dalej
                  </PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {stage === "entry" && (
            <motion.div
              key="entry"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "end",
                  gap: 20,
                  marginBottom: 18,
                }}
              >
                <div>
                  <div style={{ color: BRAND.gold, fontSize: 12, letterSpacing: 5 }}>
                    PUNKT WEJŚCIA
                  </div>
                  <div className="section-title">Od czego ta historia boli najmocniej?</div>
                  <div style={{ marginTop: 12, color: BRAND.muted, lineHeight: 1.75 }}>
                    Zacznij od miejsca, które najbardziej ciągnie Cię w dół. System dopasuje
                    dalszą rozmowę do Twojej sytuacji.
                  </div>
                </div>
                <GhostButton onClick={goBack}>Wróć</GhostButton>
              </div>

              <div className="entry-grid">
                {ENTRY_CONFIGS.map((entry) => (
                  <Glass key={entry.key} style={{ padding: 24 }}>
                    <div
                      style={{
                        color: BRAND.gold,
                        fontSize: 11,
                        letterSpacing: 4,
                        marginBottom: 10,
                      }}
                    >
                      ŚCIEŻKA ANALIZY
                    </div>
                    <div
                      style={{
                        fontSize: 30,
                        lineHeight: 1.05,
                        fontWeight: 800,
                        letterSpacing: -1.4,
                      }}
                    >
                      {entry.title}
                    </div>
                    <div style={{ marginTop: 10, lineHeight: 1.65 }}>{entry.subtitle}</div>
                    <div style={{ marginTop: 14, color: BRAND.muted, lineHeight: 1.75 }}>
                      {entry.intro}
                    </div>
                    <div style={{ marginTop: 20 }}>
                      <PrimaryButton onClick={() => startPath(entry.key)}>
                        {busy ? "Przygotowuję..." : "Wejdź tą ścieżką"}
                      </PrimaryButton>
                    </div>
                  </Glass>
                ))}
              </div>
            </motion.div>
          )}

          {stage === "questions" && path && currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                  gap: 18,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ color: BRAND.gold, fontSize: 12, letterSpacing: 5 }}>
                  {path.title.toUpperCase()}
                </div>
                <ProgressBar index={questionIndex} total={path.questions.length} />
              </div>

              <Glass style={{ padding: 34, maxWidth: 900 }}>
                <div style={{ color: BRAND.muted, fontSize: 18, lineHeight: 1.65 }}>
                  {currentQuestion.lead}
                </div>

                <div className="question-title">{currentQuestion.text}</div>

                <div style={{ marginTop: 28, display: "grid", gap: 12 }}>
                  {currentQuestion.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => answerQuestion(currentQuestion.id, opt.id)}
                      style={{
                        textAlign: "left",
                        padding: "22px 18px",
                        borderRadius: 22,
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${BRAND.border}`,
                        color: BRAND.text,
                        fontSize: 18,
                        cursor: "pointer",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <GhostButton onClick={resetAll}>Od początku</GhostButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {stage === "checkpoint" && path && (
            <motion.div
              key={`${path.key}-checkpoint`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Glass style={{ padding: 34, maxWidth: 900, margin: "0 auto" }}>
                <div
                  style={{
                    color: BRAND.gold,
                    fontSize: 12,
                    letterSpacing: 5,
                    marginBottom: 16,
                  }}
                >
                  {path.checkpoint.title}
                </div>

                <div className="section-title">{path.checkpoint.text}</div>

                <div style={{ display: "grid", gap: 12, marginTop: 26 }}>
                  {path.checkpoint.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => answerCheckpoint(opt.id)}
                      style={{
                        textAlign: "left",
                        padding: "22px 18px",
                        borderRadius: 22,
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${BRAND.border}`,
                        color: BRAND.text,
                        fontSize: 18,
                        cursor: "pointer",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: 22 }}>
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {stage === "open_text" && path && (
            <motion.div
              key={`${path.key}-open`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Glass style={{ padding: 34, maxWidth: 960, margin: "0 auto" }}>
                <div
                  style={{
                    color: BRAND.gold,
                    fontSize: 12,
                    letterSpacing: 5,
                    marginBottom: 16,
                  }}
                >
                  OSTATNIA WARSTWA
                </div>

                <div className="section-title">{path.openPrompt}</div>

                <textarea
                  value={openText}
                  onChange={(e) => setOpenText(e.target.value)}
                  placeholder="Napisz bez filtra. Im uczciwiej, tym bardziej trafne będzie lustro i późniejszy raport."
                  maxLength={3000}
                  style={{
                    width: "100%",
                    minHeight: 220,
                    marginTop: 22,
                    padding: 18,
                    borderRadius: 24,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${BRAND.border}`,
                    color: BRAND.text,
                    fontSize: 17,
                    lineHeight: 1.75,
                    outline: "none",
                    resize: "vertical",
                  }}
                />

                <div
                  style={{
                    marginTop: 10,
                    color: BRAND.muted,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div>Ta odpowiedź pogłębia lustro i ustawia ton raportu.</div>
                  <div>{openText.length}/3000</div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton
                    onClick={buildPreviewAndGo}
                    disabled={openText.trim().length < 40}
                  >
                    Pokaż darmowy preview
                  </PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {stage === "crisis" && (
            <motion.div
              key="crisis"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Glass
                style={{
                  padding: 34,
                  maxWidth: 860,
                  margin: "0 auto",
                  borderColor: BRAND.danger,
                }}
              >
                <div
                  style={{
                    color: BRAND.danger,
                    fontSize: 12,
                    letterSpacing: 5,
                    marginBottom: 16,
                  }}
                >
                  TRYB KRYZYSOWY
                </div>

                <div className="section-title">
                  To nie jest właściwe narzędzie dla sytuacji bezpośredniego zagrożenia.
                </div>

                <div
                  style={{
                    marginTop: 18,
                    color: BRAND.muted,
                    lineHeight: 1.8,
                    fontSize: 18,
                  }}
                >
                  Jeśli istnieje ryzyko przemocy, zagrożenia życia albo zrobienia sobie
                  krzywdy, przerwij tę analizę i skorzystaj z natychmiastowej pomocy.
                </div>

                <div style={{ display: "grid", gap: 14, marginTop: 24 }}>
                  <Glass style={{ padding: 18, borderRadius: 20 }}>
                    <strong>112</strong> — numer alarmowy
                  </Glass>
                  <Glass style={{ padding: 18, borderRadius: 20 }}>
                    <strong>116 123</strong> — telefon zaufania dla osób dorosłych w kryzysie emocjonalnym
                  </Glass>
                  <Glass style={{ padding: 18, borderRadius: 20 }}>
                    <strong>116 111</strong> — telefon zaufania dla dzieci i młodzieży
                  </Glass>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
                  <GhostButton onClick={resetAll}>Zamknij analizę</GhostButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {stage === "preview" && preview && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Glass style={{ padding: 34, maxWidth: 1040, margin: "0 auto" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    gap: 20,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: BRAND.gold,
                        fontSize: 12,
                        letterSpacing: 5,
                        marginBottom: 14,
                      }}
                    >
                      DARMOWE LUSTRO SYTUACJI
                    </div>
                    <div className="section-title" style={{ maxWidth: 760 }}>
                      {preview.headline}
                    </div>
                    <div
                      style={{
                        marginTop: 18,
                        fontSize: 22,
                        lineHeight: 1.65,
                        color: BRAND.text,
                        maxWidth: 800,
                      }}
                    >
                      {preview.truthLine}
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 19,
                        lineHeight: 1.75,
                        color: BRAND.muted,
                        maxWidth: 780,
                      }}
                    >
                      {preview.mirror}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 22 }}>
                  <PremiumBadge preview={preview} />
                </div>

                <div className="metrics-grid">
                  {[
                    [preview.tension, "POZIOM NAPIĘCIA"],
                    [preview.asymmetry, "ASYMETRIA"],
                    [preview.change, "SZANSA ZMIANY"],
                  ].map(([value, label]) => (
                    <Glass key={label as string} style={{ padding: 22, textAlign: "center", borderRadius: 24 }}>
                      <div
                        style={{
                          fontSize: 54,
                          lineHeight: 1,
                          fontWeight: 900,
                          color: BRAND.gold,
                        }}
                      >
                        {value}%
                      </div>
                      <div
                        style={{
                          marginTop: 10,
                          color: BRAND.muted,
                          fontSize: 11,
                          letterSpacing: 4,
                        }}
                      >
                        {label}
                      </div>
                    </Glass>
                  ))}
                </div>

                <div className="teaser-grid">
                  <Glass style={{ padding: 24, borderRadius: 24 }}>
                    <div
                      style={{
                        color: BRAND.gold,
                        fontSize: 12,
                        letterSpacing: 4,
                        marginBottom: 10,
                      }}
                    >
                      CO WIDAĆ JUŻ TERAZ
                    </div>
                    <div style={{ lineHeight: 1.85 }}>{preview.summary}</div>
                  </Glass>

                  <Glass style={{ padding: 24, borderRadius: 24 }}>
                    <div
                      style={{
                        color: BRAND.gold,
                        fontSize: 12,
                        letterSpacing: 4,
                        marginBottom: 10,
                      }}
                    >
                      NAJMOCNIEJSZY MECHANIZM
                    </div>
                    <div style={{ lineHeight: 1.85 }}>
                      {preview.tone === "green"
                        ? "Najmocniej działa tu jeszcze struktura i wzajemność, ale to nie zwalnia z patrzenia na słabsze miejsca."
                        : preview.tone === "yellow"
                        ? "Napięcie miesza się tu z nadzieją i przywiązaniem. To właśnie ta mieszanka najłatwiej utrzymuje ludzi w zawieszeniu."
                        : "Najmocniej pracuje tu układ ulgi po napięciu albo lęku przed stratą. To często sprawia, że ciężko odpuścić nawet wtedy, gdy relacja już kosztuje."}
                    </div>
                  </Glass>

                  <Glass style={{ padding: 24, borderRadius: 24 }}>
                    <div
                      style={{
                        color: BRAND.gold,
                        fontSize: 12,
                        letterSpacing: 4,
                        marginBottom: 10,
                      }}
                    >
                      CZEGO PEŁNY RAPORT NIE OMINIE
                    </div>
                    <div style={{ lineHeight: 1.85 }}>{preview.paidTease}</div>
                  </Glass>
                </div>

                <Glass style={{ padding: 24, marginTop: 20, borderRadius: 24 }}>
                  <div
                    style={{
                      color: BRAND.gold,
                      fontSize: 12,
                      letterSpacing: 4,
                      marginBottom: 10,
                    }}
                  >
                    PEŁNY RAPORT PREMIUM
                  </div>

                  <div
                    style={{
                      fontSize: 18,
                      color: BRAND.text,
                      lineHeight: 1.75,
                      maxWidth: 840,
                    }}
                  >
                    Odblokujesz pełną analizę: mechanizmy, ryzyka, scenariusze,
                    praktyczne wskazówki i jasny werdykt. Dostajesz wersję, do której
                    można wrócić później — nie jednorazowy ekran, który znika po odświeżeniu.
                  </div>

                  <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Adres e-mail do raportu premium"
                      style={{
                        width: "100%",
                        padding: "18px 16px",
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${BRAND.border}`,
                        borderRadius: 20,
                        color: BRAND.text,
                        fontSize: 16,
                        outline: "none",
                      }}
                    />

                    <PrimaryButton onClick={pay} disabled={busy}>
                      {busy ? "Przetwarzanie..." : "Odblokuj pełny raport — 15 zł"}
                    </PrimaryButton>

                    <div style={{ color: BRAND.muted, fontSize: 14 }}>
                      Najpierw widzisz lustro sytuacji. Potem decydujesz, czy chcesz zejść głębiej.
                    </div>
                  </div>
                </Glass>

                {error && <div style={{ color: BRAND.danger, marginTop: 14 }}>{error}</div>}

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <GhostButton onClick={resetAll}>Od początku</GhostButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {stage === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ minHeight: "72vh", display: "grid", placeItems: "center" }}>
                <Glass style={{ padding: 34, textAlign: "center", minWidth: 280 }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      margin: "0 auto 18px",
                      borderRadius: 999,
                      border: `3px solid rgba(197,160,89,0.25)`,
                      borderTopColor: BRAND.gold,
                      animation: "spin 1.1s linear infinite",
                    }}
                  />
                  <div style={{ fontSize: 24, fontWeight: 700 }}>
                    Przetwarzanie płatności i raportu…
                  </div>
                  <div style={{ marginTop: 10, color: BRAND.muted }}>
                    Jeśli to trwa chwilę, nie zamykaj karty. System sprawdza status płatności i raportu.
                  </div>
                </Glass>
              </div>
            </motion.div>
          )}

          {stage === "paid" && fullReport && (
            <motion.div
              key="paid"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Glass style={{ padding: 34, maxWidth: 980, margin: "0 auto" }}>
                <div
                  style={{
                    color: BRAND.gold,
                    fontSize: 12,
                    letterSpacing: 5,
                    marginBottom: 16,
                  }}
                >
                  RAPORT PREMIUM
                </div>

                <div className="section-title">
                  {fullReport.headline ||
                    "Ta relacja daje Ci kontakt, ale nie daje Ci oparcia."}
                </div>

                <div
                  style={{
                    marginTop: 14,
                    fontSize: 20,
                    color: BRAND.muted,
                    lineHeight: 1.75,
                  }}
                >
                  {fullReport.subheadline ||
                    "Największy problem nie leży w jednym zdarzeniu. Leży w tym, że napięcie stało się normą, a jasność nadal nie przychodzi."}
                </div>

                {typeof fullReport.rebuildPercent === "number" && (
                  <div className="metrics-grid" style={{ marginTop: 26 }}>
                    {[
                      [fullReport.rebuildPercent, "NA ILE TO MA SENS"],
                      [fullReport.tensionPercent || 0, "POZIOM NAPIĘCIA"],
                      [fullReport.driftPercent || 0, "ASYMETRIA"],
                    ].map(([value, label]) => (
                      <Glass key={label as string} style={{ padding: 22, textAlign: "center", borderRadius: 24 }}>
                        <div
                          style={{
                            fontSize: 48,
                            lineHeight: 1,
                            fontWeight: 900,
                            color: BRAND.gold,
                          }}
                        >
                          {value}%
                        </div>
                        <div
                          style={{
                            marginTop: 10,
                            color: BRAND.muted,
                            fontSize: 11,
                            letterSpacing: 4,
                          }}
                        >
                          {label}
                        </div>
                      </Glass>
                    ))}
                  </div>
                )}

                {fullReport.previewLine && (
                  <div
                    style={{
                      marginTop: 22,
                      borderLeft: `3px solid ${BRAND.gold}`,
                      paddingLeft: 16,
                      fontSize: 20,
                      lineHeight: 1.75,
                      color: BRAND.text,
                    }}
                  >
                    {fullReport.previewLine}
                  </div>
                )}

                <div style={{ display: "grid", gap: 18, marginTop: 22 }}>
                  {(fullReport.sections || []).map((section, i) => (
                    <Glass key={i} style={{ padding: 22, borderRadius: 24 }}>
                      <div
                        style={{
                          fontSize: 11,
                          letterSpacing: 5,
                          textTransform: "uppercase",
                          marginBottom: 8,
                          color: section.tone === "danger" ? BRAND.danger : BRAND.gold,
                        }}
                      >
                        {section.title}
                      </div>
                      <div style={{ fontSize: 18, lineHeight: 1.85, color: "#d1d5db" }}>
                        {section.text}
                      </div>
                    </Glass>
                  ))}
                </div>

                {fullReport.closing && (
                  <div
                    style={{
                      marginTop: 26,
                      paddingTop: 20,
                      borderTop: `1px solid ${BRAND.border}`,
                      fontSize: 18,
                      lineHeight: 1.85,
                      color: BRAND.muted,
                    }}
                  >
                    {fullReport.closing}
                  </div>
                )}

                <Glass style={{ padding: 20, marginTop: 22, borderRadius: 24 }}>
                  <div style={{ color: BRAND.muted, lineHeight: 1.75 }}>
                    Dostęp do raportu został zapisany. Możesz wrócić do niego później z bezpiecznego linku wysłanego na e-mail.
                  </div>
                </Glass>

                <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <GhostButton onClick={resetAll}>Nowa analiza</GhostButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {stage === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Glass style={{ padding: 34, maxWidth: 860, margin: "0 auto" }}>
                <div
                  style={{
                    color: BRAND.danger,
                    fontSize: 12,
                    letterSpacing: 5,
                    marginBottom: 16,
                  }}
                >
                  BŁĄD
                </div>

                <div className="section-title">
                  Coś się wywaliło po drodze, ale przynajmniej wiemy gdzie.
                </div>

                <div style={{ marginTop: 16, color: BRAND.muted, lineHeight: 1.8 }}>
                  {error}
                </div>

                <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <GhostButton onClick={() => setStage(preview ? "preview" : "landing")}>
                    Wróć
                  </GhostButton>
                  <GhostButton onClick={resetAll}>Od początku</GhostButton>
                </div>
              </Glass>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; min-height: 100%; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .page-wrap { max-width: 1220px; margin: 0 auto; padding: 26px 22px 60px; }
        .topbar { display: flex; justify-content: space-between; align-items: center; gap: 18px; margin-bottom: 26px; }
        .hero-grid { display: grid; grid-template-columns: 1.18fr 0.82fr; gap: 18px; }
        .feature-grid { margin-top: 34px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .entry-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 18px; }
        .teaser-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 18px; }
        .hero-title { font-size: 78px; line-height: 0.93; font-weight: 900; letter-spacing: -3px; max-width: 780px; }
        .hero-copy { margin-top: 22px; font-size: 22px; line-height: 1.7; color: ${BRAND.muted}; max-width: 760px; }
        .section-title { font-size: 54px; line-height: 0.98; font-weight: 900; letter-spacing: -2.2px; max-width: 780px; }
        .question-title { margin-top: 24px; font-size: 62px; line-height: 0.98; font-weight: 900; letter-spacing: -2.6px; }
        @media (max-width: 980px) {
          .hero-grid, .entry-grid, .feature-grid, .metrics-grid, .teaser-grid { grid-template-columns: 1fr; }
          .hero-title { font-size: 54px; line-height: 1.01; letter-spacing: -2px; }
          .hero-copy { font-size: 18px; line-height: 1.75; }
          .section-title { font-size: 40px; line-height: 1.02; letter-spacing: -1.6px; }
          .question-title { font-size: 42px; line-height: 1.02; letter-spacing: -1.7px; }
          .topbar { align-items: flex-start; }
          .page-wrap { padding: 20px 16px 48px; }
        }
      `}</style>
    </div>
  );
}