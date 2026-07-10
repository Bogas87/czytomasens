import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BRAND = {
  gold: "#C5A059",
  goldSoft: "#D7B978",
  text: "#F5F1EA",
  muted: "#A8A099",
  border: "rgba(255,255,255,0.08)",
  panel: "rgba(255,255,255,0.03)",
  panelStrong: "rgba(255,255,255,0.05)",
};

type ArticleBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "quote"; text: string }
  | { type: "microCta"; text: string; button?: string };

type Article = {
  slug: string;
  kicker: string;
  category: "decyzja" | "sygnaly" | "status" | "schemat" | "rokowania" | "diagnostyka";
  title: string;
  seoTitle: string;
  seoDescription: string;
  lead: string;
  readingTime: string;
  cardDescription: string;
  highlight: string;
  ctaText: string;
  ctaButton: string;
  related: string[];
  body: ArticleBlock[];
};

const h2 = (text: string): ArticleBlock => ({ type: "h2", text });
const p = (text: string): ArticleBlock => ({ type: "p", text });
const q = (text: string): ArticleBlock => ({ type: "quote", text });
const micro = (text: string, button = "Sprawdź swoją relację"): ArticleBlock => ({ type: "microCta", text, button });

export const ARTICLES: Article[] = [
  {
    slug: "czy-ten-zwiazek-ma-sens",
    kicker: "OCENA",
    category: "decyzja",
    title: "Czy ten związek ma sens?",
    seoTitle: "Czy ten związek ma sens? Kryzys czy brak kierunku | CzyToMaSens",
    seoDescription: "Nie każdy trudny moment oznacza koniec. Sprawdź, jak odróżnić kryzys od relacji, która przestała mieć kierunek.",
    lead: "To pytanie zwykle nie pojawia się w spokojnej relacji. Pojawia się wtedy, kiedy coś zaczyna zabierać więcej miejsca niż sama bliskość.",
    readingTime: "6 min czytania",
    cardDescription: "Nie szukaj jednego dowodu. Zobacz, czy ta relacja ma kierunek, czy tylko kolejne momenty ulgi.",
    highlight: "Sens relacji widać nie po jednym dobrym dniu, tylko po kierunku, w którym to idzie.",
    ctaText: "Masz w głowie konkretną osobę? Wtedy nie chodzi już o teorię. Sprawdź, co rzeczywiście powtarza się między Wami.",
    ctaButton: "Sprawdź tę relację",
    related: ["czy-warto-ratowac-zwiazek", "toksyczna-relacja-czy-trudny-moment", "czy-ona-on-sie-mna-bawi"],
    body: [
      h2("Nie szukaj jednego dowodu"),
      p("Kiedy zastanawiasz się, czy związek ma sens, łatwo czekać na jedno zachowanie, które wszystko rozstrzygnie. Jedną rozmowę, jedną wiadomość, jeden gest. Tyle że relacja rzadko rozpada się albo broni jednym momentem."),
      p("Bardziej liczy się kierunek. Czy po trudnych rozmowach jest realnie inaczej, czy tylko przez chwilę lżej. Czy wracacie do kontaktu, czy do tego samego napięcia z nowymi słowami."),
      q("Nie patrz tylko na to, czy coś czujesz. Zobacz, co ta relacja robi z Tobą na co dzień."),
      h2("Dobry moment nie kasuje całego obrazu"),
      p("Jeden ciepły wieczór potrafi przykryć tydzień niepewności. Jedna dobra wiadomość potrafi uciszyć pytanie, które wracało od kilku dni. I właśnie dlatego tak trudno ocenić relację od środka."),
      p("Nie chodzi o to, żeby przekreślać dobre chwile. Chodzi o to, żeby nie pozwolić im udawać odpowiedzi na pytanie, którego one nie rozstrzygają."),
      h2("Po czym poznać, że to już nie jest tylko kryzys"),
      p("Kryzys ma zwykle jakiś punkt zaczepienia. Wiadomo, co się wydarzyło i czego trzeba dotknąć. Gorzej, kiedy trudno wskazać jedną przyczynę, a mimo to czujesz, że ciągle wracasz do tej samej ściany."),
      p("Rozmawiacie. Przez chwilę jest spokój. Potem znowu czekasz, analizujesz ton, odsuwasz własne potrzeby albo udajesz, że nie potrzebujesz jasności. To już nie jest jeden gorszy dzień."),
      h2("Najprostsze pytanie"),
      p("Gdyby ta relacja przez kolejny rok wyglądała tak samo jak teraz, tylko z kilkoma dobrymi momentami po drodze, czy naprawdę chciałbyś/chciałabyś w niej zostać?"),
      micro("Jeśli przy tym pytaniu od razu pojawia się konkretna osoba, warto sprawdzić nie teorię o związkach, tylko tę jedną sytuację."),
      h2("Mała scena, która mówi więcej niż deklaracje"),
      p("Zwróć uwagę na zwykły wieczór po trudniejszej rozmowie. Nie na wielkie słowa, tylko na to, czy następnego dnia coś jest naprawdę inaczej. Czy temat wraca spokojniej? Czy ktoś bierze odpowiedzialność bez obrony? Czy znowu udajecie, że skoro emocje opadły, problem też zniknął?"),
      p("W relacji, która ma kierunek, nawet trudna rozmowa zostawia po sobie jakiś ślad w zachowaniu. W relacji bez kierunku rozmowa często daje ulgę, ale nie zmienia trasy."),
      h2("Kiedy odpowiedź jest w codzienności"),
      p("Nie szukaj tylko momentów skrajnych: awantur, rozstań, powrotów i wielkich słów. Często więcej mówi zwykły wtorek. Czy po pracy chcesz zadzwonić, czy raczej zbierasz siły na kontakt? Czy po spotkaniu czujesz spokój, czy zaczynasz od nowa analizować, co znaczył jeden gest?"),
      p("Sens relacji widać właśnie tam. Nie w tym, czy da się znaleźć piękne wspomnienie. W tym, czy codzienność przy tej osobie daje Ci więcej życia, czy coraz częściej zmusza do pilnowania własnych emocji."),
    ],
  },
  {
    slug: "czy-warto-ratowac-zwiazek",
    kicker: "DECYZJA",
    category: "decyzja",
    title: "Czy warto ratować związek?",
    seoTitle: "Czy warto ratować związek? Walczyć czy odpuścić | CzyToMaSens",
    seoDescription: "Nie każda walka jest dojrzałością. Sprawdź, czy ratujesz relację, czy już głównie własną nadzieję.",
    lead: "Związek warto ratować wtedy, gdy po obu stronach widać ruch. Jeśli jedna osoba walczy, a druga tylko reaguje, to nie jest wspólna naprawa.",
    readingTime: "7 min czytania",
    cardDescription: "Sprawdź, czy próbujecie naprawić relację, czy jedna osoba trzyma ją za dwie.",
    highlight: "Nie da się uratować związku za dwie osoby.",
    ctaText: "Jeśli nie wiesz, czy jeszcze walczysz o relację, czy już tylko o nadzieję, sprawdź fakty tej jednej historii.",
    ctaButton: "Sprawdź, czy warto walczyć",
    related: ["czy-ten-zwiazek-ma-sens", "relacja-bez-zaangazowania", "czy-warto-dac-druga-szanse"],
    body: [
      h2("Samo uczucie nie naprawia relacji"),
      p("Można kogoś kochać i jednocześnie być bardzo zmęczonym. Można tęsknić, chcieć bliskości i nadal widzieć, że po każdej rozmowie wracacie w ten sam punkt."),
      p("Uczucie mówi, że ta osoba jest ważna. Nie mówi jeszcze, czy ta relacja działa i czy druga strona naprawdę chce ją naprawiać."),
      q("Nie pytaj tylko, czy Ci zależy. Zapytaj, czy zależy Wam obojgu w działaniu, nie tylko w słowach."),
      h2("Kiedy próba naprawy jest wspólna"),
      p("Wspólna naprawa nie musi wyglądać idealnie. Ktoś może nie umieć mówić o emocjach, ale jednak wraca do rozmowy. Może się gubić, ale bierze odpowiedzialność za konkrety."),
      p("To widać po drobiazgach: temat nie znika po przeprosinach, obietnica ma ciąg dalszy, a po konflikcie nie zostajesz sam/sama z analizowaniem, co właściwie się stało."),
      h2("Kiedy walka robi się samotna"),
      p("Samotna walka zaczyna się wtedy, kiedy Ty tłumaczysz, inicjujesz, wracasz do rozmowy, prosisz o jasność i jeszcze pilnujesz, żeby druga osoba nie poczuła się za bardzo przyciśnięta."),
      p("Wtedy nie ratujesz już tylko relacji. Ratujesz też jej obraz w swojej głowie: to, jaka mogłaby być, gdyby druga osoba wreszcie zrobiła krok."),
      h2("Dobry tydzień po kryzysie to jeszcze nie zmiana"),
      p("Po mocnej rozmowie często robi się lepiej. Jest więcej ciepła, wiadomości, bliskości. To może być początek zmiany, ale może też być tylko uspokojenie sytuacji."),
      p("Najważniejsze pytanie brzmi: co dzieje się później, kiedy napięcie opadnie i nikt już nie boi się utraty."),
      h2("Granica"),
      p("Ratowanie ma sens, jeśli po drugiej stronie widać konkretny ruch. Jeśli widać głównie Twoją cierpliwość, Twoje tłumaczenie i Twoje czekanie, to nie jest jeszcze naprawa."),
      micro("Analiza nie podejmie decyzji za Ciebie. Może za to pokazać, czy naprawa naprawdę dzieje się po obu stronach."),
      h2("Sprawdź, czy walczysz o relację, czy o przerwę od lęku"),
      p("Czasem po rozmowie robi się lżej i łatwo uznać to za przełom. Ale przełom poznaje się nie po tym, że przez kilka dni jest spokojniej. Poznaje się go po tym, że ktoś zachowuje się inaczej także wtedy, gdy napięcie opadło i nie musi już niczego udowadniać."),
      p("Jeśli cała poprawa opiera się na Twojej uldze, a nie na zmianie po obu stronach, możesz ratować bardziej własną nadzieję niż realną relację."),
      h2("Trzy pytania przed kolejną próbą"),
      p("Kto po ostatniej trudnej rozmowie zrobił coś konkretnego, nie tylko powiedział coś kojącego? Co zmieniło się po tygodniu, kiedy emocje już opadły? I czy druga strona sama wraca do tematu, czy temat istnieje tylko wtedy, kiedy Ty go podnosisz?"),
      p("To nie są pytania po to, żeby kogoś oskarżać. One oddzielają wspólną naprawę od sytuacji, w której jedna osoba pilnuje całej relacji, a druga pojawia się głównie wtedy, kiedy grozi utrata spokoju."),
    ],
  },
  {
    slug: "czy-ona-on-sie-mna-bawi",
    kicker: "SYGNAŁY",
    category: "sygnaly",
    title: "Czy on/ona się Tobą bawi?",
    seoTitle: "Czy ona/on się mną bawi? Mieszane sygnały | CzyToMaSens",
    seoDescription: "Raz blisko, raz daleko. Sprawdź, czy to realne zaangażowanie, czy miejsce w rezerwie.",
    lead: "Najpierw pytasz, czy tej osobie zależy. Potem zaczynasz sprawdzać, czy jesteś wyborem, czy tylko wygodną możliwością.",
    readingTime: "6 min czytania",
    cardDescription: "Mieszane sygnały potrafią trzymać mocniej niż jasne odrzucenie. Zobacz, co może się za nimi kryć.",
    highlight: "Ktoś może dawać tyle, żebyś został, i za mało, żebyś poczuł spokój.",
    ctaText: "Jeśli masz w głowie rozmowy, po których przez chwilę było ciepło, a potem znowu niejasno, sprawdź ten układ na faktach.",
    ctaButton: "Sprawdź, co znaczą te sygnały",
    related: ["relacja-bez-zaangazowania", "jednostronna-relacja", "czy-ten-zwiazek-ma-sens"],
    body: [
      h2("Mieszane sygnały rzadko są przypadkowe w odbiorze"),
      p("Jednego dnia czujesz, że jesteś ważny/ważna. Drugiego znowu nie wiesz, czy możesz na coś liczyć. I zaczynasz żyć nie tyle relacją, ile próbą odczytania drugiej osoby."),
      p("To nie musi znaczyć, że ktoś robi to celowo. Ale skutki są konkretne: więcej czekania, więcej sprawdzania, więcej dopowiadania brakujących fragmentów."),
      q("Najbardziej wciąga nie jasne nie. Najbardziej wciąga czasem niejasne może."),
      h2("Zobacz, kiedy robi się ciepło"),
      p("Czy ta osoba zbliża się wtedy, kiedy Ty zaczynasz odpuszczać? Czy robi krok dokładnie wtedy, gdy czujesz, że dłużej tak nie możesz?"),
      p("Jeśli ciepło pojawia się głównie wtedy, kiedy grozi utrata Twojej dostępności, to nie jest pełna odpowiedź. To może być tylko reakcja na ryzyko, że przestaniesz czekać."),
      h2("Kto ryzykuje więcej"),
      p("Zwróć uwagę, kto w tej relacji mówi wprost, pyta o przyszłość, odsłania się, czeka na odpowiedź. A kto może zostać w bezpiecznej pozycji: blisko, ale bez jasnej decyzji."),
      p("Jeśli tylko Ty ryzykujesz odrzucenie, a druga strona może brać bliskość bez odpowiedzialności, to nie jest równy układ."),
      h2("Najprostszy sprawdzian"),
      p("Co dzieje się, kiedy przestajesz podtrzymywać kontakt? Nie jako gra. Jako zwykłe sprawdzenie, czy relacja ma własny ruch, kiedy Ty jej nie ciągniesz."),
      micro("Mieszane sygnały najlepiej widać nie po jednym zachowaniu, tylko po tym, co wraca, gdy przestajesz wszystko dopowiadać."),
      h2("Najmocniejszy sygnał często widać po Twoim zachowaniu"),
      p("Nie chodzi tylko o to, co robi druga osoba. Zobacz, co zaczynasz robić Ty: sprawdzasz telefon, liczysz odstępy między wiadomościami, czekasz na ton, który potwierdzi, że znowu jesteś ważny. To znak, że relacja przestała dawać stabilny kontakt, a zaczęła produkować czujność."),
      h2("Scena, która zwykle wszystko wyjaśnia"),
      p("Wyobraź sobie, że przez kilka dni nie podtrzymujesz kontaktu. Nie z obrazy. Po prostu przestajesz być osobą, która pilnuje rytmu. Co się dzieje? Czy druga strona zauważa zmianę i próbuje wrócić do Ciebie, czy kontakt zaczyna cichnąć bez większego oporu?"),
      p("Czasem odpowiedź nie jest w tym, co ktoś mówi, kiedy pytasz wprost. Jest w tym, co robi, kiedy nie musi już reagować na Twoje staranie."),
      p("Ktoś nie musi robić Ci krzywdy wprost, żeby trzymać Cię w napięciu. Czasem wystarczy nieregularna bliskość, która pojawia się dokładnie wtedy, kiedy zaczynasz odpuszczać."),
    ],
  },
  {
    slug: "toksyczna-relacja-czy-trudny-moment",
    kicker: "ROZRÓŻNIENIE",
    category: "sygnaly",
    title: "Toksyczna relacja czy trudny moment?",
    seoTitle: "Toksyczna relacja czy trudny moment? | CzyToMaSens",
    seoDescription: "Nie każde napięcie jest toksyczne. Sprawdź, kiedy trudny okres mija, a kiedy relacja zaczyna stale niszczyć spokój.",
    lead: "Nie każda trudność oznacza destrukcyjną relację. Ale nie każdy kryzys jest tylko etapem, który sam minie.",
    readingTime: "6 min czytania",
    cardDescription: "Zobacz różnicę między trudnym okresem a relacją, która regularnie zabiera spokój.",
    highlight: "Trudny moment ma źródło. Destrukcyjny układ ma powtarzalny kierunek.",
    ctaText: "Jeśli nie wiesz, czy to chwilowy kryzys, czy coś stałego, sprawdź, co dzieje się także w spokojniejsze dni.",
    ctaButton: "Sprawdź, co to jest",
    related: ["czy-moj-zwiazek-jest-zdrowy", "czy-ten-zwiazek-ma-sens", "jednostronna-relacja"],
    body: [
      h2("Trudny okres zwykle ma tło"),
      p("Stres, choroba, pieniądze, praca, rodzina. Są momenty, w których relacja dostaje ciężar z zewnątrz. Wtedy ludzie bywają gorsi, bardziej zamknięci, mniej cierpliwi."),
      p("Ale po takim okresie powinno być widać powrót szacunku. Może nie od razu idealny, ale prawdziwy."),
      h2("Co dzieje się, kiedy jest spokojniej"),
      p("To jedno z ważniejszych pytań. Jeśli nawet spokojne dni są pełne napięcia, kontroli, karania ciszą albo chodzenia na palcach, problem nie leży tylko w trudnym czasie."),
      q("Nie oceniaj relacji wyłącznie po kryzysie. Zobacz, czy poza kryzysem wraca bezpieczeństwo."),
      h2("Kiedy zaczynasz zmieniać siebie, żeby nie wywołać reakcji"),
      p("Uważasz na słowa. Rezygnujesz z tematów. Zanim coś powiesz, sprawdzasz w głowie, czy nie będzie awantury, ciszy albo obrażenia się."),
      p("Jeśli coraz więcej energii idzie w przewidywanie reakcji drugiej osoby, to jest ważniejszy sygnał niż sama liczba kłótni."),
      h2("Nie chodzi o etykietę"),
      p("Słowo 'toksyczne' bywa używane za łatwo. Ważniejsze jest pytanie: czy ta relacja po trudnych momentach wraca do szacunku, czy do napięcia i lęku przed kolejną reakcją."),
      h2("Spokojny dzień mówi więcej niż awantura"),
      p("W trudnym momencie każdy może powiedzieć za dużo. Dlatego nie oceniaj wyłącznie po najgorszej kłótni. Zobacz, jak jest wtedy, kiedy nie ma presji. Czy jest szacunek, ciekawość, normalny kontakt? Czy nawet w spokojniejsze dni czujesz, że musisz uważać na ton, słowa i własne potrzeby?"),
      p("Jeśli napięcie nie znika nawet wtedy, kiedy nic złego się nie dzieje, problem może być głębiej niż w jednym kryzysie."),
      micro("Analiza pomaga oddzielić trudny okres od sytuacji, która regularnie ustawia Cię w obronie."),
      h2("Jedno pytanie porządkujące"),
      p("Gdyby zniknął obecny stres, praca, pieniądze, zmęczenie albo presja z zewnątrz, czy sposób traktowania siebie naprawdę by się zmienił? Jeśli tak, możliwe, że patrzysz na trudny okres. Jeśli nie, problem może leżeć głębiej: w tym, jak wygląda między Wami bliskość, konflikt i granice."),
      p("To rozróżnienie jest ważne, bo trudny okres wymaga wsparcia. Stała destrukcja wymaga nazwania tego, co przestało być bezpieczne."),
    ],
  },
  {
    slug: "czy-warto-dac-druga-szanse",
    kicker: "DECYZJA",
    category: "decyzja",
    title: "Czy warto dać drugą szansę?",
    seoTitle: "Czy warto dać drugą szansę? Tęsknota czy zmiana | CzyToMaSens",
    seoDescription: "Tęsknota po rozstaniu nie mówi jeszcze, czy warto wracać. Sprawdź, czy za drugą szansą stoi realna zmiana.",
    lead: "Druga szansa ma sens wtedy, gdy zmienia się coś więcej niż nastrój po rozstaniu.",
    readingTime: "6 min czytania",
    cardDescription: "Sprawdź, czy wraca realna zmiana, czy tylko ulga po tym, że znowu jesteście blisko.",
    highlight: "Tęsknota mówi, że rozłąka bolała. Nie mówi jeszcze, czy coś się zmieniło.",
    ctaText: "Jeśli myślisz o powrocie, sprawdź nie obietnice, tylko to, co naprawdę zmieniło się od ostatniego razu.",
    ctaButton: "Sprawdź ten powrót",
    related: ["czy-warto-ratowac-zwiazek", "dlaczego-wracasz-do-tego-samego-partnera", "jak-rozpoznac-ze-zwiazek-nie-ma-przyszlosci"],
    body: [
      h2("Powrót potrafi wyglądać jak dowód"),
      p("Kiedy ktoś wraca, łatwo poczuć ulgę i uznać ją za odpowiedź. Skoro wrócił/wróciła, to może jednak zależy. Skoro znowu jest blisko, to może teraz będzie inaczej."),
      p("Tylko że powrót pokazuje głównie, że rozłąka coś uruchomiła. Nie pokazuje jeszcze, czy przyczyna rozstania została naprawdę dotknięta."),
      q("Druga szansa zaczyna mieć sens dopiero wtedy, kiedy zmienia się zachowanie, nie tylko ton rozmowy."),
      h2("Co konkretnie jest inne"),
      p("Nie pytaj tylko, czy rozmowa była szczera. Zapytaj, co po niej wygląda inaczej w codzienności. Czy ktoś wraca do tematu bez nacisku. Czy bierze odpowiedzialność bez obrony. Czy robi coś, czego wcześniej unikał."),
      p("Jeśli odpowiedź brzmi: 'na razie jest miło', to jeszcze za mało, żeby mówić o zmianie."),
      h2("Tęsknota za osobą czy za początkiem"),
      p("Czasem tęsknisz nie za tym, jak było ostatnio, tylko za wersją relacji sprzed wszystkich rozczarowań. Za początkiem. Za tym, kim ta osoba potrafiła być w najlepszych momentach."),
      p("To ludzkie. Ale decyzja o powrocie musi dotyczyć obecnej relacji, nie jej najładniejszego wspomnienia."),
      h2("Jedno pytanie przed powrotem"),
      p("Gdybyście wrócili i po miesiącu znowu pojawił się ten sam problem, czy miałbyś/miałabyś poczucie, że to naprawdę nowy start, czy kolejna runda tego samego?"),
      h2("Co powinno być inne od pierwszego tygodnia"),
      p("Pierwszy tydzień po powrocie prawie zawsze bywa lepszy. Jest ulga, ostrożność i dużo obietnic. Dlatego nie oceniaj powrotu po tym, czy znowu jest miło. Oceń go po tym, czy po miesiącu zmienił się sposób rozmowy, reagowania i brania odpowiedzialności."),
      p("Druga szansa ma sens, kiedy pojawia się nowa jakość. Bez niej wracasz nie do naprawionej relacji, tylko do znajomego miejsca z chwilowo lepszym nastrojem."),
      micro("Przed drugą szansą warto zobaczyć różnicę między ulgą a zmianą."),
      h2("Nie pytaj, czy tęsknicie. Pytaj, co się zmieniło"),
      p("Po rozstaniu tęsknota potrafi wyglądać jak dowód miłości. Ale tęsknota mówi tylko, że więź była ważna albo że strata boli. Nie mówi jeszcze, czy zniknęła przyczyna, przez którą relacja się rozpadła."),
      p("Druga szansa zaczyna mieć sens dopiero wtedy, gdy można wskazać konkretny ruch: inną reakcję po konflikcie, gotowość do rozmowy, domknięty temat, decyzję, która coś kosztowała."),
    ],
  },
  {
    slug: "relacja-bez-zaangazowania",
    kicker: "STATUS",
    category: "status",
    title: "Relacja bez zaangażowania",
    seoTitle: "Relacja bez zaangażowania. Bliskość bez jasności | CzyToMaSens",
    seoDescription: "Nie wiecie, kim dla siebie jesteście? Sprawdź, dlaczego brak jasności potrafi kosztować więcej niż samotność.",
    lead: "To nie jest zwykłe 'nic'. Jeśli jest bliskość, oczekiwanie i napięcie, brak nazwy też zaczyna mieć cenę.",
    readingTime: "6 min czytania",
    cardDescription: "Bliskość bez jasnych zasad potrafi działać jak związek, ale bez odpowiedzialności związku.",
    highlight: "Brak nazwy nie jest neutralny, jeśli jedna osoba płaci za niego spokojem.",
    ctaText: "Jeśli nie wiesz, kim dla siebie jesteście, sprawdź, komu ta niejasność naprawdę służy.",
    ctaButton: "Sprawdź tę niejasność",
    related: ["czy-ona-on-sie-mna-bawi", "jednostronna-relacja", "czy-ten-zwiazek-ma-sens"],
    body: [
      h2("Bliskość bez ram też coś znaczy"),
      p("Możecie pisać codziennie, spotykać się, mieć czułość i nadal nie wiedzieć, czym to jest. Na początku taka lekkość bywa wygodna. Potem zaczyna ciążyć."),
      p("Bo bez jasności nie wiesz, ile możesz dać, o co możesz pytać i czy masz prawo oczekiwać czegoś więcej."),
      q("Niejasność jest wygodna dla tej osoby, która mniej ryzykuje."),
      h2("Kto korzysta z braku nazwy"),
      p("Jeśli nazwiecie relację, pojawiają się oczekiwania. Jeśli jej nie nazwiecie, ktoś może mieć bliskość bez decyzji, czułość bez odpowiedzialności i Twoją dostępność bez jasnej deklaracji."),
      p("To nie zawsze jest cyniczne. Czasem ktoś po prostu korzysta z układu, który jest dla niego wygodny."),
      h2("Co pokazuje rozmowa o statusie"),
      p("Najwięcej mówi nie sama odpowiedź, ale reakcja na pytanie. Czy ta osoba próbuje Cię zrozumieć, czy od razu robi z Ciebie kogoś, kto przesadza."),
      p("Jeśli każde pytanie o jasność kończy się żartem, zmianą tematu albo chłodem, to też jest odpowiedź."),
      h2("A może Ty też boisz się jasności"),
      p("Czasem zostajesz w niejasności nie dlatego, że jej chcesz, tylko dlatego, że jasna odpowiedź mogłaby zaboleć bardziej niż czekanie."),
      h2("Cena relacji bez nazwy"),
      p("Brak statusu rzadko boli od razu. Na początku może nawet wyglądać lekko: bez presji, bez deklaracji, bez wielkich rozmów. Koszt pojawia się później, kiedy jedna osoba zaczyna żyć jak w relacji, a druga wciąż korzysta z wolności, jakby nic nie zostało ustalone."),
      p("Wtedy pytanie nie brzmi już, jak to nazwać. Pytanie brzmi, czy ten brak nazwy nie pozwala komuś brać bliskości bez odpowiedzialności za to, co ta bliskość robi z Tobą."),
      micro("Analiza pomaga zobaczyć, czy brak nazwy jest etapem, czy wygodnym miejscem dla jednej strony."),
      h2("Brak statusu też ustawia zasady"),
      p("To, że czegoś nie nazwaliście, nie oznacza, że to nie działa. Brak nazwy często sam staje się zasadą: jedna osoba może brać bliskość, ale nie musi brać odpowiedzialności. Druga zostaje z pytaniem, ile może chcieć, żeby nie wyjść na kogoś, kto oczekuje za dużo."),
      p("Właśnie dlatego relacje bez nazwy potrafią być tak męczące. Nie ma oficjalnego konfliktu, ale jest codzienna niepewność, jak bardzo wolno Ci być w tej historii obecnym."),
    ],
  },
  {
    slug: "dlaczego-wracasz-do-tego-samego-partnera",
    kicker: "POWRÓT",
    category: "schemat",
    title: "Dlaczego wracasz do tego samego partnera",
    seoTitle: "Dlaczego wracasz do tego samego partnera | CzyToMaSens",
    seoDescription: "Nie zawsze wracasz do miłości. Czasem wracasz do znanego napięcia, którego umiesz się spodziewać.",
    lead: "Powrót do tej samej osoby często nie wynika z braku wiedzy. Wiesz, co bolało. A jednak coś ciągnie z powrotem.",
    readingTime: "7 min czytania",
    cardDescription: "Wracasz do człowieka, do nadziei czy do znanego napięcia? Zobacz różnicę.",
    highlight: "Znajome nie zawsze znaczy dobre. Czasem znaczy tylko przewidywalne.",
    ctaText: "Jeśli rozumiesz teorię, ale nadal wracasz do tej osoby, sprawdź, co dokładnie trzyma Cię w tym układzie.",
    ctaButton: "Sprawdź, co Cię trzyma",
    related: ["czy-warto-dac-druga-szanse", "relacja-bez-zaangazowania", "czy-warto-ratowac-zwiazek"],
    body: [
      h2("Sama świadomość nie zawsze wystarcza"),
      p("Możesz wiedzieć, że ten powrót nie jest dla Ciebie dobry. Możesz widzieć, że po czasie pojawia się ten sam ból. A mimo to, kiedy kontakt wraca, ciało reaguje szybciej niż rozsądek."),
      p("To nie musi znaczyć, że jesteś słaby/słaba. Czasem znane napięcie daje złudzenie bezpieczeństwa, bo przynajmniej wiesz, czego się spodziewać."),
      q("Nie wszystko, co intensywne, jest bliskością."),
      h2("Powrót po ulgę"),
      p("Po rozstaniu boli nie tylko brak osoby. Boli też niedomknięcie, pytanie, czy mogło być inaczej, i myśl, że może tym razem wystarczy inaczej zacząć rozmowę."),
      p("Wtedy wracasz niekoniecznie po relację. Czasem wracasz po ulgę od napięcia, które sama rozłąka uruchomiła."),
      h2("Najbardziej trzyma niedokończona historia"),
      p("Gdyby ta relacja była jednoznacznie zła, łatwiej byłoby odejść. Najmocniej trzymają relacje, w których było coś prawdziwego, ale nie było dość stabilności, żeby można było na tym stanąć."),
      h2("Co sprawdzić przed kolejnym powrotem"),
      p("Nie pytaj tylko: czy tęsknię. Zapytaj: czy zmieniło się to, przez co ostatnio odszedłem/odeszłam albo chciałem/chciałam odejść."),
      h2("Moment, w którym zwykle wracasz"),
      p("Najczęściej nie wraca się w pełnym spokoju. Wraca się po wiadomości, po wspomnieniu, po samotnym wieczorze, po tym jednym geście, który przypomina lepszą wersję tej osoby. I wtedy głowa podsuwa prostą historię: może tym razem będzie inaczej."),
      p("Warto złapać właśnie ten moment. Nie po to, żeby siebie zawstydzać, tylko żeby zobaczyć, czy wracasz do realnej zmiany, czy do ulgi po napięciu, które sam powrót na chwilę wycisza."),
      micro("Jeśli powrót kręci się wokół ulgi, a nie realnej zmiany, warto to zobaczyć przed kolejną rundą."),
      h2("Powrót często zaczyna się przed pierwszą wiadomością"),
      p("Najpierw pojawia się myśl, że może tym razem będzie spokojniej. Potem przypominasz sobie dobry moment. Potem zaczynasz łagodzić w głowie to, co wcześniej było nie do przyjęcia. Zanim napiszesz albo odbierzesz telefon, część decyzji już się w Tobie wydarzyła."),
      p("Dlatego samo rozumienie schematu nie zawsze zatrzymuje powrót. Trzeba jeszcze zobaczyć, w którym momencie zaczynasz samodzielnie przygotowywać grunt pod kolejną próbę."),
    ],
  },
  {
    slug: "czy-moj-zwiazek-jest-zdrowy",
    kicker: "KONDYCJA",
    category: "diagnostyka",
    title: "Czy mój związek jest zdrowy?",
    seoTitle: "Czy mój związek jest zdrowy? | CzyToMaSens",
    seoDescription: "Zdrowa relacja to nie brak kłótni. To sposób, w jaki wracacie do siebie po napięciu.",
    lead: "Zdrowego związku nie poznaje się po tym, że nigdy nie boli. Poznaje się go po tym, co dzieje się po trudnym momencie.",
    readingTime: "6 min czytania",
    cardDescription: "Nie chodzi tylko o kłótnie. Chodzi o to, kim stajesz się przy tej osobie.",
    highlight: "Pytanie nie brzmi tylko: co czujesz do tej osoby. Pytanie brzmi: jak funkcjonujesz przy niej.",
    ctaText: "Jeśli przy tej osobie częściej się kurczysz niż uspokajasz, sprawdź nie etykietę, tylko konkretne sytuacje.",
    ctaButton: "Sprawdź kondycję relacji",
    related: ["toksyczna-relacja-czy-trudny-moment", "czy-ten-zwiazek-ma-sens", "jednostronna-relacja"],
    body: [
      h2("Zdrowa relacja nie oznacza braku konfliktów"),
      p("Pary, które dobrze funkcjonują, też się kłócą. Różnica polega na tym, czy po konflikcie jest droga z powrotem: rozmowa, odpowiedzialność, naprawa, zwykłe poczucie, że jesteście po tej samej stronie."),
      p("Jeśli po napięciu zostaje cisza, kara, unikanie albo udawanie, że nic się nie stało, problemem nie jest sama kłótnia."),
      q("Najwięcej o relacji mówi nie konflikt, tylko to, co dzieje się po nim."),
      h2("Jak jesteś przy tej osobie"),
      p("Zwróć uwagę, czy mówisz normalnie, czy filtrujesz każde zdanie. Czy jesteś sobą, czy stale sprawdzasz, co wolno powiedzieć. Czy po spotkaniu czujesz więcej spokoju, czy więcej napięcia."),
      p("Czasem relacja nie niszczy jednym dramatem. Robi to powoli, przez stałe dostosowywanie się jednej osoby."),
      h2("Kiedy zaczynasz się kurczyć"),
      p("Przestajesz mówić o potrzebach, bo nie chcesz awantury. Odkładasz rozmowy, bo wiesz, jak się skończą. Tłumaczysz drugą osobę przed sobą, zanim ktokolwiek o coś zapyta."),
      p("To są konkretne sygnały, nie abstrakcyjna teoria."),
      h2("Zdrowie relacji widać w codzienności"),
      p("Nie w deklaracjach. W tym, czy możesz oddychać, mówić, pytać, odmawiać i wracać do trudnych spraw bez poczucia, że zaraz zapłacisz za to chłodem albo atakiem."),
      h2("Zdrowie relacji widać też po Tobie"),
      p("Nie zawsze trzeba zaczynać od oceny drugiej osoby. Czasem wystarczy zobaczyć, co dzieje się z Tobą. Czy mówisz prościej, czy coraz bardziej dobierasz słowa. Czy po spotkaniu czujesz się bliżej siebie, czy bardziej zależny/zależna od tego, jaki ktoś miał humor."),
      p("Zdrowa relacja nie oznacza braku konfliktów. Oznacza, że konflikt nie zabiera Ci prawa do bycia sobą."),
      micro("Analiza nie mówi, czy ktoś jest dobry albo zły. Pokazuje, co ta relacja robi z Tobą w praktyce."),
      h2("Zdrowie relacji widać po tym, co dzieje się po napięciu"),
      p("Nie po tym, czy zawsze jest miło. Nie po tym, czy ktoś potrafi być czuły w dobrym momencie. Bardziej po tym, czy po konflikcie można wrócić do rozmowy bez kary, ciszy, upokarzania albo udawania, że temat nie istnieje."),
      p("Zdrowa relacja nie musi być idealna. Ale powinna dawać możliwość bycia sobą także wtedy, gdy pojawia się różnica zdań."),
    ],
  },
  {
    slug: "jak-rozpoznac-ze-zwiazek-nie-ma-przyszlosci",
    kicker: "ROKOWANIA",
    category: "rokowania",
    title: "Jak rozpoznać, że związek nie ma przyszłości",
    seoTitle: "Jak rozpoznać, że związek nie ma przyszłości | CzyToMaSens",
    seoDescription: "Miłość i przyszłość relacji to nie zawsze to samo. Sprawdź, kiedy relacja traci kierunek mimo uczuć.",
    lead: "Brak przyszłości rzadko pojawia się nagle. Częściej widać go w tym, że coraz trudniej wyobrazić sobie spokojne dalej.",
    readingTime: "7 min czytania",
    cardDescription: "Można kochać i jednocześnie widzieć, że ta relacja nie ma kierunku.",
    highlight: "Uczucie i przyszłość to dwie różne sprawy.",
    ctaText: "Jeśli ciągle szukasz wyjątku, który ma przykryć cały kierunek, sprawdź tę relację bez dopowiadania wygodnej wersji.",
    ctaButton: "Sprawdź kierunek",
    related: ["czy-ten-zwiazek-ma-sens", "czy-warto-ratowac-zwiazek", "czy-warto-dac-druga-szanse"],
    body: [
      h2("Brak przyszłości nie zawsze wygląda dramatycznie"),
      p("Czasem nie ma zdrady, wielkiej awantury ani jednego momentu, który wszystko kończy. Jest za to coraz więcej zmęczenia, odkładania rozmów i życia w wersji 'jakoś będzie'."),
      p("Problem w tym, że 'jakoś będzie' rzadko buduje przyszłość. Częściej tylko odsuwa decyzję."),
      q("Można kochać i jednocześnie nie mieć z czego zbudować dalszego ciągu."),
      h2("Przyszłość, której nie umiesz zobaczyć"),
      p("Spróbuj wyobrazić sobie Was za rok. Nie idealnie. Realnie. Z tym samym stylem rozmów, tym samym sposobem reagowania, tym samym poziomem jasności."),
      p("Jeśli obraz od razu robi się mglisty albo ciężki, to nie jest drobiazg. To może znaczyć, że bardziej trzyma Cię przywiązanie niż wiara w wspólny kierunek."),
      h2("Kiedy bardziej czekasz, niż żyjesz"),
      p("Czekasz, aż ktoś dojrzeje, nazwie relację, przestanie uciekać, wreszcie wybierze, wreszcie zrozumie. Po czasie relacja staje się nie miejscem życia, tylko poczekalnią."),
      p("I to jest jedna z najuczciwszych informacji: ile Twojego życia idzie w czekanie."),
      h2("Co byłoby dowodem zmiany"),
      p("Nie wystarczy, że będziecie mieć dobry tydzień. Dowodem byłoby zachowanie, które powtarza się także wtedy, kiedy nie ma presji, kryzysu ani strachu przed utratą."),
      micro("Jeśli trudno Ci odróżnić nadzieję od kierunku, analiza pomoże zobaczyć, co naprawdę dzieje się między Wami."),
      h2("Brak przyszłości często nie krzyczy"),
      p("Czasem nie ma zdrady, wielkiej awantury ani jednego zdania, które wszystko kończy. Jest raczej powolne osuwanie się w bycie obok siebie. Rozmowy są krótsze, plany bardziej mgliste, a Ty coraz częściej łapiesz się na tym, że nie budujesz przyszłości, tylko próbujesz utrzymać teraźniejszość."),
      p("To bywa trudniejsze do uznania niż dramatyczny koniec, bo zawsze można powiedzieć: przecież nic takiego się nie stało. Tyle że czasem właśnie to jest informacja: nic się nie dzieje, nic się nie przesuwa, nic nie prowadzi dalej."),
      h2("Najuczciwszy test"),
      p("Zadaj sobie pytanie, czy chcesz tej relacji takiej, jaka jest, a nie takiej, jaka mogłaby być po serii zmian. Jeżeli odpowiedź brzmi: chcę jej dopiero po tym, jak druga osoba zacznie być inna, to nie oceniasz już relacji. Oceniasz projekt jej naprawy."),
      p("To nie znaczy, że trzeba od razu odchodzić. Znaczy tylko, że warto przestać mylić potencjał z przyszłością."),
    ],
  },
];

