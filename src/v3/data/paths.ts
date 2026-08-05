export type EntryKey =
  | "unease"
  | "betrayal"
  | "uncertain"
  | "asymmetry"
  | "conflict"
  | "stagnation"
  | "returning"
  | "triangle"
  | "loop";

export type Option = { id: string; label: string; score: number };
export type Question = { id: string; lead: string; text: string; options: Option[] };

export type EntryConfig = {
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

export const PATHS: EntryConfig[] = [
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

export const PATH_BY_KEY = Object.fromEntries(PATHS.map((path) => [path.key, path])) as Record<EntryKey, EntryConfig>;

export const PATH_CONTEXT: Record<EntryKey, {
  short: string;
  scenePrompt: string;
  mechanismPrompt: string;
  realityPrompt: string;
  finalPrompt: string;
}> = {
  unease: {
    short: "Niepokój bez jednej oczywistej przyczyny",
    scenePrompt: "Opisz ostatnią konkretną sytuację, po której poczułeś/poczułaś, że coś jest nie tak. Co dałoby się zobaczyć lub usłyszeć?",
    mechanismPrompt: "Co zrobiłeś/zrobiłaś później i co zrobiła druga osoba? Kto przejął ciężar uspokojenia albo wyjaśnienia sytuacji?",
    realityPrompt: "Który element tej historii jest faktem, a który Twoim najlepszym wyjaśnieniem tego faktu?",
    finalPrompt: "Dopisz wszystko, co może podważyć zarówno wersję, że problem leży w relacji, jak i wersję, że głównym źródłem jest Twój lęk."
  },
  betrayal: {
    short: "Zdrada, utrata zaufania lub ukrywanie",
    scenePrompt: "Odtwórz jedno zdarzenie związane z utratą zaufania w kolejności: co się wydarzyło, co zostało powiedziane i co nastąpiło potem.",
    mechanismPrompt: "Kto dziś realnie wykonuje pracę odbudowy zaufania i jakie działania pojawiają się bez przypominania?",
    realityPrompt: "Usuń przeprosiny i deklaracje. Co w samych zachowaniach potwierdza zmianę, a co jej przeczy?",
    finalPrompt: "Dopisz okoliczności, które mogą uczciwie zmienić ocenę: nowe fakty, długość poprawy, odpowiedzialność drugiej strony i Twoje wcześniejsze doświadczenia."
  },
  uncertain: {
    short: "Niejasna relacja i brak odpowiedzi, na czym stoisz",
    scenePrompt: "Opisz jedną sytuację, po której nadal nie było wiadomo, na czym stoisz. Co dokładnie zrobiła lub powiedziała druga osoba?",
    mechanismPrompt: "Co robisz, żeby mimo braku jasności utrzymać kontakt lub nadzieję? Co robi wtedy druga strona?",
    realityPrompt: "Gdybyś nie wypełniał/wypełniała luk własną interpretacją, co pozostaje jednoznaczne?",
    finalPrompt: "Dopisz wszystko, co może wskazywać zarówno realną niepewność drugiej osoby, jak i świadome utrzymywanie Cię w zawieszeniu."
  },
  asymmetry: {
    short: "Nierówne starania i nierówny ciężar relacji",
    scenePrompt: "Opisz ostatnią sytuację, w której kontakt, naprawa albo decyzja zależały głównie od Ciebie.",
    mechanismPrompt: "Co przejmujesz automatycznie i co dzieje się, gdy tego nie robisz?",
    realityPrompt: "Gdyby usunąć Twój wysiłek z równania, co utrzymałoby się samo przez najbliższe dni?",
    finalPrompt: "Dopisz przykłady inicjatywy drugiej strony, nawet jeśli są rzadkie. Raport ma sprawdzić nierównowagę, a nie ją założyć."
  },
  conflict: {
    short: "Konflikty, które wracają mimo rozmów",
    scenePrompt: "Odtwórz ostatni konflikt od pierwszego konkretnego zdarzenia do momentu, w którym temat uznano za zakończony.",
    mechanismPrompt: "Kto naprawia, kto unika i co dzieje się z właściwym problemem po uspokojeniu emocji?",
    realityPrompt: "Po czym w zachowaniu widać zmianę, a po czym tylko chwilowy spokój?",
    finalPrompt: "Dopisz także sytuacje, w których konflikt został domknięty dobrze. To potrzebne, aby nie pomylić kryzysu ze stałym mechanizmem."
  },
  stagnation: {
    short: "Bliskość zniknęła, została rutyna lub obowiązki",
    scenePrompt: "Opisz zwykły dzień, który najlepiej pokazuje, jak dziś naprawdę funkcjonujecie ze sobą.",
    mechanismPrompt: "Jaki element bliskości zniknął pierwszy i co weszło w jego miejsce?",
    realityPrompt: "Oddziel wspólną historię i obowiązki od świadomego wyboru. Co nadal robicie dla relacji, a nie tylko obok siebie?",
    finalPrompt: "Dopisz sygnały więzi, których nie chcesz pominąć, oraz fakty pokazujące, jak długo trwa obecny układ."
  },
  returning: {
    short: "Powrót po rozstaniu lub ponowny kontakt",
    scenePrompt: "Odtwórz ostatni kontakt po rozstaniu bez dopisywania, co mógł oznaczać.",
    mechanismPrompt: "Co od poprzedniego rozpadu zmieniło się w działaniu, nie tylko w słowach?",
    realityPrompt: "Czy wybierasz dzisiejszą osobę i jej obecne zachowanie, czy najlepszą wersję wspomnienia?",
    finalPrompt: "Dopisz fakty przemawiające za realną zmianą oraz fakty wskazujące na powrót starego schematu."
  },
  triangle: {
    short: "Trzecia osoba, emocjonalny trójkąt lub porównywanie",
    scenePrompt: "Opisz sytuację, w której obecność trzeciej osoby najmocniej zmieniła Twoje zachowanie albo ocenę relacji.",
    mechanismPrompt: "Jaki wcześniejszy brak, konflikt lub potrzebę ta sytuacja odsłoniła?",
    realityPrompt: "Gdyby trzecia osoba zniknęła z historii, jaki problem w głównej relacji nadal pozostałby?",
    finalPrompt: "Dopisz fakty dotyczące wszystkich stron bez diagnozowania ich intencji i bez ujawniania danych pozwalających je zidentyfikować."
  },
  loop: {
    short: "Rozstania, powroty i powtarzający się cykl",
    scenePrompt: "Odtwórz ostatni pełny cykl: napięcie, dystans lub zerwanie, powrót i pierwszy znak starego schematu.",
    mechanismPrompt: "Co daje powrót, że kolejna próba znów wydaje się warta kosztu?",
    realityPrompt: "W którym dokładnym momencie zwykle można przerwać pętlę i czego wtedy najbardziej się obawiasz?",
    finalPrompt: "Dopisz, co tym razem jest naprawdę inne, oraz co wygląda identycznie jak w poprzednich cyklach."
  }
};
