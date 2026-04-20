import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE || "";

const BRAND = {
  bg: "#050505",
  panel: "rgba(255,255,255,0.04)",
  panelStrong: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.08)",
  text: "#F5F1EA",
  muted: "#A8A099",
  gold: "#C5A059",
  danger: "#E5A4A4",
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
  | "error";

type EntryKey =
  | "betrayal"
  | "uncertain"
  | "stagnation"
  | "returning"
  | "triangle"
  | "loop";

type Option = { id: string; label: string; score: number };
type Question = { id: string; lead: string; text: string; options: Option[] };
type EntryConfig = {
  key: EntryKey;
  title: string;
  subtitle: string;
  intro: string;
  questions: Question[];
  checkpoint: { title: string; text: string; options: Option[] };
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
};

type FullReport = {
  headline?: string;
  subheadline?: string;
  rebuildPercent?: number;
  sections?: { title: string; text: string; tone?: "normal" | "gold" | "danger" }[];
  closing?: string;
};

const STORAGE_KEY = "ctms_premium_front_v1";

const ENTRY_CONFIGS: EntryConfig[] = [
  {
    key: "betrayal",
    title: "Po zdradzie albo utracie zaufania",
    subtitle: "To nie kończy się na samym fakcie. Pytanie brzmi, co ta historia zrobiła z bezpieczeństwem między Wami.",
    intro: "Tu system sprawdza nie tylko ranę, ale też to, czy po niej pojawiła się odpowiedzialność, przejrzystość i realna odbudowa.",
    questions: [
      {
        id: "b1",
        lead: "Po pęknięciu liczą się nie słowa, tylko sposób dźwigania szkody.",
        text: "Czy druga strona naprawdę wzięła odpowiedzialność, czy raczej próbowała rozmyć winę?",
        options: [
          { id: "a", label: "Rozmywała winę i mieszała odpowiedzialność", score: 3 },
          { id: "b", label: "Brała odpowiedzialność, ale niespójnie", score: 2 },
          { id: "c", label: "Wzięła ją realnie i konkretnie", score: 0 },
        ],
      },
      {
        id: "b2",
        lead: "Zaufanie nie wraca od deklaracji. Wraca od przewidywalności.",
        text: "Czy po tym wydarzeniu pojawiła się większa przejrzystość, czy nadal żyjesz w napięciu i domysłach?",
        options: [
          { id: "a", label: "Nadal głównie żyję w napięciu", score: 3 },
          { id: "b", label: "Trochę się poprawiło, ale nie do końca", score: 2 },
          { id: "c", label: "Tak, zrobiło się dużo jaśniej", score: 0 },
        ],
      },
      {
        id: "b3",
        lead: "Ciało zwykle wie szybciej niż głowa.",
        text: "Czy mimo prób naprawy nadal łapiesz się na czujności, kontroli albo ciągłym sprawdzaniu?",
        options: [
          { id: "a", label: "Tak, bardzo mocno", score: 3 },
          { id: "b", label: "Czasem tak", score: 2 },
          { id: "c", label: "Nie, to prawie już nie wraca", score: 0 },
        ],
      },
      {
        id: "b4",
        lead: "Tu wychodzi prawda o naprawie.",
        text: "Gdy wracasz do bólu, druga strona jest obecna i cierpliwa, czy bardziej zirytowana, że temat jeszcze żyje?",
        options: [
          { id: "a", label: "Raczej zirytowana albo uciekająca", score: 3 },
          { id: "b", label: "Bywa różnie", score: 2 },
          { id: "c", label: "Jest obecna i cierpliwa", score: 0 },
        ],
      },
      {
        id: "b5",
        lead: "Można zostać razem i nadal nie odzyskać bezpieczeństwa.",
        text: "Czy dziś bardziej czujesz odbudowę zaufania czy próbę funkcjonowania mimo jego braku?",
        options: [
          { id: "a", label: "Raczej próbę życia mimo braku zaufania", score: 3 },
          { id: "b", label: "Coś pośrodku", score: 2 },
          { id: "c", label: "Raczej realną odbudowę", score: 0 },
        ],
      },
    ],
    checkpoint: {
      title: "Checkpoint",
      text: "Co dziś bardziej trzyma tę relację: poczucie bezpieczeństwa czy lęk przed stratą i nadzieja, że jeszcze się ułoży?",
      options: [
        { id: "a", label: "Bardziej lęk i nadzieja", score: 3 },
        { id: "b", label: "Jedno i drugie", score: 2 },
        { id: "c", label: "Raczej bezpieczeństwo", score: 0 },
      ],
    },
    openPrompt: "Napisz bez wygładzania: co dokładnie pękło po utracie zaufania i po czym poznajesz, że do dziś nie wróciło w pełni?",
  },
  {
    key: "uncertain",
    title: "Nie wiem, na czym stoję",
    subtitle: "Niejasność bywa przypadkiem. Ale bywa też wygodnym narzędziem w relacji.",
    intro: "Tu system sprawdza, czy Twoja niepewność wynika z realnej złożoności, czy z długiego oswajania chaosu.",
    questions: [
      {
        id: "u1",
        lead: "Gdy coś jest ciągle niejasne, zwykle komuś to służy.",
        text: "Czy często masz wrażenie, że nie do końca wiesz, co właściwie dla tej osoby znaczysz?",
        options: [
          { id: "a", label: "Tak, bardzo często", score: 3 },
          { id: "b", label: "Czasem", score: 2 },
          { id: "c", label: "Nie, to jest raczej jasne", score: 0 },
        ],
      },
      {
        id: "u2",
        lead: "Słowa i czyny rzadko rozjeżdżają się przez przypadek miesiącami.",
        text: "Czy druga strona mówi rzeczy dające nadzieję, ale jej zachowanie nie idzie za tym?",
        options: [
          { id: "a", label: "Tak, dokładnie tak to działa", score: 3 },
          { id: "b", label: "Bywa różnie", score: 2 },
          { id: "c", label: "Nie, jest raczej spójność", score: 0 },
        ],
      },
      {
        id: "u3",
        lead: "Czyjaś uwaga pojawiająca się głównie przy Twoim wycofaniu też coś mówi.",
        text: "Czy druga strona daje Ci uwagę głównie wtedy, gdy zaczynasz się wycofywać?",
        options: [
          { id: "a", label: "Tak, dokładnie tak", score: 3 },
          { id: "b", label: "Czasem tak", score: 2 },
          { id: "c", label: "Nie, tego nie widzę", score: 0 },
        ],
      },
      {
        id: "u4",
        lead: "Stałe analizowanie też jest objawem relacji.",
        text: "Czy ta relacja zajmuje Ci głowę bardziej przez niejasność niż przez realne poczucie bezpieczeństwa?",
        options: [
          { id: "a", label: "Tak, zdecydowanie", score: 3 },
          { id: "b", label: "Po części", score: 2 },
          { id: "c", label: "Nie, raczej czuję spokój", score: 0 },
        ],
      },
      {
        id: "u5",
        lead: "Kto chce jasno, zwykle nie boi się jasności.",
        text: "Gdy próbujesz doprecyzować, czym to właściwie jest, druga strona wchodzi w konkret czy rozmywa temat?",
        options: [
          { id: "a", label: "Rozmywa temat", score: 3 },
          { id: "b", label: "Trochę dopowiada, ale bez konkretu", score: 2 },
          { id: "c", label: "Wchodzi w konkret", score: 0 },
        ],
      },
    ],
    checkpoint: {
      title: "Checkpoint",
      text: "Czy Twoja niepewność wynika bardziej z realnej złożoności sytuacji, czy z tego, że druga strona daje Ci za mało jasności?",
      options: [
        { id: "a", label: "Raczej z za małej jasności", score: 3 },
        { id: "b", label: "Jedno i drugie", score: 2 },
        { id: "c", label: "Raczej z samej złożoności", score: 0 },
      ],
    },
    openPrompt: "Napisz bez upiększania: co dokładnie Ci tu nie pasuje, mimo że może jeszcze nie umiesz tego nazwać jednym zdaniem?",
  },
  {
    key: "stagnation",
    title: "To trwa, ale coraz mniej tam życia",
    subtitle: "Brak kłótni nie zawsze oznacza spokój. Czasem oznacza wygaszenie.",
    intro: "Tu system bada, czy między Wami jest cisza stabilna, czy cisza obojętności.",
    questions: [
      {
        id: "s1",
        lead: "Relacja gaśnie najpierw w drobiazgach.",
        text: "Czy coraz częściej czujesz, że jesteście obok siebie, ale nie naprawdę ze sobą?",
        options: [
          { id: "a", label: "Tak, dokładnie tak", score: 3 },
          { id: "b", label: "Czasem", score: 2 },
          { id: "c", label: "Nie, nadal czuję połączenie", score: 0 },
        ],
      },
      {
        id: "s2",
        lead: "Gdy jedna strona ciągnie całość, to już nie jest równowaga.",
        text: "Czy masz poczucie, że to Ty częściej inicjujesz rozmowę, bliskość albo ratowanie atmosfery?",
        options: [
          { id: "a", label: "Tak, głównie ja", score: 3 },
          { id: "b", label: "Po części", score: 2 },
          { id: "c", label: "Nie, to jest raczej obustronne", score: 0 },
        ],
      },
      {
        id: "s3",
        lead: "Długie usprawiedliwianie bywa sposobem na niepatrzenie prawdzie w oczy.",
        text: "Czy coraz częściej tłumaczysz brak zaangażowania drugiej strony stresem albo trudnym czasem?",
        options: [
          { id: "a", label: "Tak, często to robię", score: 3 },
          { id: "b", label: "Czasem", score: 2 },
          { id: "c", label: "Nie, widzę to dość jasno", score: 0 },
        ],
      },
      {
        id: "s4",
        lead: "Ciało często wie szybciej niż głowa.",
        text: "Czy czułość, seks albo zwykła spontaniczna bliskość wyraźnie osłabły?",
        options: [
          { id: "a", label: "Tak, bardzo wyraźnie", score: 3 },
          { id: "b", label: "Trochę", score: 2 },
          { id: "c", label: "Nie, to nadal jest obecne", score: 0 },
        ],
      },
      {
        id: "s5",
        lead: "To, czy ktoś chce rozumieć, widać po reakcji na trudne tematy.",
        text: "Gdy próbujesz mówić o problemie, druga strona realnie wchodzi w rozmowę czy raczej ją ucina?",
        options: [
          { id: "a", label: "Raczej ucina lub ucieka", score: 3 },
          { id: "b", label: "Powierzchownie rozmawia", score: 2 },
          { id: "c", label: "Naprawdę wchodzi w temat", score: 0 },
        ],
      },
    ],
    checkpoint: {
      title: "Checkpoint",
      text: "Gdybyś dziś przestał inicjować kontakt i ratować atmosferę, ta relacja dalej miałaby własny napęd?",
      options: [
        { id: "a", label: "Nie, prawdopodobnie by siadła", score: 3 },
        { id: "b", label: "Nie wiem, mam wątpliwości", score: 2 },
        { id: "c", label: "Tak, myślę że by się utrzymała", score: 0 },
      ],
    },
    openPrompt: "Napisz szczerze: co dokładnie zgasło między Wami i od kiedy coraz trudniej Ci udawać, że to tylko chwilowe?",
  },
  {
    key: "returning",
    title: "Po rozstaniu i nie wiem, czy wracać",
    subtitle: "Nie każda tęsknota oznacza, że to był dobry układ. Czasem oznacza tylko niedomknięcie.",
    intro: "Tu system odróżnia realny sens powrotu od głodu kontaktu, samotności i przywiązania.",
    questions: [
      {
        id: "r1",
        lead: "Tęsknić można za człowiekiem, ale też za ulgą po jego powrocie.",
        text: "Czy bardziej tęsknisz za tą osobą, czy za poczuciem, że nie jesteś sam i coś jeszcze może wrócić?",
        options: [
          { id: "a", label: "Bardziej za ulgą i możliwością powrotu", score: 3 },
          { id: "b", label: "Trudno to oddzielić", score: 2 },
          { id: "c", label: "Naprawdę bardziej za tą osobą", score: 0 },
        ],
      },
      {
        id: "r2",
        lead: "To, dlaczego się skończyło, dalej ma znaczenie.",
        text: "Czy powody rozstania były czymś głębokim i powtarzalnym, czy raczej wynikały z jednego kryzysu?",
        options: [
          { id: "a", label: "Były głębokie i powtarzalne", score: 3 },
          { id: "b", label: "Po trochu jedno i drugie", score: 2 },
          { id: "c", label: "Raczej pojedynczy kryzys", score: 0 },
        ],
      },
      {
        id: "r3",
        lead: "Czas po rozstaniu coś pokazuje tylko wtedy, gdy pojawiło się coś nowego, nie tylko tęsknota.",
        text: "Czy od rozstania wydarzyło się coś konkretnego, co realnie zwiększa szanse, że teraz byłoby inaczej?",
        options: [
          { id: "a", label: "Nie, poza tęsknotą niewiele się zmieniło", score: 3 },
          { id: "b", label: "Trochę tak, ale nie mam pewności", score: 2 },
          { id: "c", label: "Tak, są konkretne zmiany", score: 0 },
        ],
      },
      {
        id: "r4",
        lead: "Rozłąka lubi wygładzać to, co wcześniej bolało.",
        text: "Czy zauważasz, że po czasie pamiętasz głównie dobre momenty, a słabiej czujesz to, co Cię niszczyło?",
        options: [
          { id: "a", label: "Tak, mam tendencję do idealizowania", score: 3 },
          { id: "b", label: "Trochę tak", score: 2 },
          { id: "c", label: "Nie, widzę całość dość jasno", score: 0 },
        ],
      },
      {
        id: "r5",
        lead: "Powrót bez nowych zasad zwykle kończy się starym układem.",
        text: "Gdyby doszło do powrotu, czy wiesz jasno, czego już więcej nie chcesz powtórzyć?",
        options: [
          { id: "a", label: "Nie, bardziej chcę wrócić niż mam jasność", score: 3 },
          { id: "b", label: "Częściowo", score: 2 },
          { id: "c", label: "Tak, mam to dość jasno", score: 0 },
        ],
      },
    ],
    checkpoint: {
      title: "Checkpoint",
      text: "Gdybyś miał odjąć samotność, tęsknotę i lęk przed ostatecznością — czy nadal równie mocno chciałbyś wrócić?",
      options: [
        { id: "a", label: "Nie, wtedy to byłoby słabsze", score: 3 },
        { id: "b", label: "Nie wiem", score: 2 },
        { id: "c", label: "Tak, nadal mocno", score: 0 },
      ],
    },
    openPrompt: "Napisz szczerze: za czym naprawdę tęsknisz po tym rozstaniu i co w Tobie najmocniej pcha Cię dziś w stronę powrotu?",
  },
  {
    key: "triangle",
    title: "Jest ktoś trzeci i wszystko się miesza",
    subtitle: "Gdy pojawia się trzeci biegun, problemem nie jest tylko pokusa. Problemem jest to, czego brakuje w środku.",
    intro: "Ta ścieżka sprawdza, czy nowa osoba jest impulsem, ucieczką, czy sygnałem głębszego rozpadu obecnej relacji.",
    questions: [
      {
        id: "t1",
        lead: "To rzadko bierze się znikąd.",
        text: "Czy pojawienie się tej osoby uderzyło Cię dlatego, że w obecnej relacji czegoś od dawna brakowało?",
        options: [
          { id: "a", label: "Tak, bardzo to odsłoniło", score: 3 },
          { id: "b", label: "Po części", score: 2 },
          { id: "c", label: "Nie, to raczej osobna historia", score: 1 },
        ],
      },
      {
        id: "t2",
        lead: "Trzeci człowiek często tylko podświetla istniejące pęknięcia.",
        text: "Czy jeszcze przed pojawieniem się tej osoby myślałeś, że w Twojej relacji coś już wyraźnie nie działa?",
        options: [
          { id: "a", label: "Tak, to już wcześniej było we mnie", score: 3 },
          { id: "b", label: "Trochę tak", score: 2 },
          { id: "c", label: "Nie, dopiero potem", score: 0 },
        ],
      },
      {
        id: "t3",
        lead: "Fantazja działa inaczej niż relacja w codzienności.",
        text: "Czy znasz tę nową osobę na tyle realnie, żeby oceniać ją poza emocjonalnym uniesieniem?",
        options: [
          { id: "a", label: "Nie, to bardziej napięcie i wyobrażenie", score: 2 },
          { id: "b", label: "Trochę tak", score: 1 },
          { id: "c", label: "Tak, znam ją dość realnie", score: 0 },
        ],
      },
      {
        id: "t4",
        lead: "Czasem nie szukamy kogoś, tylko wyjścia z własnego utknięcia.",
        text: "Czy ta nowa osoba daje Ci bardziej ekscytację, czy poczucie zobaczenia czegoś, czego od dawna Ci brakowało?",
        options: [
          { id: "a", label: "Bardziej poczucie zobaczenia", score: 3 },
          { id: "b", label: "Jedno i drugie", score: 2 },
          { id: "c", label: "Bardziej ekscytację i impuls", score: 1 },
        ],
      },
      {
        id: "t5",
        lead: "Najgorzej, gdy trwa się w zawieszeniu i konsumuje oba światy.",
        text: "Czy dziś bardziej odkładasz decyzję, niż naprawdę próbujesz zobaczyć, co jest prawdą o obecnej relacji?",
        options: [
          { id: "a", label: "Tak, jestem w zawieszeniu", score: 3 },
          { id: "b", label: "Po części", score: 2 },
          { id: "c", label: "Nie, próbuję patrzeć uczciwie", score: 0 },
        ],
      },
    ],
    checkpoint: {
      title: "Checkpoint",
      text: "Gdyby tej trzeciej osoby nagle nie było, czy problem w obecnej relacji i tak dalej byłby dla Ciebie poważny?",
      options: [
        { id: "a", label: "Tak, i tak byłby poważny", score: 3 },
        { id: "b", label: "Nie wiem, ale chyba tak", score: 2 },
        { id: "c", label: "Nie, wtedy wszystko byłoby prostsze", score: 0 },
      ],
    },
    openPrompt: "Napisz uczciwie: czego naprawdę szukasz w tej trzeciej osobie i co to mówi o tym, czego już nie znajdujesz w obecnej relacji?",
  },
  {
    key: "loop",
    title: "Kręcimy się w kółko",
    subtitle: "To nie zawsze jest intensywna miłość. Czasem to po prostu system nawrotu.",
    intro: "Ta ścieżka rozbiera cykl napięcie–ulga–powrót–kolejny zjazd.",
    questions: [
      {
        id: "l1",
        lead: "Silne emocje często mylą się z głębią.",
        text: "Czy najmocniej czujesz tę relację wtedy, gdy coś się sypie albo ktoś odchodzi?",
        options: [
          { id: "a", label: "Tak, wtedy wszystko robi się najmocniejsze", score: 3 },
          { id: "b", label: "Czasem tak", score: 2 },
          { id: "c", label: "Nie, bliskość nie zależy od dramatu", score: 0 },
        ],
      },
      {
        id: "l2",
        lead: "Ciągłe gaszenie pożaru też staje się rytmem.",
        text: "Czy masz poczucie, że bardziej walczysz o utrzymanie kontaktu niż naprawdę w nim jesteś?",
        options: [
          { id: "a", label: "Tak, to bardziej walka niż relacja", score: 3 },
          { id: "b", label: "Bywa różnie", score: 2 },
          { id: "c", label: "Nie, czuję obecność i spójność", score: 0 },
        ],
      },
      {
        id: "l3",
        lead: "Obietnice bez nowego zachowania to tylko nowa wersja starego.",
        text: "Czy po kolejnych kryzysach pojawiały się konkretne zmiany, które utrzymały się dłużej niż chwilę?",
        options: [
          { id: "a", label: "Nie, raczej słowa niż realna zmiana", score: 3 },
          { id: "b", label: "Trochę tak, ale niestabilnie", score: 2 },
          { id: "c", label: "Tak, były konkretne i trwałe zmiany", score: 0 },
        ],
      },
      {
        id: "l4",
        lead: "Gdy granice znikają, wraca wszystko, co już bolało.",
        text: "Czy wracając do tej relacji, często odpuszczałeś rzeczy, które wcześniej uznawałeś za nie do przyjęcia?",
        options: [
          { id: "a", label: "Tak, przesuwałem swoje granice", score: 3 },
          { id: "b", label: "Trochę tak", score: 2 },
          { id: "c", label: "Nie, moje granice są raczej stałe", score: 0 },
        ],
      },
      {
        id: "l5",
        lead: "Prawdziwa relacja daje kierunek, nie tylko chwilę ulgi.",
        text: "Czy kiedy myślisz o przyszłości, czujesz spokój czy raczej napięcie i niepewność?",
        options: [
          { id: "a", label: "Raczej napięcie i niepewność", score: 3 },
          { id: "b", label: "Mieszankę jednego i drugiego", score: 2 },
          { id: "c", label: "Raczej spokój", score: 0 },
        ],
      },
    ],
    checkpoint: {
      title: "Checkpoint",
      text: "Kiedy wracasz do tej osoby, co jest silniejsze: realna poprawa czy ulga, że znowu nie tracisz kontaktu?",
      options: [
        { id: "a", label: "Bardziej ulga niż realna poprawa", score: 3 },
        { id: "b", label: "Po trochu jedno i drugie", score: 2 },
        { id: "c", label: "Raczej realna poprawa", score: 0 },
      ],
    },
    openPrompt: "Napisz bez filtra: co dokładnie wraca między Wami i dlaczego mimo tego nadal trudno Ci to odciąć?",
  },
];