const categoryLabels: Record<Article["category"], string> = {
  decyzja: "Decyzja: zostać, wrócić, odpuścić",
  sygnaly: "Sygnały: niejasność, dystans, napięcie",
  status: "Status: bliskość bez nazwy",
  schemat: "Schemat: to wraca kolejny raz",
  rokowania: "Przyszłość: czy to ma kierunek",
  diagnostyka: "Kondycja relacji: co robi z Tobą na co dzień",
};

const articleInsights: Record<string, string[]> = {
  "czy-ten-zwiazek-ma-sens": ["czy patrzysz na kierunek, a nie jeden dobry moment", "co ta relacja robi z Tobą na co dzień"],
  "czy-warto-ratowac-zwiazek": ["czy naprawa dzieje się po obu stronach", "czy walczysz o relację, czy o własną nadzieję"],
  "czy-ona-on-sie-mna-bawi": ["kiedy druga osoba robi krok w Twoją stronę", "czy jesteś wyborem, czy bezpieczną możliwością"],
  "toksyczna-relacja-czy-trudny-moment": ["czy po kryzysie wraca szacunek", "czy zaczynasz chodzić przy kimś na palcach"],
  "czy-warto-dac-druga-szanse": ["czy zmieniło się zachowanie, czy tylko nastrój", "czy wracasz do osoby, czy do ulgi"],
  "relacja-bez-zaangazowania": ["komu służy brak nazwy", "czy bliskość ma też odpowiedzialność"],
  "dlaczego-wracasz-do-tego-samego-partnera": ["czy wracasz do miłości, czy do znanego napięcia", "co naprawdę daje Ci powrót"],
  "czy-moj-zwiazek-jest-zdrowy": ["co dzieje się po konflikcie", "kim jesteś przy tej osobie"],
  "jak-rozpoznac-ze-zwiazek-nie-ma-przyszlosci": ["czy widzisz wspólne dalej", "ile życia idzie w czekanie"],
};

