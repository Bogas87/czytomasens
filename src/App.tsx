import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function readApiBase(): string {
  try {
    const metaEnv = typeof import.meta !== "undefined" ? (import.meta as any)?.env : undefined;
    const value = metaEnv?.VITE_API_BASE;
    if (typeof value === "string" && value.startsWith("http")) return value.replace(/\/$/, "");
  } catch {}
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return "https://api.czytomasens.pl";
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
  intro: string;
  questions: Question[];
  checkpoint: { title: string; text: string; options: Option[] };
  openPrompt: string;
};

type Preview = {
  chance: number;
  tension: number;
  asymmetry: number;
  change: number;
  badge: string;
  headline: string;
  truth: string;
  mirror: string;
  summary: string;
  paidTease: string;
  tone: "red" | "yellow" | "green";
};

type FullReportSection = { title: string; text: string; tone?: "normal" | "gold" | "danger" };
type FullReport = {
  headline?: string;
  subheadline?: string;
  previewLine?: string;
  tensionPercent?: number;
  driftPercent?: number;
  rebuildPercent?: number;
  sections?: FullReportSection[];
  closing?: string;
};

type InterviewExchange = { ai: string; user: string; lead?: string; observation?: string };
type InterviewState = {
  path: EntryKey;
  currentQuestion: string;
  currentLead: string;
  currentObservation: string;
  history: InterviewExchange[];
  depth: number;
  finished: boolean;
  exchangeIndex: number;
};

type SessionCreateResponse = { ok?: boolean; token?: string; sessionId?: string };

const STORAGE_KEY = "ctms_premium_front_v7";

const CONSENTS = [
  "Rozumiem, że CzyToMaSens jest narzędziem analitycznym i rozwojowym, a nie poradą medyczną, psychologiczną, terapeutyczną ani prawną.",
  "Rozumiem, że wynik analizy jest interpretacją opartą na moich odpowiedziach i nie stanowi diagnozy klinicznej ani werdyktu o drugiej osobie.",
  "Wyrażam zgodę na przetwarzanie podanych przeze mnie danych osobowych w celu wygenerowania raportu i realizacji usługi cyfrowej, zgodnie z Polityką prywatności.",
  "Rozumiem, że usługa cyfrowa zostaje zrealizowana bezpośrednio po opłaceniu dostępu i tym samym tracę prawo do odstąpienia od umowy po rozpoczęciu generowania raportu.",
];

const LEGAL_CONTENT: Record<Exclude<LegalKey, null>, { title: string; body: string }> = {
  regulamin: {
    title: "Regulamin",
    body: `CzyToMaSens jest narzędziem analitycznym i refleksyjnym — nie zastępuje psychoterapii, doradztwa psychologicznego ani prawnego. Raporty generowane przez system mają charakter informacyjny i opierają się wyłącznie na odpowiedziach użytkownika.\n\nPłatność: dostęp do pełnego raportu jest odpłatny. Płatność realizowana jest przez Stripe. Po skutecznej płatności system generuje indywidualny raport.\n\nTreść cyfrowa: raport stanowi treść cyfrową dostarczaną bezpośrednio po zakupie. Zgodnie z art. 38 pkt 13 ustawy o prawach konsumenta, prawo do odstąpienia nie przysługuje po rozpoczęciu realizacji treści cyfrowej, na co użytkownik wyraża zgodę przed zakupem.\n\nReklamacje: kontakt@czytomasens.pl — rozpatrywane w 14 dni roboczych. W przypadku problemów technicznych uniemożliwiających dostarczenie raportu przysługuje ponowne wygenerowanie lub zwrot płatności.\n\nOdpowiedzialność: usługodawca nie ponosi odpowiedzialności za decyzje podjęte na podstawie treści raportu.`,
  },
  prywatnosc: {
    title: "Polityka prywatności",
    body: `Administrator: właściciel serwisu CzyToMaSens, kontakt@czytomasens.pl.\n\nZakres danych: adres e-mail, treści odpowiedzi analitycznych, dane transakcyjne (Stripe), dane techniczne (IP, user-agent).\n\nCele: realizacja usługi cyfrowej, obsługa płatności, kontakt, bezpieczeństwo systemu.\n\nOdbiorcy: Stripe Inc. (płatności), dostawca hostingu, Resend (e-mail). Dane nie są sprzedawane.\n\nOkres przechowywania: dane analityczne — 90 dni, dokumentacja transakcyjna — 5 lat.\n\nPrawa użytkownika: dostęp, sprostowanie, usunięcie, ograniczenie, przenoszenie, sprzeciw, cofnięcie zgody, skarga do UODO. Kontakt: kontakt@czytomasens.pl.`,
  },
  rodo: {
    title: "Informacja RODO",
    body: `Administrator: właściciel serwisu CzyToMaSens, kontakt@czytomasens.pl.\n\nCel: realizacja usługi cyfrowej, obsługa płatności, wypełnienie obowiązków prawnych.\n\nPodstawa prawna: art. 6 ust. 1 lit. b RODO (wykonanie umowy), lit. c (obowiązek prawny), lit. f (uzasadniony interes).\n\nOdbiorcy: Stripe Inc., dostawca hostingu, Resend.\n\nOkres: 90 dni dla danych analitycznych, 5 lat dla dokumentacji transakcyjnej.\n\nPrawa: dostęp, sprostowanie, usunięcie, ograniczenie, przenoszenie, sprzeciw, cofnięcie zgody, skarga do UODO.\n\nPodanie danych jest dobrowolne, lecz niezbędne do realizacji usługi.`,
  },
  kontakt: {
    title: "Kontakt",
    body: `E-mail: kontakt@czytomasens.pl\n\nW sprawach: zamówień i dostępu do raportu, płatności, reklamacji, danych osobowych i RODO, kwestii technicznych.\n\nCzas odpowiedzi: do 2 dni roboczych.`,
  },
};