function LogoBlock() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 14, height: 14, borderRadius: 999, background: BRAND.gold, boxShadow: `0 0 30px ${BRAND.gold}` }} />
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1.2, color: BRAND.text }}>
          CzyToMaSens<span style={{ color: BRAND.gold }}>.</span>
        </div>
      </div>
      <div style={{ color: BRAND.muted, letterSpacing: 4, fontSize: 11 }}>PRYWATNA ANALIZA RELACJI</div>
    </div>
  );
}

function Glass({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
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

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
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

function GhostButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
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
  const color = preview.chance <= 24 ? BRAND.danger : preview.chance <= 49 ? "#F0C861" : BRAND.gold;
  return (
    <Glass style={{ padding: 28, textAlign: "center", borderColor: color }}>
      <div style={{ color: BRAND.muted, letterSpacing: 4, fontSize: 11 }}>NA ILE TO MA SENS</div>
      <div style={{ fontSize: 92, lineHeight: 1, fontWeight: 900, color, marginTop: 8 }}>{preview.chance}%</div>
      <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800 }}>{preview.badge}</div>
    </Glass>
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
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const path = useMemo(() => ENTRY_CONFIGS.find((x) => x.key === selectedPath) || null, [selectedPath]);
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
        setSessionToken(parsed.sessionToken || null);
      }
    } catch {}

    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const token = params.get("token");
    const cancel = params.get("cancel") || params.get("cancelled") || params.get("canceled");

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
        .then(() => {
          setSessionToken(token);
          setStage("paid");
          setBusy(false);
        })
        .catch(() => {
          setBusy(false);
          setStage("error");
          setError("Płatność wróciła poprawnie, ale nie udało się pobrać raportu. Wejdź ponownie albo wróć do preview.");
        })
        .finally(() => {
          window.history.replaceState({}, "", window.location.pathname);
        });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ stage, selectedPath, questionIndex, answers, openText, email, preview, sessionToken })
    );
  }, [stage, selectedPath, questionIndex, answers, openText, email, preview, sessionToken]);

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStage("landing");
    setSelectedPath(null);
    setQuestionIndex(0);
    setAnswers({});
    setOpenText("");
    setEmail("");
    setPreview(null);
    setSessionToken(null);
    setBusy(false);
    setError(null);
    window.history.replaceState({}, "", window.location.pathname);
  };

  const startPath = async (key: EntryKey) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/session/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryKey: key }),
      });
      const data = await res.json();
      setSessionToken(data?.token || null);
      setSelectedPath(key);
      setQuestionIndex(0);
      setAnswers({});
      setOpenText("");
      setPreview(null);
      setStage("questions");
    } catch {
      setError("Nie udało się rozpocząć sesji.");
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
    setQuestionIndex((v) => v + 1);
  };

  const answerCheckpoint = (optionId: string) => {
    if (!path) return;
    setAnswers((prev) => ({ ...prev, [`${path.key}_checkpoint`]: optionId }));
    setStage("open_text");
  };

  const goBack = () => {
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
    }
  };

  const buildPreviewAndGo = async () => {
    if (!path) return;
    const previewData = buildPreview(path, answers, openText);
    setPreview(previewData);
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
    setBusy(true);
    setError(null);
    try {
      await saveSession({
        path: selectedPath!,
        answers,
        preview: preview!,
        openText,
        email,
      });
      const checkout = await createCheckout(sessionToken, email);
      window.location.href = checkout.url;
    } catch (e: any) {
      setError(e?.message || "Nie udało się rozpocząć płatności.");
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 15% 8%, rgba(197,160,89,0.13), transparent 30%), radial-gradient(circle at 88% 12%, rgba(255,255,255,0.05), transparent 20%), #050505",
        color: BRAND.text,
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 1220, margin: "0 auto", padding: "26px 22px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, marginBottom: 26 }}>
          <LogoBlock />
          {stage !== "landing" && <GhostButton onClick={resetAll}>Od początku</GhostButton>}
        </div>

        <AnimatePresence mode="wait">
          {stage === "landing" && (
            <motion.div key="landing" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18 }}>
                <Glass style={{ padding: 38, minHeight: 540 }}>
                  <div style={{ color: BRAND.gold, fontSize: 12, letterSpacing: 5, marginBottom: 18 }}>NIE TEST. NIE TERAPIA. NIE LUKIER.</div>
                  <div style={{ fontSize: 72, lineHeight: 0.93, fontWeight: 900, letterSpacing: -3, maxWidth: 780 }}>
                    To ma wejść Ci pod skórę, nie tylko przejść przez ekran.
                  </div>
                  <div style={{ marginTop: 22, fontSize: 22, lineHeight: 1.65, color: BRAND.muted, maxWidth: 760 }}>
                    CzyToMaSens nie pyta, czy chcesz ładną odpowiedź. Pyta, co ta relacja naprawdę z Tobą robi. I dopiero potem pokazuje, ile z tego ma jeszcze sens, a ile jest już tylko napięciem, nawykiem albo nadzieją bez pokrycia.
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
                    <PrimaryButton onClick={() => setStage("consent")}>Wejdź w analizę</PrimaryButton>
                    <GhostButton onClick={() => setStage("entry")}>Zobacz, od czego możesz zacząć</GhostButton>
                  </div>

                  <div style={{ marginTop: 34, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                    {[
                      ["Rozmowa, nie quiz", "System prowadzi Cię warstwowo, zamiast wrzucać wszystkich w jedną suchą listę pytań."],
                      ["Lustro, nie pocieszanie", "Tu liczy się trafność, napięcie i wzorzec. Nie coachingowy bełkot."],
                      ["Preview, które sprzedaje głębię", "Najpierw widzisz kierunek. Później decydujesz, czy chcesz zejść głębiej."],
                    ].map(([t, d]) => (
                      <Glass key={t} style={{ padding: 20, borderRadius: 24 }}>
                        <div style={{ fontWeight: 800, fontSize: 20 }}>{t}</div>
                        <div style={{ marginTop: 10, color: BRAND.muted, lineHeight: 1.6 }}>{d}</div>
                      </Glass>
                    ))}
                  </div>
                </Glass>

                <div style={{ display: "grid", gap: 18 }}>
                  <Glass style={{ padding: 26 }}>
                    <div style={{ color: BRAND.gold, fontSize: 12, letterSpacing: 4, marginBottom: 14 }}>WEJŚCIA PROBLEMOWE</div>
                    <div style={{ display: "grid", gap: 10, lineHeight: 1.65 }}>
                      <div>Wracacie do siebie i nic się nie naprawia.</div>
                      <div>To trwa, ale coraz mniej tam życia.</div>
                      <div>Była zdrada, kłamstwo albo pęknięcie zaufania.</div>
                      <div>Jest ktoś trzeci i wszystko się miesza.</div>
                      <div>Po rozstaniu nie wiesz, czy wracać.</div>
                      <div>Niby nic wielkiego się nie stało, ale coś Ci nie pasuje.</div>
                    </div>
                  </Glass>

                  <Glass style={{ padding: 26 }}>
                    <div style={{ color: BRAND.gold, fontSize: 12, letterSpacing: 4, marginBottom: 14 }}>MODEL PRODUKTU</div>
                    <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>15 zł</div>
                    <div style={{ marginTop: 10, color: BRAND.muted, lineHeight: 1.7 }}>
                      Najpierw darmowe lustro sytuacji. Potem pełny raport premium: wskaźniki, mechanizmy, ryzyka, kierunek i finalny werdykt systemu.
                    </div>
                  </Glass>
                </div>
              </div>
            </motion.div>
          )}

          {stage === "consent" && (
            <motion.div key="consent" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass style={{ padding: 34, maxWidth: 900, margin: "0 auto" }}>
                <div style={{ color: BRAND.gold, fontSize: 12, letterSpacing: 5, marginBottom: 18 }}>ZANIM WEJDZIESZ GŁĘBIEJ</div>
                <div style={{ fontSize: 50, lineHeight: 1.02, fontWeight: 900, letterSpacing: -2 }}>To ma być trafne, nie miłe.</div>
                <div style={{ marginTop: 18, color: BRAND.muted, lineHeight: 1.75, fontSize: 17 }}>
                  Ten produkt analizuje wzorce i dynamikę relacji. Nie zastępuje terapii, diagnozy ani porady prawnej. Po płatności dostajesz treść cyfrową od razu. To wejście jest dla ludzi, którzy chcą widzieć jaśniej, nie ładniej.
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
                  <GhostButton onClick={() => setStage("landing")}>Wróć</GhostButton>
                  <PrimaryButton onClick={() => setStage("entry")}>Rozumiem, wchodzę dalej</PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {stage === "entry" && (
            <motion.div key="entry" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, marginBottom: 18 }}>
                <div>
                  <div style={{ color: BRAND.gold, fontSize: 12, letterSpacing: 5 }}>PUNKT WEJŚCIA</div>
                  <div style={{ fontSize: 54, fontWeight: 900, lineHeight: 0.98, letterSpacing: -2.2, marginTop: 10 }}>
                    Od czego ta historia boli najmocniej?
                  </div>
                </div>
                <GhostButton onClick={() => setStage("landing")}>Wróć</GhostButton>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                {ENTRY_CONFIGS.map((entry) => (
                  <Glass key={entry.key} style={{ padding: 24 }}>
                    <div style={{ color: BRAND.gold, fontSize: 11, letterSpacing: 4, marginBottom: 10 }}>ŚCIEŻKA ANALIZY</div>
                    <div style={{ fontSize: 30, lineHeight: 1.02, fontWeight: 800, letterSpacing: -1.4 }}>{entry.title}</div>
                    <div style={{ marginTop: 10, lineHeight: 1.6 }}>{entry.subtitle}</div>
                    <div style={{ marginTop: 14, color: BRAND.muted, lineHeight: 1.7 }}>{entry.intro}</div>
                    <div style={{ marginTop: 20 }}>
                      <PrimaryButton onClick={() => startPath(entry.key)}>{busy ? "Przygotowuję..." : "Wejdź tą ścieżką"}</PrimaryButton>
                    </div>
                  </Glass>
                ))}
              </div>
            </motion.div>
          )}

          {stage === "questions" && path && currentQuestion && (
            <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 18 }}>
                <div style={{ color: BRAND.gold, fontSize: 12, letterSpacing: 5 }}>{path.title.toUpperCase()}</div>
                <div style={{ color: BRAND.muted, fontSize: 14 }}>
                  {questionIndex + 1}/{path.questions.length}
                </div>
              </div>
              <Glass style={{ padding: 34, maxWidth: 880 }}>
                <div style={{ color: BRAND.muted, fontSize: 18, lineHeight: 1.6 }}>{currentQuestion.lead}</div>
                <div style={{ marginTop: 24, fontSize: 62, lineHeight: 0.97, fontWeight: 900, letterSpacing: -2.6 }}>{currentQuestion.text}</div>
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
            <motion.div key={`${path.key}-checkpoint`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass style={{ padding: 34, maxWidth: 900, margin: "0 auto" }}>
                <div style={{ color: BRAND.gold, fontSize: 12, letterSpacing: 5, marginBottom: 16 }}>{path.checkpoint.title}</div>
                <div style={{ fontSize: 52, lineHeight: 1.02, fontWeight: 900, letterSpacing: -2 }}>{path.checkpoint.text}</div>
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
            <motion.div key={`${path.key}-open`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass style={{ padding: 34, maxWidth: 940, margin: "0 auto" }}>
                <div style={{ color: BRAND.gold, fontSize: 12, letterSpacing: 5, marginBottom: 16 }}>OSTATNIA WARSTWA</div>
                <div style={{ fontSize: 46, lineHeight: 1.05, fontWeight: 900, letterSpacing: -1.8 }}>{path.openPrompt}</div>
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
                    lineHeight: 1.7,
                    outline: "none",
                    resize: "vertical",
                  }}
                />
                <div style={{ marginTop: 10, color: BRAND.muted, display: "flex", justifyContent: "space-between" }}>
                  <div>Ta odpowiedź pogłębia lustro i ustawia ton raportu.</div>
                  <div>{openText.length}/3000</div>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton onClick={buildPreviewAndGo} disabled={openText.trim().length < 40}>
                    Pokaż darmowy preview
                  </PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {stage === "preview" && preview && (
            <motion.div key="preview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass style={{ padding: 34, maxWidth: 980, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 20, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ color: BRAND.gold, fontSize: 12, letterSpacing: 5, marginBottom: 14 }}>WSTĘPNY RAPORT</div>
                    <div style={{ fontSize: 58, lineHeight: 0.98, fontWeight: 900, letterSpacing: -2.4, maxWidth: 700 }}>{preview.headline}</div>
                    <div style={{ marginTop: 18, fontSize: 20, lineHeight: 1.7, color: BRAND.muted, maxWidth: 760 }}>{preview.mirror}</div>
                  </div>
                  <div style={{ minWidth: 160, textAlign: "right" }}>
                    <div style={{ fontSize: 60, lineHeight: 1, fontWeight: 900, color: BRAND.gold }}>15 zł</div>
                    <div style={{ color: BRAND.muted, fontSize: 11, letterSpacing: 4, marginTop: 8 }}>PEŁNY RAPORT PREMIUM</div>
                  </div>
                </div>

                <div style={{ marginTop: 22 }}>
                  <PremiumBadge preview={preview} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 18 }}>
                  {[
                    [preview.tension, "POZIOM NAPIĘCIA"],
                    [preview.asymmetry, "ASymetria"],
                    [preview.change, "SZANSA ZMIANY"],
                  ].map(([value, label]) => (
                    <Glass key={label as string} style={{ padding: 22, textAlign: "center", borderRadius: 24 }}>
                      <div style={{ fontSize: 54, lineHeight: 1, fontWeight: 900, color: BRAND.gold }}>{value}%</div>
                      <div style={{ marginTop: 10, color: BRAND.muted, fontSize: 11, letterSpacing: 4 }}>{label}</div>
                    </Glass>
                  ))}
                </div>

                <Glass style={{ padding: 24, marginTop: 18, borderRadius: 24 }}>
                  <div style={{ color: BRAND.gold, fontSize: 12, letterSpacing: 4, marginBottom: 10 }}>LUSTRO SYSTEMU</div>
                  <div style={{ lineHeight: 1.8, color: BRAND.text }}>{preview.summary}</div>
                </Glass>

                <div style={{ marginTop: 22, filter: "blur(6px)", opacity: 0.34, pointerEvents: "none", userSelect: "none" }}>
                  <Glass style={{ padding: 24, borderRadius: 24 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Dominujący mechanizm</div>
                    <div style={{ lineHeight: 1.8, color: BRAND.text }}>
                      W pełnym raporcie system rozpisuje, co naprawdę napędza ten układ: lęk przed stratą, uzależnienie od ulgi, przesunięcie granic, niejasność, zmęczenie albo pozorną odbudowę bez realnego gruntu.
                    </div>
                  </Glass>
                </div>

                <div style={{ marginTop: 24, fontSize: 34, lineHeight: 1.06, fontWeight: 900, letterSpacing: -1.2 }}>{preview.paidTease}</div>
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
                  <PrimaryButton onClick={pay} disabled={busy}>{busy ? "Przetwarzanie..." : "Pobierz pełną analizę — 15 PLN"}</PrimaryButton>
                </div>
                {error && <div style={{ color: BRAND.danger, marginTop: 14 }}>{error}</div>}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <GhostButton onClick={resetAll}>Od początku</GhostButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {stage === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ minHeight: "72vh", display: "grid", placeItems: "center" }}>
                <Glass style={{ padding: 34, textAlign: "center", minWidth: 280 }}>
                  <div style={{ width: 72, height: 72, margin: "0 auto 18px", borderRadius: 999, border: `3px solid rgba(197,160,89,0.25)`, borderTopColor: BRAND.gold, animation: "spin 1.1s linear infinite" }} />
                  <div style={{ fontSize: 24, fontWeight: 700 }}>Przetwarzanie płatności i raportu…</div>
                  <div style={{ marginTop: 10, color: BRAND.muted }}>Jeśli to trwa za długo, wróć na stronę i wejdź ponownie z linku po płatności.</div>
                </Glass>
              </div>
            </motion.div>
          )}

          {stage === "paid" && (
            <motion.div key="paid" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass style={{ padding: 34, maxWidth: 960, margin: "0 auto" }}>
                <div style={{ color: BRAND.gold, fontSize: 12, letterSpacing: 5, marginBottom: 16 }}>RAPORT PREMIUM</div>
                <div style={{ fontSize: 58, lineHeight: 0.98, fontWeight: 900, letterSpacing: -2.4, maxWidth: 760 }}>
                  Płatność wróciła poprawnie. Teraz to miejsce jest gotowe na pełny raport z backendu.
                </div>
                <div style={{ marginTop: 18, color: BRAND.muted, lineHeight: 1.8, fontSize: 17 }}>
                  Front jest już przygotowany pod właściwy raport premium. Następny krok to podpięcie finalnej treści zwracanej przez backend, a nie dalsze ratowanie podstawowego flow.
                </div>
                <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <GhostButton onClick={() => setStage("preview")}>Wróć do preview</GhostButton>
                  <GhostButton onClick={resetAll}>Nowa analiza</GhostButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {stage === "error" && (
            <motion.div key="error" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass style={{ padding: 34, maxWidth: 860, margin: "0 auto" }}>
                <div style={{ color: BRAND.danger, fontSize: 12, letterSpacing: 5, marginBottom: 16 }}>BŁĄD</div>
                <div style={{ fontSize: 42, lineHeight: 1.05, fontWeight: 900, letterSpacing: -1.6 }}>Coś się wywaliło po drodze, ale przynajmniej wiemy gdzie.</div>
                <div style={{ marginTop: 16, color: BRAND.muted, lineHeight: 1.8 }}>{error}</div>
                <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <GhostButton onClick={() => setStage(preview ? "preview" : "landing")}>Wróć</GhostButton>
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
        @media (max-width: 980px) {
          div[style*="grid-template-columns: 1.2fr 0.8fr"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(2, 1fr)"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