const styles: Record<string, React.CSSProperties> = {
  section: { marginTop: "52px", paddingBottom: "8px" },
  header: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", alignItems: "end", gap: "24px", marginBottom: "24px", paddingBottom: "22px", borderBottom: `1px solid rgba(255,255,255,0.06)` },
  eyebrow: { fontSize: "11px", letterSpacing: "0.16em", color: BRAND.gold, fontWeight: 700, textTransform: "uppercase" },
  title: { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 1.02, letterSpacing: "-0.045em", color: BRAND.text, margin: "10px 0 0", maxWidth: "900px" },
  subtitle: { color: BRAND.muted, lineHeight: 1.75, fontSize: "16px", maxWidth: "760px", margin: "12px 0 0" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" },
  card: { background: BRAND.panel, border: `1px solid ${BRAND.border}`, borderRadius: "18px", padding: "28px", cursor: "pointer", transition: "border-color .2s, background .2s, transform .2s", display: "flex", flexDirection: "column", minHeight: "330px", textAlign: "left" },
  cardHovered: { background: BRAND.panelStrong, borderColor: "rgba(197,160,89,0.42)", transform: "translateY(-2px)" },
  cardMeta: { display: "flex", justifyContent: "space-between", gap: "14px", marginBottom: "22px", alignItems: "center" },
  cardKicker: { fontSize: "10px", letterSpacing: "0.18em", color: BRAND.gold, fontWeight: 700, textTransform: "uppercase", opacity: 0.9 },
  readTime: { fontSize: "12px", color: "rgba(245,241,234,.48)" },
  cardTitle: { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "clamp(24px, 2.2vw, 31px)", fontWeight: 700, color: BRAND.text, lineHeight: 1.08, letterSpacing: "-0.035em", margin: 0 },
  cardLead: { fontSize: "16px", color: "#c8c0b8", lineHeight: 1.72, margin: "16px 0 0" },
  cardInsightBox: { marginTop: "18px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,.07)", display: "grid", gap: "9px" },
  cardInsightLabel: { color: BRAND.goldSoft, fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 800 },
  cardInsightItem: { color: "#d9d1c8", fontSize: "14px", lineHeight: 1.55, display: "grid", gridTemplateColumns: "10px 1fr", gap: "8px" },
  cardArrow: { fontSize: "14px", color: BRAND.goldSoft, marginTop: "auto", paddingTop: "22px", fontWeight: 800 },
  softLink: { alignSelf: "end", width: "auto", minHeight: "auto", background: "transparent", border: `1px solid rgba(197,160,89,.35)`, borderRadius: "999px", color: BRAND.goldSoft, padding: "14px 18px", fontSize: "14px", fontWeight: 800, textAlign: "center", whiteSpace: "nowrap", boxShadow: "none" },
  homeLink: { alignSelf: "end", width: "auto", minHeight: "auto", background: "rgba(255,255,255,.025)", border: `1px solid rgba(255,255,255,.12)`, borderRadius: "999px", color: "#ddd4ca", padding: "13px 17px", fontSize: "13px", fontWeight: 850, letterSpacing: ".04em", textTransform: "uppercase", textAlign: "center", whiteSpace: "nowrap", boxShadow: "none", cursor: "pointer" },
  articleShell: { maxWidth: "1040px", margin: "0 auto" },
  articleWrap: { background: BRAND.panel, border: `1px solid ${BRAND.border}`, borderRadius: "22px", padding: "clamp(24px, 4vw, 56px)", boxShadow: "0 22px 80px rgba(0,0,0,.28)" },
  articleTopActions: { display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: "34px" },
  articleBack: { background: "rgba(197,160,89,.08)", border: `1px solid rgba(197,160,89,.32)`, color: BRAND.goldSoft, fontSize: "13px", letterSpacing: "0.06em", cursor: "pointer", padding: "12px 16px", marginBottom: "34px", borderRadius: "999px", textTransform: "uppercase", fontWeight: 800, display: "inline-flex", width: "auto", minHeight: "auto" },
  articleKickerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "12px" },
  articleTitle: { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "clamp(34px, 4.2vw, 54px)", color: BRAND.text, lineHeight: 1.02, letterSpacing: "-0.045em", margin: "0 0 18px" },
  articleLead: { color: "#ddd4ca", fontSize: "clamp(18px, 2vw, 22px)", lineHeight: 1.65, margin: "0 0 30px", maxWidth: "780px" },
  articleDivider: { width: "72px", height: "2px", background: `linear-gradient(90deg, ${BRAND.gold}, rgba(197,160,89,.12))`, border: 0, margin: "0 0 34px" },
  h2: { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "clamp(24px, 2.2vw, 32px)", lineHeight: 1.12, letterSpacing: "-0.03em", margin: "38px 0 14px", color: BRAND.text },
  para: { fontSize: "18px", lineHeight: 1.86, color: "#c8c0b8", margin: "0 0 20px" },
  quote: { margin: "34px 0", padding: "24px 26px", borderLeft: `2px solid ${BRAND.gold}`, background: "rgba(197,160,89,.055)", color: BRAND.goldSoft, fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "clamp(24px, 2.5vw, 34px)", lineHeight: 1.18, letterSpacing: "-0.03em" },
  microCta: { margin: "34px 0", padding: "24px", border: "1px solid rgba(197,160,89,.18)", borderRadius: "18px", background: "linear-gradient(135deg, rgba(197,160,89,.09), rgba(255,255,255,.02))" },
  microText: { margin: "0 0 16px", color: "#e6ded5", fontSize: "17px", lineHeight: 1.7 },
  finalCta: { marginTop: "48px", padding: "30px", border: "1px solid rgba(197,160,89,.22)", borderRadius: "22px", background: "linear-gradient(135deg, rgba(197,160,89,.12), rgba(255,255,255,.025))" },
  finalTitle: { margin: "0 0 10px", fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "30px", lineHeight: 1.12 },
  finalText: { margin: "0 0 22px", color: "#cec5bc", fontSize: "17px", lineHeight: 1.75 },
  relatedGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", marginTop: "22px" },
  relatedTitle: { margin: "36px 0 0", color: BRAND.muted, fontSize: "13px", textTransform: "uppercase", letterSpacing: ".14em" },
  relatedCard: { background: "rgba(255,255,255,.025)", border: `1px solid ${BRAND.border}`, borderRadius: "14px", padding: "18px", color: BRAND.text, textAlign: "left", cursor: "pointer" },
};