const ENTRY_CONFIGS: EntryConfig[] = [
  {
    key: "betrayal",
    title: "Po zdradzie albo kłamstwie",
    subtitle: "Nie chodzi już o to co się stało. Chodzi o to, co to zrobiło z Tobą i z tym co między Wami.",
    intro: "System sprawdza czy to co wróciło to realna zmiana, czy tylko cisza po burzy.",
    questions: [
      { id: "b1", lead: "Odpowiedzialność to nie przeprosiny. To zmiana zachowania.", text: "Czy ta osoba naprawdę wzięła odpowiedzialność — nie tylko słownie, ale w tym co robi od tamtego czasu?", options: [{ id: "a", label: "Głównie słowa, zachowanie się nie zmieniło", score: 3 }, { id: "b", label: "Coś się zmieniło, ale niekonsekwentnie", score: 2 }, { id: "c", label: "Tak, widać realną zmianę", score: 0 }] },
      { id: "b2", lead: "Nieufność, którą sam w sobie budujesz, kosztuje Cię więcej niż ją.", text: "Czy dziś żyjesz w stałym trybie sprawdzania — telefon, słowa, godziny, spójność historii?", options: [{ id: "a", label: "Tak, to stało się moim normalem", score: 3 }, { id: "b", label: "Czasem wpadam w ten tryb", score: 2 }, { id: "c", label: "Nie, to już za mną", score: 0 }] },
      { id: "b3", lead: "Kiedy wracasz do bólu, jego reakcja mówi wszystko.", text: "Gdy wracasz do tego co się stało, ta osoba jest obecna i cierpliwa — czy daje Ci do zrozumienia, że już powinieneś/powinnaś przestać?", options: [{ id: "a", label: "Głównie ucina temat albo się irytuje", score: 3 }, { id: "b", label: "Bywa różnie, zależy od dnia", score: 2 }, { id: "c", label: "Jest cierpliwa i obecna", score: 0 }] },
      { id: "b4", lead: "To jest pytanie, którego się boisz zadać wprost.", text: "Czy gdybyś zapytał/zapytała dzisiaj wprost: 'Czy mam się bać, że to się powtórzy?' — byłbyś/byłabyś w stanie uwierzyć w odpowiedź?", options: [{ id: "a", label: "Nie, i to mówi wszystko", score: 3 }, { id: "b", label: "Chciałbym/chciałabym wierzyć, ale nie jestem pewna/pewny", score: 2 }, { id: "c", label: "Tak, byłbym/byłabym w stanie", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie bez ucieczki", text: "Co dziś bardziej trzyma Cię przy tej osobie: poczucie że odbudowujecie coś realnego, czy strach że jak odejdziesz to ta historia nie będzie miała sensu?", options: [{ id: "a", label: "Bardziej strach przed stratą sensu", score: 3 }, { id: "b", label: "Jedno i drugie walczy w środku", score: 2 }, { id: "c", label: "Naprawdę odbudowujemy coś realnego", score: 0 }] },
    openPrompt: "Napisz bez cenzury: co dokładnie pękło po tym co się stało i po czym dziś poznajesz, że zaufanie albo nie wróciło — albo wróciło pozornie?",
  },
  {
    key: "uncertain",
    title: "Nie wiem na czym stoję",
    subtitle: "Nadzieja i niepewność wymieniają się co kilka dni. Nie wiesz czy to złożoność czy chaos.",
    intro: "System sprawdza czy Twoja niepewność wynika z sytuacji czy z tego, że ktoś celowo nie daje Ci jasności.",
    questions: [
      { id: "u1", lead: "Niejasność, która trwa miesiącami, rzadko jest przypadkowa.", text: "Czy ta osoba konkretnie i wprost określiła czym dla niej jesteście — czy raczej temat jakoś zawsze się rozmywa?", options: [{ id: "a", label: "Rozmywa się albo w ogóle nie poruszamy tego tematu", score: 3 }, { id: "b", label: "Coś mówi, ale nieprecyzyjnie", score: 2 }, { id: "c", label: "Tak, jest jasność co do tego co jest między nami", score: 0 }] },
      { id: "u2", lead: "Ktoś kto chce — robi. Reszta to tłumaczenia.", text: "Jak wygląda zaangażowanie tej osoby gdy NIE TY inicjujesz kontakt, plan, bliskość?", options: [{ id: "a", label: "Prawie nic się nie dzieje — to ja ciągnę", score: 3 }, { id: "b", label: "Coś się pojawia, ale rzadziej i słabiej", score: 2 }, { id: "c", label: "Jest aktywna z własnej inicjatywy", score: 0 }] },
      { id: "u3", lead: "Uwaga pojawiająca się głównie wtedy gdy zaczynasz się wycofywać to nie miłość. To refleks.", text: "Czy ta osoba jest bardziej obecna i zaangażowana wtedy, gdy wyczuje że możesz odejść?", options: [{ id: "a", label: "Tak, wtedy wszystko się ożywia na chwilę", score: 3 }, { id: "b", label: "Chyba tak, ale nie jestem pewna/pewny", score: 2 }, { id: "c", label: "Nie, poziom jest raczej stały", score: 0 }] },
      { id: "u4", lead: "Zrób ten eksperyment w głowie.", text: "Gdybyś dziś przez dwa tygodnie przestał/przestała pisać pierwszy — co by się stało z kontaktem?", options: [{ id: "a", label: "Prawdopodobnie zamarłby lub prawie zamarł", score: 3 }, { id: "b", label: "Ona/on by się odezwała/odezwał, ale nie wiem kiedy", score: 2 }, { id: "c", label: "Na pewno by się odezwała/odezwał szybko", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie bez ucieczki", text: "Gdybyś usunął/usunęła z równania tęsknotę, przyzwyczajenie i lęk przed samotnością — czy nadal chciałbyś/chciałabyś tej osoby?", options: [{ id: "a", label: "Szczerze? Nie wiem. Może nie.", score: 3 }, { id: "b", label: "Myślę że tak, ale mam wątpliwości", score: 2 }, { id: "c", label: "Tak, niezależnie od tych rzeczy", score: 0 }] },
    openPrompt: "Napisz bez upiększania: co konkretnie od miesięcy nie daje Ci jasności i dlaczego mimo tego wciąż jesteś w tym miejscu?",
  },
  {
    key: "stagnation",
    title: "To trwa ale czegoś już w tym nie ma",
    subtitle: "Brak awantur nie jest dowodem spokoju. Czasem jest dowodem że już nic nie ma sensu kłócić.",
    intro: "System sprawdza czy jesteście w spokojnej fazie czy po prostu w ciszy obojętności.",
    questions: [
      { id: "s1", lead: "Relacja gaśnie zanim ktokolwiek to powie na głos.", text: "Czy coraz częściej jesteście razem fizycznie, ale czujesz że naprawdę jesteś sam/sama?", options: [{ id: "a", label: "Tak, i to jest coraz bardziej normalne", score: 3 }, { id: "b", label: "Czasami to czuję", score: 2 }, { id: "c", label: "Nie, czuję obecność i kontakt", score: 0 }] },
      { id: "s2", lead: "Kiedy ostatnio ta osoba zrobiła coś dla Was z własnej inicjatywy?", text: "Czy masz poczucie że to głównie Ty trzymasz tę relację przy życiu — emocjami, inicjatywą, ratowaniem atmosfery?", options: [{ id: "a", label: "Tak, bez mojego wysiłku to by padło", score: 3 }, { id: "b", label: "Częściowo tak", score: 2 }, { id: "c", label: "Nie, jest obustronne", score: 0 }] },
      { id: "s3", lead: "Ile razy w tym miesiącu pomyślałeś/pomyślałaś 'to chyba jest już koniec'?", text: "Czy myśl o odejściu jest coraz mniej przerażająca, a coraz bardziej — ulżyłoby?", options: [{ id: "a", label: "Tak, coraz częściej myślę o uldze", score: 3 }, { id: "b", label: "Taka myśl się pojawia, ale nie dominuje", score: 2 }, { id: "c", label: "Nie, ta myśl mnie przeraża", score: 0 }] },
      { id: "s4", lead: "Odpowiedz na to pytanie tak szybko jak się da.", text: "Gdybyś jutro dowiedział/dowiedziała się że ta osoba odchodzi — pierwsza emocja to byłby ból czy ulga?", options: [{ id: "a", label: "Szczerość podpowiada: ulga, albo mieszanina", score: 3 }, { id: "b", label: "Nie wiem, może jedno i drugie", score: 2 }, { id: "c", label: "Ból. Zdecydowanie ból.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie bez ucieczki", text: "Co konkretnie chciałbyś/chciałabyś żeby wróciło między Wami — i czy ta osoba wie o tym i robi cokolwiek żeby to zmienić?", options: [{ id: "a", label: "Wie albo powinna wiedzieć — i nic nie robi", score: 3 }, { id: "b", label: "Coś próbuje, ale za mało", score: 2 }, { id: "c", label: "Tak, naprawdę pracujemy nad tym razem", score: 0 }] },
    openPrompt: "Napisz uczciwie: co dokładnie zniknęło między Wami i kiedy przestałeś/przestałaś wierzyć że samo wróci?",
  },
  {
    key: "returning",
    title: "Rozstaliśmy się i nie wiem czy wracać",
    subtitle: "Tęsknota potrafi udawać miłość. Lęk przed samotnością potrafi udawać sens.",
    intro: "System odróżni czy chcesz tej osoby, czy chcesz żeby bało się skończyć.",
    questions: [
      { id: "r1", lead: "Tęsknić można za człowiekiem. Tęsknić można za poczuciem że się jest potrzebnym.", text: "Gdy wyobrażasz sobie powrót — co dokładnie widzisz? Bycie z tą osobą, czy koniec niepewności i samotności?", options: [{ id: "a", label: "Szczerość mówi: bardziej koniec samotności", score: 3 }, { id: "b", label: "Trudno to oddzielić", score: 2 }, { id: "c", label: "Naprawdę widzę tę osobę, nie ulgę", score: 0 }] },
      { id: "r2", lead: "Powody rozstania są prawdą o relacji. Nie znikają przez tęsknotę.", text: "To przez co się rozstaliście — czy to były jednorazowe okoliczności, czy głębszy wzorzec który wracał?", options: [{ id: "a", label: "Głębszy wzorzec, wracał wielokrotnie", score: 3 }, { id: "b", label: "Trochę jednego i drugiego", score: 2 }, { id: "c", label: "Raczej jednorazowy kryzys lub okoliczności", score: 0 }] },
      { id: "r3", lead: "Odległość robi filtr — przepuszcza tylko to co przyjemne.", text: "Gdy myślisz o tej osobie teraz — pamiętasz głównie dobre, czy widzisz też wyraźnie to co Cię niszczyło?", options: [{ id: "a", label: "Głównie dobre — złe jest rozmyte albo usprawiedliwiane", score: 3 }, { id: "b", label: "Widzę trochę jedno i drugie", score: 2 }, { id: "c", label: "Widzę całość jasno, włącznie z tym co bolało", score: 0 }] },
      { id: "r4", lead: "To jest kluczowe pytanie przed powrotem.", text: "Czy wiesz co konkretnie musiałoby się zmienić żeby powrót miał sens — i czy ta osoba wie to samo i jest gotowa to zmienić?", options: [{ id: "a", label: "Nie wiem co by musiało się zmienić. Albo wiem, ale tamta osoba nie.", score: 3 }, { id: "b", label: "Coś wiem, ale nie jesteśmy zgodni/zgodne", score: 2 }, { id: "c", label: "Tak, oboje wiemy i oboje jesteśmy gotowi", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie bez ucieczki", text: "Gdybyś wiedział/wiedziała że ta osoba już ułożyła sobie życie z kimś innym i nie wróci — jak długo zajęłoby Ci dojście do siebie?", options: [{ id: "a", label: "Długo. Bardzo długo. To by mnie złamało.", score: 3 }, { id: "b", label: "Byłoby ciężko, ale bym dał/dała radę", score: 2 }, { id: "c", label: "Byłoby smutno, ale bym to przyjął/przyjęła", score: 0 }] },
    openPrompt: "Napisz uczciwie: co naprawdę trzyma Cię przy myśleniu o powrocie i czego najbardziej się boisz jeśli nie wrócisz?",
  },
  {
    key: "triangle",
    title: "Jest ktoś trzeci i wszystko się miesza",
    subtitle: "Nowa osoba obnaża to czego nie było — albo daje pretekst do ucieczki. Jedno i drugie wygląda tak samo z zewnątrz.",
    intro: "System sprawdza czy nowa osoba jest prawdziwą odpowiedzią czy tylko pytaniem które zadajesz sobie od dawna.",
    questions: [
      { id: "t1", lead: "Gdyby w obecnej relacji było dobrze, ta osoba by się tak nie pojawiła.", text: "Czy pojawienie się tej trzeciej osoby odsłoniło coś czego Ci w obecnej relacji brakowało od dawna?", options: [{ id: "a", label: "Tak i teraz trudno to niezauważyć", score: 3 }, { id: "b", label: "Trochę tak, ale nie wiem czy to jest związane", score: 2 }, { id: "c", label: "Nie, to jest osobna historia", score: 1 }] },
      { id: "t2", lead: "Nowa osoba to nie człowiek. To jeszcze wyobrażenie.", text: "Czy znasz tę osobę w realnych warunkach — konflikcie, zmęczeniu, codzienności — czy znasz ją głównie w najlepszym wydaniu?", options: [{ id: "a", label: "W najlepszym wydaniu, bez codzienności", score: 2 }, { id: "b", label: "Trochę obu", score: 1 }, { id: "c", label: "Znam ją realnie, nie tylko od najlepszej strony", score: 0 }] },
      { id: "t3", lead: "Odpowiedz na to szybko, pierwsza myśl.", text: "Gdyby ta trzecia osoba zniknęła z Twojego życia — jak długo zajęłoby Ci poczucie ulgi zamiast straty?", options: [{ id: "a", label: "Długo. To by naprawdę bolało.", score: 3 }, { id: "b", label: "Byłoby ciężko ale bym dał/dała radę", score: 2 }, { id: "c", label: "Szybko. Wiem że to bardziej fascynacja.", score: 1 }] },
      { id: "t4", lead: "Zawieszenie jest wygodne bo odraczają decyzję.", text: "Czy dziś bardziej działasz — robisz coś z jedną lub drugą sytuacją — czy odkładasz decyzję i trwasz?", options: [{ id: "a", label: "Trwam w zawieszeniu i odkładam", score: 3 }, { id: "b", label: "Próbuję coś zrozumieć, ale bez działania", score: 2 }, { id: "c", label: "Działam, nie tylko myślę", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie bez ucieczki", text: "Gdyby tamta trzecia osoba nigdy nie pojawiła się w Twoim życiu — czy dziś byłbyś/byłabyś zadowolony/zadowolona z obecnej relacji?", options: [{ id: "a", label: "Nie. Problem by i tak istniał.", score: 3 }, { id: "b", label: "Nie wiem. Chyba byłoby ciężko.", score: 2 }, { id: "c", label: "Tak. Byłoby dobrze.", score: 0 }] },
    openPrompt: "Napisz bez owijania w bawełnę: co ta trzecia osoba daje Ci lub obiecuje że da, czego nie dostajesz w obecnej relacji?",
  },
  {
    key: "loop",
    title: "Wracamy do siebie w kółko i nic się nie zmienia",
    subtitle: "Odchodzicie. Wracacie. Znowu. I za każdym razem mówisz sobie że tym razem będzie inaczej.",
    intro: "System sprawdza czy to jest miłość którą warto ratować, czy uzależnienie od cyklu napięcie-ulga.",
    questions: [
      { id: "l1", lead: "Kiedy czujesz tę relację najbardziej — w spokoju czy w dramacie?", text: "Czy najsilniejsze uczucie do tej osoby pojawia się głównie wtedy gdy coś się sypie, ktoś odchodzi albo jest ryzyko utraty?", options: [{ id: "a", label: "Tak, wtedy jest najmocniej. W spokoju jest mdło.", score: 3 }, { id: "b", label: "Czasem tak, ale nie zawsze", score: 2 }, { id: "c", label: "Nie, bliskość nie zależy od dramatu", score: 0 }] },
      { id: "l2", lead: "Policz ile razy sobie obiecywałeś/obiecywałaś że tym razem będzie inaczej.", text: "Po poprzednich powrotach — czy pojawiły się konkretne zmiany w zachowaniu, które się utrzymały dłużej niż miesiąc?", options: [{ id: "a", label: "Nie. Za każdym razem wracamy do tego samego.", score: 3 }, { id: "b", label: "Coś się zmieniało ale niestabilnie", score: 2 }, { id: "c", label: "Tak, były realne trwałe zmiany", score: 0 }] },
      { id: "l3", lead: "To jest pytanie które boli.", text: "Gdybyś wyjął/wyjęła z tej relacji napięcie, pojednania i intensywność emocjonalną — co by zostało?", options: [{ id: "a", label: "Szczerość mówi: niewiele albo pustka", score: 3 }, { id: "b", label: "Zostałoby coś, ale nie wiem czy wystarczająco dużo", score: 2 }, { id: "c", label: "Zostałoby dużo. Naprawdę lubimy ze sobą być.", score: 0 }] },
      { id: "l4", lead: "Powiedz to wprost, nikt nie słyszy.", text: "Czy boisz się odejść nie dlatego że Ci jej/jego brakuje — ale dlatego że nie wiesz kim jesteś bez tego cyklu?", options: [{ id: "a", label: "To uderza za mocno żeby zaprzeczyć", score: 3 }, { id: "b", label: "Może trochę tak, ale nie tylko", score: 2 }, { id: "c", label: "Nie, to nie jest powód dla mnie", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie bez ucieczki", text: "Jeśli nic się nie zmieni i za rok będziecie dokładnie w tym samym miejscu co teraz — czy to jest życie które akceptujesz?", options: [{ id: "a", label: "Nie. Ale nie wiem jak z tego wyjść.", score: 3 }, { id: "b", label: "Nie chcę tego, ale nie jestem gotowa/gotowy na zmianę", score: 2 }, { id: "c", label: "Tak, bo wierzę że coś się zmieni", score: 0 }] },
    openPrompt: "Napisz bez filtra: co konkretnie trzyma Cię w tym cyklu i dlaczego mimo wszystko co wiesz — nadal wracasz?",
  },
];

function safeNumber(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
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
  if (chance <= 24) return { chance, tension, asymmetry, change, tone: "red", badge: "Wzorzec wysokiego ryzyka", headline: "To bardziej wygląda na relację kosztowną emocjonalnie niż na układ, który sam się naprostuje.", truth: "Na dziś więcej wskazuje tu na przeciążający mechanizm niż na stabilny grunt.", mirror: "To nie wygląda jak zwykły kryzys do przeczekania. Bardziej jak układ, w którym napięcie i przywiązanie zaczęły już robić za spoiwo.", summary: "Ten wynik zwykle pojawia się wtedy, gdy w środku relacji działa już nie tylko uczucie, ale też chaos, nierówność, powracające rozjazdy albo chroniczny brak jasności.", paidTease: "Pełny raport rozpisze, co tu naprawdę trzyma Cię najmocniej: więź, lęk, przywiązanie, iluzja zmiany czy brak domknięcia." };
  if (chance <= 49) return { chance, tension, asymmetry, change, tone: "yellow", badge: "Układ chwiejny i niespójny", headline: "Tu bardziej widać chwiejność niż spójność.", truth: "Coś jeszcze tę relację trzyma, ale obok tego widać już rozjazdy, które nie są drobiazgiem.", mirror: "To nie wygląda jak spokojny grunt. Raczej jak układ, który potrafi trwać długo i jednocześnie powoli wyczerpywać.", summary: "Ten wynik zwykle pojawia się tam, gdzie obok przywiązania albo nadziei mocno pracują już też inne siły: niejasność, zmęczenie, nierówne zaangażowanie, trudność z odcięciem albo chroniczny brak stabilności.", paidTease: "Pełny raport rozłoży tę relację na warstwy: co jeszcze działa, co już się rozjechało i gdzie leży największe ryzyko dalszego trwania." };
  if (chance <= 69) return { chance, tension, asymmetry, change, tone: "yellow", badge: "Jest potencjał, ale nie bez zastrzeżeń", headline: "Tu coś jeszcze ma sens, ale nie na autopilocie.", truth: "Nie wygląda to ani na historię całkowicie pustą, ani na relację oczywiście skazaną na powtarzanie tego samego.", mirror: "Widać jednak miejsca, które wymagają więcej niż samej dobrej woli i nadziei, że jakoś się ułoży.", summary: "Ten wynik zwykle oznacza relację, która ma jeszcze materiał, ale nie obroni się samym sentymentem albo przywiązaniem.", paidTease: "W pełnej wersji dostajesz rozkład: co daje nadzieję, co ją podcina i które mechanizmy najmocniej wpływają na ten wynik." };
  return { chance, tension, asymmetry, change, tone: "green", badge: "Układ z realnym potencjałem", headline: "Tu jeszcze widać grunt, nie tylko emocje.", truth: "Na tym etapie w odpowiedziach jest więcej spójności niż chaosu.", mirror: "To nie znaczy, że nie ma słabszych punktów. Znaczy tyle, że ta relacja nie wygląda wyłącznie na historię napędzaną lękiem, niejasnością albo samym nawykiem wracania.", summary: "Ten wynik zwykle pojawia się tam, gdzie obok napięcia nadal istnieje też realna struktura: kontakt, wzajemność, zdolność do rozmowy albo szansa na zmianę.", paidTease: "Pełna analiza pokaże, z czego dokładnie bierze się ten potencjał i gdzie mimo wszystko ukryte są jego słabsze miejsca." };
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

async function fetchPaidReport(token: string): Promise<FullReport> {
  const MAX_ATTEMPTS = 20;
  const INTERVAL_MS = 3000;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const res = await fetch(`${API_BASE}/api/report/${encodeURIComponent(token)}`);
    if (res.status === 202) { await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS)); continue; }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Błąd pobierania raportu.");
    if (!data?.report) throw new Error("Serwer nie zwrócił raportu.");
    return data.report as FullReport;
  }
  throw new Error("Raport jest nadal przygotowywany. Sprawdź e-mail — wyślemy Ci bezpieczny link, gdy będzie gotowy.");
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

function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`ctms-glass ${className}`.trim()}>{children}</div>;
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return <button className="ctms-btn ctms-btn-primary" onClick={onClick} disabled={disabled}>{children}</button>;
}

function GhostButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button className="ctms-btn ctms-btn-ghost" onClick={onClick}>{children}</button>;
}

function PremiumBadge({ preview }: { preview: Preview }) {
  const color = preview.tone === "red" ? BRAND.danger : preview.tone === "green" ? BRAND.success : BRAND.goldSoft;
  const scoreExplanation = `Wynik powstał z trzech osi: poziomu napięcia w relacji (${preview.tension}%), asymetrii zaangażowania (${preview.asymmetry}%) oraz realności zmiany (${preview.change}%). Im wyższe napięcie i asymetria, tym niższy wynik końcowy.`;
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
  const [legalOpen, setLegalOpen] = useState<LegalKey>(null);
  const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
  const [interviewAnswer, setInterviewAnswer] = useState("");
  const [interviewBusy, setInterviewBusy] = useState(false);

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
        setFullReport(parsed.fullReport || null);
        setSessionToken(parsed.sessionToken || null);
        setConsents(parsed.consents || [false, false, false]);
        setInterviewState(parsed.interviewState || null);
      }
    } catch {}

    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const token = params.get("token");
    const cancel = params.get("cancel") || params.get("cancelled") || params.get("canceled");
    const accessToken = params.get("access_token");
    const accessExp = params.get("exp");
    const accessSig = params.get("sig");

    if (accessToken && accessExp && accessSig) {
      setBusy(true); setStage("processing");
      fetch(`${API_BASE}/api/report/signed?token=${encodeURIComponent(accessToken)}&exp=${encodeURIComponent(accessExp)}&sig=${encodeURIComponent(accessSig)}`)
        .then((res) => res.json())
        .then((data) => { if (!data?.ok || !data?.report) throw new Error(data?.message || "Raport niedostępny."); setFullReport(data.report); setSessionToken(accessToken); setStage("paid"); setBusy(false); })
        .catch((e: any) => { setBusy(false); setStage("error"); setError(e?.message || "Link wygasł lub raport nie jest dostępny."); })
        .finally(() => { window.history.replaceState({}, "", window.location.pathname); });
      return;
    }
    if (cancel === "1" || cancel === "true") { setBusy(false); setStage("preview"); window.history.replaceState({}, "", window.location.pathname); return; }
    if (success === "1" && token) {
      setBusy(true); setStage("processing");
      fetchPaidReport(token)
        .then((report) => { setFullReport(report); setSessionToken(token); setStage("paid"); setBusy(false); })
        .catch((e: any) => { setBusy(false); setStage("error"); setError(e?.message || "Płatność wróciła poprawnie, ale nie udało się pobrać raportu."); })
        .finally(() => { window.history.replaceState({}, "", window.location.pathname); });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stage, selectedPath, questionIndex, answers, openText, email, preview, fullReport, sessionToken, consents, interviewState }));
  }, [stage, selectedPath, questionIndex, answers, openText, email, preview, fullReport, sessionToken, consents, interviewState]);

  const ensureSession = async (entryKey: EntryKey): Promise<string> => {
    if (sessionToken) return sessionToken;
    const data = await createSession(entryKey);
    const nextToken = data?.token || data?.sessionId || null;
    if (!nextToken) throw new Error("Nie udało się uzyskać tokenu sesji.");
    setSessionToken(nextToken);
    return nextToken;
  };

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStage("landing"); setSelectedPath(null); setQuestionIndex(0); setAnswers({}); setOpenText(""); setEmail(""); setPreview(null); setFullReport(null); setSessionToken(null); setBusy(false); setError(null); setConsents([false, false, false]); setLegalOpen(null); setInterviewState(null); setInterviewAnswer("");
    window.history.replaceState({}, "", window.location.pathname);
  };

  // ─── STARY FLOW: zamknięte pytania ─────────────────────────────────────────

  const startPath = async (key: EntryKey) => {
    setBusy(true); setError(null);
    try {
      const data = await createSession(key);
      const token = data?.token || data?.sessionId || null;
      if (!token) throw new Error("Brak tokenu sesji.");
      setSessionToken(token); setSelectedPath(key); setQuestionIndex(0); setAnswers({}); setOpenText(""); setPreview(null); setFullReport(null); setInterviewState(null);
      setStage("questions");
    } catch (e: any) { setError(e?.message || "Nie udało się rozpocząć analizy."); setStage("error"); }
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

    // Po checkpoincie — spróbuj uruchomić AI interview
    if (sessionToken) {
      setBusy(true);
      try {
        const res = await fetch(`${API_BASE}/api/interview/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: sessionToken, path: path.key, initialContext: "" }),
        });
        const d = await res.json().catch(() => ({}));
        if (d.ok && d.question) {
          setInterviewState({ path: path.key, currentQuestion: d.question, currentLead: d.lead || "", currentObservation: d.observation || "", history: [], depth: 1, finished: false, exchangeIndex: 0 });
          setInterviewAnswer("");
          setStage("interview");
          setBusy(false);
          return;
        }
      } catch {}
      setBusy(false);
    }
    // Fallback jeśli AI niedostępne
    setStage("open_text");
  };

  // ─── AI INTERVIEW ────────────────────────────────────────────────────────────

  const sendInterviewAnswer = async () => {
    if (!interviewState || !sessionToken || !interviewAnswer.trim()) return;
    if (hasCrisisContent(interviewAnswer)) { setStage("crisis"); return; }
    setInterviewBusy(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/interview/next`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: sessionToken, userAnswer: interviewAnswer.trim() }) });
      const d = await res.json().catch(() => ({}));
      if (d.crisis) { setStage("crisis"); return; }
      if (!d.ok) throw new Error(d.message || "Błąd wywiadu.");
      const updatedHistory: InterviewExchange[] = [...interviewState.history, { ai: interviewState.currentQuestion, user: interviewAnswer.trim(), lead: interviewState.currentLead, observation: interviewState.currentObservation }];
      if (d.finished) {
        const transcript = updatedHistory.map((e) => `Pytanie: ${e.ai}\nOdpowiedź: ${e.user}`).join("\n\n");
        setInterviewState({ ...interviewState, history: updatedHistory, finished: true });
        setOpenText(transcript);
        setStage("open_text");
      } else {
        setInterviewState({ ...interviewState, history: updatedHistory, currentQuestion: d.question, currentLead: d.lead || "", currentObservation: d.observation || "", depth: d.depth, exchangeIndex: d.exchangeIndex });
        setInterviewAnswer("");
      }
    } catch (e: any) { setError(e?.message || "Błąd podczas wywiadu."); }
    finally { setInterviewBusy(false); }
  };

  const goBack = () => {
    setError(null);
    if (stage === "questions") { if (questionIndex === 0) { setStage("entry"); return; } setQuestionIndex((v) => Math.max(0, v - 1)); return; }
    if (stage === "checkpoint") { setStage("questions"); return; }
    if (stage === "interview") { setStage("checkpoint"); return; }
    if (stage === "open_text") {
      if (interviewState && interviewState.history.length > 0) { setStage("interview"); return; }
      setStage("checkpoint"); return;
    }
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
    } catch (e: any) { setError(e?.message || "Nie udało się przygotować preview."); setStage("error"); }
    finally { setBusy(false); }
  };

  const pay = async () => {
    if (!selectedPath || !preview) { setError("Brak gotowego preview do zapisania."); return; }
    if (!email.includes("@")) { setError("Podaj prawidłowy e-mail."); return; }
    setBusy(true); setError(null);
    try {
      const token = await ensureSession(selectedPath);
      await updateSession({ token, path: selectedPath, answers, openText, preview, email, consentAcceptedAt: new Date().toISOString(), stage: "checkout_started" });
      const checkout = await createCheckout(token, email, new Date().toISOString());
      window.location.href = checkout.url;
    } catch (e: any) { setError(e?.message || "Nie udało się rozpocząć płatności."); setBusy(false); }
  };

  return (
    <div className="ctms-shell">
      <div className="ctms-noise" />
      <div className="ctms-topbar">
        <LogoBlock />
        {stage !== "landing" && <GhostButton onClick={resetAll}>Od początku</GhostButton>}
      </div>

      <main className={`ctms-main ${["consent","questions","checkpoint","interview","open_text","preview","paid","error","crisis"].includes(stage) ? "narrow" : ""}`}>
        <AnimatePresence mode="wait">

          {/* LANDING */}
          {stage === "landing" && (
            <motion.div key="landing" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <section className="hero-grid">
                <Glass className="glass-panel hero-panel hero-copy">
                  <div className="eyebrow with-line">PRYWATNA ANALIZA RELACJI</div>
                  <div className="hero-kicker">TWOJA RELACJA MA WZORZEC.</div>
                  <h1>Już wiesz, że <span>coś nie gra.</span><br />Tu dowiesz się, co dokładnie.</h1>
                  <p>Każda trudna relacja ma swój mechanizm. System go widzi — nawet jeśli Ty go jeszcze nie nazwałeś/nazwałaś. To nie jest test. To lustro.</p>
                  <div className="ctms-landing-actions">
                    <PrimaryButton onClick={() => setStage("consent")}>Chcę wiedzieć prawdę</PrimaryButton>
                  </div>
                </Glass>
                <div className="hero-side-stack">
                  <Glass className="glass-panel story-panel visual-story">
                    <div className="story-kicker">CO ZOBACZYSZ</div>
                    <h3>To, czego jeszcze<br />nie nazwałeś/nazwałaś</h3>
                    <div className="story-points">
                      <div><span>▸</span><p>Mechanizm który napędza tę sytuację — i dlaczego wracasz do tego samego miejsca</p></div>
                      <div><span>▸</span><p>Twój wzorzec w relacjach — nie ocena, tylko precyzyjny obraz tego kim jesteś w bliskości</p></div>
                      <div><span>▸</span><p>To, czego nie chcesz widzieć — ale co jest kluczem do zrozumienia całości</p></div>
                    </div>
                    <div className="story-lock">
                      <div className="story-lock-icon">🔒</div>
                      <div>
                        <strong>Pełny raport — 15 zł</strong>
                        <span>Najpierw podgląd. Płacisz tylko jeśli chcesz wiedzieć więcej.</span>
                      </div>
                    </div>
                  </Glass>
                </div>
              </section>
              <section className="ctms-feature-editorial-grid">
                <Glass className="feature-card">
                  <div className="feature-top"><span className="feature-no">01</span><span className="feature-icon">◌</span></div>
                  <h3>Schodzi głębiej niż myślisz</h3>
                  <div className="feature-line" />
                  <p>Pytania nie są przypadkowe. Każde kolejne wchodzi w miejsce, którego nie spodziewasz się dotknąć. To tam jest odpowiedź.</p>
                </Glass>
                <Glass className="feature-card">
                  <div className="feature-top"><span className="feature-no">02</span><span className="feature-icon">▤</span></div>
                  <h3>Mówi to, czego inni nie powiedzą</h3>
                  <div className="feature-line" />
                  <p>Nie dostaniesz pocieszenia ani oceny. Dostaniesz to, co naprawdę widać z zewnątrz — nazwane wprost, bez owijania w bawełnę.</p>
                </Glass>
                <Glass className="feature-card">
                  <div className="feature-top"><span className="feature-no">03</span><span className="feature-icon">◐</span></div>
                  <h3>Zostajesz z czymś realnym</h3>
                  <div className="feature-line" />
                  <p>Nie z listą kroków ani z motywacją. Z precyzyjnym obrazem tego, co się naprawdę dzieje — i co to oznacza dla Ciebie.</p>
                </Glass>
              </section>
            </motion.div>
          )}

          {/* CONSENT */}
          {stage === "consent" && (
            <motion.div key="consent" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="question-panel consent-panel">
                <div className="eyebrow">ZANIM WEJDZIESZ GŁĘBIEJ</div>
                <h2>Zanim wejdziesz — przeczytaj to.</h2>
                <p className="consent-copy">To narzędzie mówi Ci prawdę na podstawie Twoich odpowiedzi. Nie pocieszamy. Nie zaokrąglamy. Jeśli szukasz potwierdzenia że wszystko jest ok — to nie jest miejsce dla Ciebie. Jeśli chcesz wiedzieć co naprawdę się dzieje — jesteś w dobrym miejscu.</p>
                <div className="consent-list">
                  {CONSENTS.map((text, idx) => (
                    <label key={idx} className="consent-item">
                      <input type="checkbox" checked={consents[idx]} onChange={(e) => { const next = [...consents]; next[idx] = e.target.checked; setConsents(next); }} />
                      <span>{text}</span>
                    </label>
                  ))}
                </div>
                <div className="consent-actions">
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton onClick={() => setStage("entry")} disabled={!consents.every(Boolean)}>Rozumiem, wchodzę dalej</PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {/* ENTRY */}
          {stage === "entry" && (
            <motion.div key="entry" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="section-head">
                <div>
                  <div className="eyebrow">WYBIERZ ŚCIEŻKĘ</div>
                  <h2>Co najbardziej nie daje Ci spokoju?</h2>
                  <p>Wybierz miejsce, które ciągnie Cię w dół. System dopasuje pytania do Twojej sytuacji i będzie schodził coraz głębiej.</p>
                </div>
                <GhostButton onClick={goBack}>Wróć</GhostButton>
              </div>
              <div className="entry-grid">
                {ENTRY_CONFIGS.map((entry) => (
                  <Glass key={entry.key} className="entry-card">
                    <div className="eyebrow">ŚCIEŻKA ANALIZY</div>
                    <h3>{entry.title}</h3>
                    <div className="entry-subtitle">{entry.subtitle}</div>
                    <div className="entry-intro">{entry.intro}</div>
                    <div className="entry-action">
                      <PrimaryButton onClick={() => startPath(entry.key)}>{busy ? "Przygotowuję..." : "Wejdź głębiej"}</PrimaryButton>
                    </div>
                  </Glass>
                ))}
              </div>
            </motion.div>
          )}

          {/* QUESTIONS — zamknięte */}
          {stage === "questions" && path && currentQuestion && (
            <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="section-head compact">
                <div className="eyebrow">{path.title.toUpperCase()}</div>
                <div className="progress-wrap">
                  <span>{questionIndex + 1}/{path.questions.length}</span>
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

          {/* CHECKPOINT */}
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

          {/* AI INTERVIEW — otwarte pytania dynamiczne */}
          {stage === "interview" && interviewState && (
            <motion.div key={`interview-${interviewState.exchangeIndex}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="section-head compact">
                <div className="eyebrow">{(ENTRY_CONFIGS.find((x) => x.key === selectedPath)?.title || "").toUpperCase()}</div>
                <div className="progress-wrap">
                  <span>Głębokość {interviewState.depth}/5</span>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${(interviewState.depth / 5) * 100}%` }} /></div>
                </div>
              </div>
              <Glass className="question-panel">
                <div className="question-copy">
                  {interviewState.currentLead && <div className="question-lead">{interviewState.currentLead}</div>}
                  <h3>{interviewState.currentQuestion}</h3>
                  {interviewState.currentObservation && interviewState.history.length > 0 && (
                    <div style={{ fontSize: "14px", color: BRAND.muted, marginTop: "12px", fontStyle: "italic", lineHeight: 1.6 }}>{interviewState.currentObservation}</div>
                  )}
                </div>
                <textarea className="ctms-textarea" value={interviewAnswer} onChange={(e) => setInterviewAnswer(e.target.value)} placeholder="Odpowiedz konkretnie. System idzie głębiej na podstawie tego co napiszesz." maxLength={2000} />
                <div className="text-meta">
                  <div>{interviewState.history.length > 0 ? `Wymiana ${interviewState.history.length + 1}` : "Pierwsze pytanie"}</div>
                  <div>{interviewAnswer.length}/2000</div>
                </div>
                {error && <div className="error-line" style={{ marginTop: "12px" }}>{error}</div>}
                <div className="section-actions">
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton onClick={sendInterviewAnswer} disabled={interviewBusy || interviewAnswer.trim().length < 10}>
                    {interviewBusy ? "Analizuję..." : "Dalej →"}
                  </PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {/* OPEN TEXT */}
          {stage === "open_text" && path && (
            <motion.div key={`${path.key}-open`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="question-panel">
                <div className="eyebrow">OSTATNIA WARSTWA</div>
                <div className="question-copy">
                  <h3>{interviewState?.finished ? "Dodaj coś czego nie powiedziałeś/powiedziałaś — albo potwierdź że to jest wszystko." : path.openPrompt}</h3>
                </div>
                <textarea className="ctms-textarea" value={openText} onChange={(e) => setOpenText(e.target.value)} placeholder="Napisz tak jak byś mówił/mówiła do kogoś komu ufasz całkowicie. Im bardziej szczery/szczera — tym mocniejsza analiza." maxLength={3000} />
                <div className="text-meta">
                  <div>To jest rdzeń analizy. Napisz co naprawdę czujesz, nie co powinieneś/powinnaś czuć.</div>
                  <div>{openText.length}/3000</div>
                </div>
                <div className="section-actions">
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton onClick={buildPreviewAndGo} disabled={busy || openText.trim().length < 10}>{busy ? "Analizuję..." : "Pokaż darmowy preview"}</PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {/* CRISIS */}
          {stage === "crisis" && (
            <motion.div key="crisis" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="question-panel crisis-panel">
                <div className="eyebrow danger">TRYB KRYZYSOWY</div>
                <h2>To nie jest właściwe narzędzie dla sytuacji bezpośredniego zagrożenia.</h2>
                <p className="consent-copy">Jeśli istnieje ryzyko przemocy, zagrożenia życia albo zrobienia sobie krzywdy, przerwij tę analizę i skorzystaj z natychmiastowej pomocy.</p>
                <div className="crisis-grid">
                  <Glass className="crisis-box"><strong>112</strong> — numer alarmowy</Glass>
                  <Glass className="crisis-box"><strong>116 123</strong> — telefon zaufania dla dorosłych w kryzysie emocjonalnym</Glass>
                  <Glass className="crisis-box"><strong>116 111</strong> — telefon zaufania dla dzieci i młodzieży</Glass>
                </div>
                <div className="section-actions"><GhostButton onClick={resetAll}>Zamknij analizę</GhostButton></div>
              </Glass>
            </motion.div>
          )}

          {/* PREVIEW */}
          {stage === "preview" && preview && (
            <motion.div key="preview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="preview-card">
                <div className="preview-hero">
                  <div className="eyebrow">DARMOWE LUSTRO SYTUACJI</div>
                  <h2>{preview.headline}</h2>
                  <div className="preview-truth-top">{preview.truth}</div>
                  <div className="preview-mirror-top">{preview.mirror}</div>
                </div>
                <PremiumBadge preview={preview} />
                <div className="metrics-grid">
                  {([[preview.tension, "POZIOM NAPIĘCIA"], [preview.asymmetry, "ASYMETRIA"], [preview.change, "SZANSA ZMIANY"]] as [number, string][]).map(([value, label]) => (
                    <Glass key={label} className="metric-card"><div className="metric-value">{value}%</div><div className="metric-label">{label}</div></Glass>
                  ))}
                </div>
                <div className="preview-grid">
                  <Glass className="report-section"><div className="eyebrow">CO WIDAĆ JUŻ TERAZ</div><p>{preview.summary}</p></Glass>
                  <Glass className="report-section"><div className="eyebrow">NAJMOCNIEJSZY MECHANIZM</div><p>{preview.tone === "green" ? "Najmocniej działa tu jeszcze struktura i wzajemność, ale to nie zwalnia z patrzenia na słabsze miejsca." : preview.tone === "yellow" ? "Napięcie miesza się tu z nadzieją i przywiązaniem. To właśnie ta mieszanka najłatwiej utrzymuje ludzi w zawieszeniu." : "Najmocniej pracuje tu układ ulgi po napięciu albo lęku przed stratą. To często sprawia, że ciężko odpuścić nawet wtedy, gdy relacja już kosztuje."}</p></Glass>
                  <Glass className="report-section"><div className="eyebrow">CZEGO PEŁNY RAPORT NIE OMINIE</div><p>{preview.paidTease}</p></Glass>
                </div>
                <Glass className="unlock-panel">
                  <div className="eyebrow">TO TYLKO FRAGMENT</div>
                  <p className="unlock-copy">Pełny raport pokaże Ci to, czego ten widok nie zawiera: twój wzorzec w relacjach, mechanizmy obronne które stosujesz, to gdzie najprawdopodobniej się oszukujesz — i trzy realne scenariusze tego, co się wydarzy dalej. Raport jest generowany indywidualnie na podstawie twoich odpowiedzi. Nikt inny nie dostanie takiego samego.</p>
                  <div className="unlock-form">
                    <input className="ctms-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Adres e-mail — wyślemy Ci link do raportu" />
                    <PrimaryButton onClick={pay} disabled={busy}>{busy ? "Przetwarzanie..." : "Odblokuj pełny raport — 29 zł"}</PrimaryButton>
                    <div className="unlock-note">Widzisz teraz podgląd. Pełna analiza psychologiczna dostępna po jednorazowej płatności. Możesz wrócić do raportu w dowolnym momencie z linku w e-mailu.</div>
                  </div>
                </Glass>
                {error && <div className="error-line">{error}</div>}
                <div className="section-actions"><GhostButton onClick={goBack}>Wróć</GhostButton><GhostButton onClick={resetAll}>Od początku</GhostButton></div>
              </Glass>
            </motion.div>
          )}

          {/* PROCESSING */}
          {stage === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="loading-wrap"><Glass className="loading-panel"><div className="spinner" /><h2>Przetwarzanie płatności i raportu…</h2><p>Jeśli to trwa chwilę, nie zamykaj karty. System sprawdza status płatności i raportu.</p></Glass></div>
            </motion.div>
          )}

          {/* PAID */}
          {stage === "paid" && fullReport && (
            <motion.div key="paid" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="preview-card">
                <div className="eyebrow">RAPORT PREMIUM</div>
                <div className="report-head">
                  <h2>{fullReport.headline || "Ta relacja daje Ci kontakt, ale nie daje Ci oparcia."}</h2>
                  <p>{fullReport.subheadline || "Największy problem nie leży w jednym zdarzeniu. Leży w tym, że napięcie stało się normą, a jasność nadal nie przychodzi."}</p>
                </div>
                {typeof fullReport.rebuildPercent === "number" && (
                  <div className="metrics-grid">
                    {([[fullReport.rebuildPercent, "NA ILE TO MA SENS"], [fullReport.tensionPercent || 0, "POZIOM NAPIĘCIA"], [fullReport.driftPercent || 0, "ASYMETRIA"]] as [number, string][]).map(([value, label]) => (
                      <Glass key={label} className="metric-card"><div className="metric-value">{value}%</div><div className="metric-label">{label}</div></Glass>
                    ))}
                  </div>
                )}
                {fullReport.previewLine && <div className="report-preview-line">{fullReport.previewLine}</div>}
                <div className="report-sections">
                  {(fullReport.sections || []).map((section, i) => (
                    <Glass key={i} className="report-section"><div className={`report-section-title ${section.tone || "normal"}`}>{section.title}</div><div className="report-section-text">{section.text}</div></Glass>
                  ))}
                </div>
                {fullReport.closing && <div className="report-closing">{fullReport.closing}</div>}
                <Glass className="mail-access-box">Dostęp do raportu został zapisany. Możesz wrócić do niego później z bezpiecznego linku wysłanego na e-mail.</Glass>
                <div className="section-actions"><GhostButton onClick={resetAll}>Nowa analiza</GhostButton></div>
              </Glass>
            </motion.div>
          )}

          {/* ERROR */}
          {stage === "error" && (
            <motion.div key="error" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="question-panel">
                <div className="eyebrow danger">BŁĄD</div>
                <h2>Coś się wywaliło po drodze, ale przynajmniej wiemy gdzie.</h2>
                <p className="consent-copy">{error}</p>
                <div className="section-actions"><GhostButton onClick={() => setStage(preview ? "preview" : "landing")}>Wróć</GhostButton><GhostButton onClick={resetAll}>Od początku</GhostButton></div>
              </Glass>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="ctms-footer">
        <div className="ctms-footer-inner">
          <div className="ctms-footer-brand">CzyToMaSens.</div>
          <div className="ctms-footer-links">
            <button onClick={() => setLegalOpen("regulamin")}>Regulamin</button>
            <button onClick={() => setLegalOpen("prywatnosc")}>Polityka prywatności</button>
            <button onClick={() => setLegalOpen("rodo")}>RODO</button>
            <button onClick={() => setLegalOpen("kontakt")}>Kontakt</button>
          </div>
        </div>
      </footer>

      {legalOpen && (
        <div className="ctms-modal-backdrop" onClick={() => setLegalOpen(null)}>
          <div className="ctms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ctms-modal-head">
              <div className="eyebrow">INFORMACJE PRAWNE</div>
              <button className="ctms-modal-close" onClick={() => setLegalOpen(null)}>×</button>
            </div>
            <h3>{LEGAL_CONTENT[legalOpen].title}</h3>
            <p>{LEGAL_CONTENT[legalOpen].body}</p>
          </div>
        </div>
      )}
    </div>
  );
}