function isArticlesIndexRoute() {
  if (typeof window === "undefined") return false;
  return window.location.pathname.replace(/\/$/, "") === "/artykuly";
}

export function ArticlesSection({
  initialSlug = null,
  onNavigateHome,
  onNavigateArticle,
  onStartAnalysis,
}: {
  initialSlug?: string | null;
  onNavigateHome?: () => void;
  onNavigateArticle?: (slug: string) => void;
  onStartAnalysis: () => void;
}) {
  const [localSlug, setLocalSlug] = useState<string | null>(initialSlug);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [indexRoute, setIndexRoute] = useState(isArticlesIndexRoute());

  useEffect(() => setLocalSlug(initialSlug), [initialSlug]);
  useEffect(() => setIndexRoute(isArticlesIndexRoute()), [initialSlug]);

  const activeSlug = initialSlug || localSlug;
  const openArticle = ARTICLES.find((a) => a.slug === activeSlug);
  const visibleArticles = indexRoute ? ARTICLES : ARTICLES.slice(0, 3);

  const relatedArticles = useMemo(() => {
    if (!openArticle) return [];
    return openArticle.related
      .map((slug) => ARTICLES.find((article) => article.slug === slug))
      .filter(Boolean) as Article[];
  }, [openArticle]);

  const open = (slug: string) => {
    if (onNavigateArticle) onNavigateArticle(slug);
    else setLocalSlug(slug);
  };

  const back = () => {
    if (onNavigateHome) onNavigateHome();
    else setLocalSlug(null);
  };

  const goToHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <section className="articles-section" style={styles.section}>
      <AnimatePresence mode="wait">
        {!activeSlug && (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div style={styles.header}>
              <div>
                <span style={styles.eyebrow}>{indexRoute ? "MAPA SYTUACJI" : "ZANIM WEJDZIESZ W ANALIZĘ"}</span>
                <h2 className="articles-main-title" style={styles.title}>
                  {indexRoute ? "Teksty, które pomagają nazwać to, co dzieje się między wami" : "Najpierw nazwij, co naprawdę się dzieje"}
                </h2>
                <p className="articles-main-subtitle" style={styles.subtitle}>
                  {indexRoute
                    ? "Poradniki do zrozumienia relacji: decyzje, powroty, niejasność, brak zaangażowania, mieszane sygnały i moment, w którym zaczynasz pytać, czy ta historia ma jeszcze kierunek."
                    : "Poradniki, które pomagają nazwać sytuację przed analizą: bez prostych wyroków, bez taniego pocieszania, z naciskiem na to, co realnie powtarza się między dwiema osobami."}
                </p>
              </div>
              <div className="article-header-actions" style={styles.headerActions}>
                {indexRoute && (
                  <button className="article-home-link" style={styles.homeLink} onClick={goToHome}>
                    ← Wróć na stronę główną
                  </button>
                )}
                {!indexRoute && (
                  <button className="article-soft-link" style={styles.softLink} onClick={onNavigateHome}>
                    Zobacz pełną mapę tekstów →
                  </button>
                )}
              </div>
            </div>

            <div className="articles-grid" style={styles.grid}>
              {visibleArticles.map((article) => (
                <button
                  key={article.slug}
                  className="article-card-btn"
                  style={{ ...styles.card, ...(hoveredSlug === article.slug ? styles.cardHovered : {}) }}
                  onClick={() => open(article.slug)}
                  onMouseEnter={() => setHoveredSlug(article.slug)}
                  onMouseLeave={() => setHoveredSlug(null)}
                >
                  <div style={styles.cardMeta}>
                    <span style={styles.cardKicker}>{indexRoute ? categoryLabels[article.category] : article.kicker}</span>
                    <span style={styles.readTime}>{article.readingTime}</span>
                  </div>
                  <h3 className="article-card-title" style={styles.cardTitle}>{article.title}</h3>
                  <p className="article-card-desc" style={styles.cardLead}>{article.cardDescription || article.lead}</p>
                  <div className="article-card-insights" style={styles.cardInsightBox}>
                    <span style={styles.cardInsightLabel}>W środku</span>
                    {(articleInsights[article.slug] || []).slice(0, 2).map((item) => (
                      <span key={item} className="article-card-insight" style={styles.cardInsightItem}><span>•</span><span>{item}</span></span>
                    ))}
                  </div>
                  <div className="article-card-arrow" style={styles.cardArrow}>Przeczytaj tekst →</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {activeSlug && openArticle && (
          <motion.div key="article" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <div style={styles.articleShell}>
              <article style={styles.articleWrap}>
                <div className="article-top-actions" style={styles.articleTopActions}>
                  <button className="article-back" style={styles.articleBack} onClick={back}>← Wróć do listy tekstów</button>
                  <button className="article-home-link" style={styles.homeLink} onClick={goToHome}>Strona główna</button>
                </div>
                <div style={styles.articleKickerRow}>
                  <span style={styles.cardKicker}>{openArticle.kicker}</span>
                  <span style={styles.readTime}>{openArticle.readingTime}</span>
                </div>
                <h1 className="article-page-title" style={styles.articleTitle}>{openArticle.title}</h1>
                <p className="article-page-lead" style={styles.articleLead}>{openArticle.lead}</p>
                <hr style={styles.articleDivider} />

                {openArticle.body.map((block, i) => {
                  if (block.type === "h2") return <h2 key={i} className="article-body-h2" style={styles.h2}>{block.text}</h2>;
                  if (block.type === "quote") return <div key={i} className="article-pullquote" style={styles.quote}>{block.text}</div>;
                  if (block.type === "microCta") {
                    return (
                      <div key={i} className="article-micro-cta" style={styles.microCta}>
                        <p style={styles.microText}>{block.text}</p>
                        <button className="ctms-btn ctms-btn-ghost article-micro-btn" onClick={onStartAnalysis}>{block.button || "Sprawdź swoją relację"}</button>
                      </div>
                    );
                  }
                  return <p key={i} className="article-body-p" style={styles.para}>{block.text}</p>;
                })}

                <div className="article-final-cta" style={styles.finalCta}>
                  <h2 className="article-final-title" style={styles.finalTitle}>Nie musisz rozstrzygać tego samą teorią.</h2>
                  <p className="article-final-text" style={styles.finalText}>{openArticle.ctaText} Jeśli chcesz spojrzeć na swoją sytuację spokojniej i konkretniej, możesz zrobić prywatną analizę relacji.</p>
                  <button className="ctms-btn ctms-btn-primary article-cta-btn" onClick={onStartAnalysis}>{openArticle.ctaButton}</button>
                </div>

                {relatedArticles.length > 0 && (
                  <div>
                    <p style={styles.relatedTitle}>Powiązane teksty</p>
                    <div className="article-related-grid" style={styles.relatedGrid}>
                      {relatedArticles.map((article) => (
                        <button key={article.slug} className="article-related-card" style={styles.relatedCard} onClick={() => open(article.slug)}>
                          <span style={styles.cardKicker}>{article.kicker}</span>
                          <h3 className="article-related-title" style={{ ...styles.cardTitle, fontSize: "20px", marginTop: "10px" }}>{article.title}</h3>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
