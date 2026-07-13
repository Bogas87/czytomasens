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
  category: "decyzja" | "sygnaly" | "status" | "wzorzec" | "rokowania" | "diagnostyka";
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
    seoDescription: "Zastanawiasz się, czy to jeszcze ma sens? Sprawdź, jak odróżnić chwilowy kryzys od relacji, która od dawna nie ma kierunku.",
    lead: "Nie szukasz odpowiedzi dlatego, że jej nie masz. Często szukasz jej dlatego, że ją masz i boisz się dopuścić ją do siebie.",
    readingTime: "4 min czytania",
    cardDescription: "Sens związku rzadko rozstrzyga jedno zdarzenie. Sprawdź, jak odróżnić chwilowy kryzys od relacji bez kierunku.",
    highlight: "Nie szukaj jednego dowodu. Patrz na kierunek.",
    ctaText: "Ten tekst może pomóc nazwać kilka mechanizmów, ale nie zna waszej historii. Nie wie, kto ile daje, co się powtarza, co zostało już powiedziane, a co tylko odkładane.",
    ctaButton: "Sprawdź, czy ta relacja ma sens",
    related: ["czy-warto-ratowac-zwiazek", "toksyczna-relacja-czy-trudny-moment", "czy-ona-on-sie-mna-bawi"],
    body: [
      h2("Szukasz jednego dowodu, a to nie tak działa"),
      p("Kiedy zadajesz sobie pytanie, czy to jeszcze ma sens, naturalnie szukasz czegoś konkretnego. Jednej rozmowy, jednego zachowania, które rozstrzygnie sprawę raz na zawsze. Tylko że sens związku prawie nigdy nie rozstrzyga się w jednym momencie."),
      p("Składa się z dziesiątek drobnych rzeczy, które osobno wyglądają na nic, a razem pokazują, w którą stronę to wszystko zmierza. Im dłużej szukasz jednego dowodu, tym łatwiej przegapić pytanie ważniejsze: czy to, co się dzieje, jest wyjątkiem, czy już normą."),
      q("Nie szukaj jednego dowodu. Patrz na kierunek."),
      h2("Kiedy relacja więcej zabiera, niż oddaje"),
      p("W zdrowej relacji konflikt też się zdarza. Różnica polega na tym, co dzieje się później. Czy jest naprawa, ciepło, próba zrozumienia, czy tylko kolejne napięcie, które zostaje między wami jak niezapłacony rachunek."),
      p("Jeśli częściej czujesz się zmęczony niż spokojny po czasie spędzonym razem, jeśli więcej w tym napięcia niż naprawy, to nie musi od razu oznaczać końca. Ale jeśli taki układ powtarza się miesiącami, warto przestać tłumaczyć go przypadkiem, pracą, zmęczeniem czy złym tygodniem."),
      h2("Miłość nie zawsze wystarcza"),
      p("Jest coś, co łatwo pominąć, kiedy próbujesz ocenić, czy ta relacja ma przyszłość. To, czy wasze potrzeby da się w ogóle pogodzić. Nie chodzi o to, czy oboje lubicie góry, czy morze. Chodzi o rzeczy głębsze: ile bliskości potrzebujesz, ile przestrzeni dla siebie, jak rozumiesz zaangażowanie."),
      p("Można kogoś bardzo mocno kochać i jednocześnie chcieć od związku czegoś zupełnie innego. To nie jest niczyja wina. To po prostu różnica, której samo uczucie nie naprawi."),
      h2("Spróbuj zobaczyć was za rok"),
      p("Wyobraź sobie tę relację za rok, za pięć lat. Nie pytaj tylko, czy chcesz, żeby trwała. Zapytaj, czy w ogóle potrafisz zobaczyć ten obraz wyraźnie, czy zatrzymujesz się na czymś mglistym, bez szczegółów."),
      p("Ludzie, którzy są w relacjach mających kierunek, zwykle potrafią opisać tę przyszłość, nawet jeśli nie znają wszystkich detali. Jeśli na myśl o przyszłości czujesz raczej pustkę albo niepokój niż ciekawość, warto to potraktować poważnie."),
      micro("Masz w głowie konkretną osobę? Wtedy nie chodzi już o teorię, tylko o to, co naprawdę powtarza się między wami."),
      h2("Czasem już wiesz, tylko boisz się to uznać"),
      p("Pytanie „czy to ma sens” często zadaje osoba, która już zna odpowiedź, tylko potrzebuje kogoś z zewnątrz, żeby pozwolić sobie ją uznać. Nie dlatego, że jest niezdecydowana. Dlatego, że uznanie tej odpowiedzi oznacza konsekwencje, na które nie czuje się gotowa."),
      p("W zwykłym kryzysie szukasz sposobu, żeby coś naprawić. Kiedy relacja jest już bez przyszłości, często szukasz raczej zgody na to, żeby przestać próbować."),
      h2("Dlaczego ogólne listy nie wystarczają"),
      p("Możesz przeczytać dziesięć tekstów o tym, czym jest zdrowy związek, i wciąż nie wiedzieć, co to znaczy dla ciebie, z tą konkretną osobą, w tej konkretnej historii."),
      p("Odpowiedź nie leży w teorii o związkach. Leży w szczegółach waszej relacji, które tylko ty znasz, choć czasem trudno ci je zobaczyć z odpowiedniego dystansu."),
    ],
  },
  {
    slug: "czy-warto-ratowac-zwiazek",
    kicker: "DECYZJA",
    category: "decyzja",
    title: "Czy warto ratować związek?",
    seoTitle: "Czy warto ratować związek? Walczyć czy odpuścić | CzyToMaSens",
    seoDescription: "Nie każdy kryzys oznacza koniec. Ale nie każda walka ma sens. Sprawdź, czy ratujesz relację, czy tylko boisz się ją stracić.",
    lead: "Nie każda relacja kończy się dlatego, że zabrakło uczuć. Czasem kończy się dlatego, że jedna osoba zbyt długo próbuje naprawiać coś, czego druga nawet nie chce nazwać problemem.",
    readingTime: "6 min czytania",
    cardDescription: "Nie każdy kryzys oznacza koniec. Ale nie każda walka ma sens. Sprawdź, czy ratujesz relację, czy tylko boisz się ją stracić.",
    highlight: "Związku nie ratuje samo uczucie. Ratuje go gotowość dwóch osób do zobaczenia prawdy o tym, co się powtarza.",
    ctaText: "Ten tekst może pomóc nazwać mechanizm, ale nie zna waszej historii. Nie wie, kto inicjuje kontakt, kto naprawia, kto unika i co wraca po każdej rozmowie.",
    ctaButton: "Sprawdź, czy warto jeszcze walczyć",
    related: ["czy-ten-zwiazek-ma-sens", "toksyczna-relacja-czy-trudny-moment", "relacja-bez-zaangazowania"],
    body: [
      h2("Uczucia nie zawsze wystarczają"),
      p("Można kogoś kochać i jednocześnie być w relacji, która coraz bardziej męczy. Można tęsknić, martwić się, czekać na wiadomość, analizować każde słowo i nadal nie mieć poczucia bezpieczeństwa."),
      p("To, że między wami nadal są emocje, nie oznacza jeszcze, że związek działa. Czasem uczucia są prawdziwe, ale sposób, w jaki ta relacja funkcjonuje, zabiera spokój, zaufanie i poczucie własnej wartości."),
      p("Wtedy nie wystarczy zapytać, czy on/ona jest dla ciebie ważny/ważna. Trzeba zapytać, co ta relacja robi z tobą na co dzień."),
      q("Związku nie ratuje samo uczucie. Ratuje go gotowość dwóch osób do zobaczenia prawdy o tym, co się powtarza."),
      h2("Problem czy wzorzec"),
      p("Jednorazowy problem można nazwać, omówić i stopniowo zmieniać. Wzorzec wraca nawet wtedy, gdy oboje wiecie, że niszczy relację."),
      p("Problemem może być kłótnia, zmęczenie, trudny okres, brak czasu albo napięcie po konkretnej sytuacji. Wzorzec zaczyna się wtedy, gdy po każdej rozmowie przez chwilę jest lepiej, a potem wszystko wraca w to samo miejsce."),
      p("Te same reakcje. Te same uniki. Ta sama cisza. Ta sama niepewność. Ten sam moment, w którym znowu zaczynasz tłumaczyć sobie zachowanie drugiej osoby."),
      p("Jeśli po każdej rozmowie czujesz ulgę tylko na chwilę, a potem znowu zaczynasz analizować, czekać i uspokajać się pojedynczym gestem, to być może nie patrzysz już na kryzys. Być może patrzysz na mechanizm."),
      h2("Kiedy warto jeszcze próbować"),
      p("Warto próbować, jeśli problem jest nazwany, a nie zamiatany pod dywan. Jeśli po kłótni nie ma tylko ciszy, uciekania i udawania, że nic się nie stało."),
      p("Warto próbować, jeśli on/ona potrafi wrócić do rozmowy, przyjąć część odpowiedzialności i nie robi z twoich emocji przesady. Nie chodzi o perfekcję. Chodzi o realny ruch w stronę kontaktu."),
      p("Kryzys nie musi oznaczać końca. Każda relacja przechodzi przez napięcia, zmęczenie, trudniejsze okresy, brak cierpliwości i gorszy kontakt. Ale jest różnica między trudnym momentem a powtarzającym się schematem."),
      p("Trudny moment można przejść. Schemat wraca, jeśli nikt go naprawdę nie zmienia."),
      micro("Jeśli nie wiesz, czy to jeszcze kryzys, czy już powtarzalny układ, sama lista objawów może nie wystarczyć. Liczy się to, co wraca między wami mimo rozmów."),
      h2("Kiedy walka staje się samotna"),
      p("Najbardziej męczące są relacje, w których niby jesteście razem, ale ciężar naprawy spada głównie na ciebie."),
      p("To ty zaczynasz rozmowy. Ty tłumaczysz, co boli. Ty szukasz rozwiązań. Ty próbujesz zrozumieć jego/jej zachowanie. Ty czekasz, aż coś się zmieni."),
      p("A druga strona raz daje nadzieję, raz dystans. Raz mówi, że jej zależy, a potem znowu zachowuje się tak samo."),
      p("Wtedy problemem nie jest tylko kryzys. Problemem jest brak wspólnego kierunku. Bo związku nie da się ratować za dwie osoby."),
      p("Możesz dać przestrzeń, możesz mówić jasno, możesz próbować spokojniej, dojrzalej, mądrzej. Ale nie możesz za niego/za nią podjąć decyzji, że ta relacja naprawdę ma być ważna."),
      h2("Asymetria, która trzyma najmocniej"),
      p("Najbardziej mylące są relacje, w których druga osoba nie znika całkowicie. Daje tyle, żebyś nie odszedł/odeszła, ale za mało, żebyś poczuł/poczuła spokój."),
      p("Nie jesteś całkiem odrzucony/odrzucona, ale też nie jesteś naprawdę wybrany/wybrana. I właśnie ta niejednoznaczność potrafi trzymać najmocniej."),
      p("Bo gdyby on/ona całkowicie odszedł/odeszła, sytuacja byłaby bolesna, ale jasna. A kiedy raz jest bliskość, raz dystans, raz ciepło, raz chłód, zaczynasz czekać na powrót tej lepszej wersji relacji."),
      p("Nie żyjesz tym, co jest stałe. Żyjesz tym, co pojawia się na chwilę."),
      h2("Zmiana czy chwilowe uspokojenie"),
      p("Po mocnej rozmowie często przychodzi poprawa. Jest więcej ciepła, wiadomości, bliskości, obietnic. Przez chwilę możesz mieć wrażenie, że coś wreszcie ruszyło."),
      p("Ale warto patrzeć nie na pierwszy tydzień po kryzysie, tylko na to, co dzieje się później. Czy on/ona rzeczywiście zmienia zachowanie? Czy zaczyna rozmawiać inaczej? Czy bierze odpowiedzialność bez ataku i obrony? Czy wraca do starych reakcji, gdy napięcie mija?"),
      q("Jeśli po każdej rozmowie jest lepiej tylko na chwilę, to możliwe, że nie zmienia się relacja. Zmienia się tylko poziom twojej nadziei."),
      p("Właśnie dlatego nie wystarczy oceniać relacji po jednym dobrym tygodniu albo jednej trudnej rozmowie. Ważniejsze jest to, czy zmienia się powtarzalny mechanizm."),
      p("Analiza relacji pomaga zobaczyć, czy poprawa jest realną zmianą, czy tylko kolejnym momentem ulgi przed powrotem tego samego napięcia."),
      h2("Co ta relacja robi z tobą"),
      p("Czasem najlepszym pytaniem nie jest: czy on/ona mnie kocha. Lepsze pytanie brzmi: kim ja się staję przy tej osobie."),
      p("Czy jesteś spokojniejszy/spokojniejsza, bardziej sobą, bardziej stabilny/stabilna? Czy coraz częściej jesteś napięty/napięta, podejrzliwy/podejrzliwa, zależny/zależna od jednej wiadomości, jednego gestu albo jednego wieczoru, który znowu daje nadzieję?"),
      p("Relacja może mieć dużo emocji i jednocześnie mało bezpieczeństwa. Może mieć chemię, ale nie mieć kierunku. Może mieć dobre momenty, ale zabierać spokój na co dzień."),
      h2("Kiedy odpuszczenie nie jest porażką"),
      p("Odpuszczenie boli szczególnie wtedy, gdy nadal coś czujesz. W głowie pojawia się pytanie, czy może jeszcze za wcześnie, czy może trzeba było spróbować inaczej, powiedzieć coś spokojniej, dać więcej czasu."),
      p("Ale czasem odpuszczenie nie oznacza, że nie zależało ci wystarczająco. Czasem oznacza, że przestajesz ratować coś, co działa tylko wtedy, gdy ty rezygnujesz z siebie."),
      p("Jeśli relacja zabiera ci spokój, rozregulowuje emocje, wciąga w ciągłe analizowanie i sprawia, że zaczynasz prosić o podstawowe rzeczy, warto spojrzeć na całość. Nie na jeden dobry wieczór. Nie na jedną wiadomość. Nie na jedną obietnicę. Na cały kierunek."),
      h2("Sprawdź, czy ratujesz relację, czy własną nadzieję"),
      p("Najtrudniejsze jest to, że czasem nie walczysz już o realny związek. Walczysz o wersję tej relacji, która istnieje głównie w twojej głowie."),
      p("O to, jak było na początku. O to, kim on/ona potrafi być w dobrych momentach. O to, co obiecywał/obiecywała. O to, co mogłoby być, gdyby wreszcie coś się zmieniło."),
      p("Ale relację ocenia się nie po potencjale, tylko po tym, jak wygląda naprawdę. Tu i teraz."),
      p("Jeśli ciągle musisz tłumaczyć sobie czyjeś zachowanie, szukać wyjątków, czekać na powrót ciepła i uspokajać się jednym dobrym gestem, to być może problem nie leży w braku cierpliwości."),
      p("Być może problem leży w tym, że ta relacja daje ci za mało stabilności, a za dużo napięcia."),
    ],
  },
  {
    slug: "czy-ona-on-sie-mna-bawi",
    kicker: "SYGNAŁY",
    category: "sygnaly",
    title: "Czy on/ona się Tobą bawi?",
    seoTitle: "Czy ona/on się mną bawi? Mieszane sygnały | CzyToMaSens",
    seoDescription: "Raz ciepło, raz dystans, raz jesteś ważny, raz nie wiesz, na czym stoisz. Sprawdź, co naprawdę mówią mieszane sygnały w relacji.",
    lead: "Najpierw pytasz, czy tej osobie zależy. Potem, czy to jest poważne. A w końcu zostaje pytanie, czy jesteś priorytetem, czy opcją w rezerwie.",
    readingTime: "4 min czytania",
    cardDescription: "Mieszane sygnały, ciepło na zmianę z dystansem. Sprawdź, czy to realne zaangażowanie, czy bycie opcją w rezerwie.",
    highlight: "Ktoś może dawać wystarczająco dużo, żebyś został, i za mało, żebyś poczuł się bezpiecznie.",
    ctaText: "Ten tekst może pomóc nazwać mechanizm mieszanych sygnałów, ale nie zna waszej historii. Nie wie, kto ile daje i co powtarza się miesiącami.",
    ctaButton: "Sprawdź, czy jesteś priorytetem, czy opcją",
    related: ["relacja-bez-zaangazowania", "czy-ten-zwiazek-ma-sens", "jednostronna-relacja"],
    body: [
      h2("Skąd w ogóle bierze się to pytanie"),
      p("To pytanie rzadko bierze się znikąd. Bierze się z czegoś konkretnego, czego trudno nazwać, bo nie ma w tym jednego wyraźnego momentu winy. Nikt nie powiedział wprost, że nie traktuje cię poważnie. Po prostu coś w rytmie tej relacji nie pasuje do tego, jak wygląda zaangażowanie."),
      p("Brak zaangażowania rzadko ogłasza się wprost. Zwykle widać go w drobiazgach, które osobno łatwo wytłumaczyć, a razem zaczynają układać się w wzór."),
      h2("Kto ryzykuje, a kto się chroni"),
      p("Zwróć uwagę, kto w tej relacji bierze na siebie ryzyko. Nie chodzi tylko o to, kto pisze pierwszy. Chodzi o to, kto mówi o uczuciach, kto planuje przyszłość, kto przedstawia drugą osobę znajomym, kto otwiera się na to, co ważne."),
      p("Jeśli to ty regularnie to robisz, a druga strona trzyma bezpieczny dystans, nie odrzucając cię, ale też nie wychodząc naprzeciw, to jest wzorzec relacji bez jasności."),
      q("Ktoś może dawać wystarczająco dużo, żebyś został, i za mało, żebyś poczuł się bezpiecznie."),
      h2("Dlaczego niepewność trzyma mocniej niż stałość"),
      p("Mieszane sygnały bywają tak trudne, bo bliskość pojawia się nieregularnie. Raz jest, raz jej nie ma. I właśnie ta niepewność sprawia, że telefon sprawdzasz częściej, nie rzadziej."),
      p("Paradoksalnie osoba, która daje ci najmniej stabilności, potrafi wzbudzić w tobie najsilniejszą potrzebę jej uwagi. Nie dlatego, że naprawdę jest dla ciebie najlepsza. Dlatego, że nigdy nie wiesz, kiedy znowu poczujesz się ważny."),
      h2("Czy to się gdzieś zmierza"),
      p("Zobacz, jak to wygląda w czasie. Czy ta osoba angażuje się bardziej, mówi więcej o przyszłości? Czy rok temu i teraz wygląda dokładnie tak samo, mimo że ty włożyłeś w to znacznie więcej?"),
      p("Relacje, które mają przyszłość, zwykle gdzieś idą. Nawet powoli. Kiedy zaangażowanie stoi w miejscu, a kontakt jest cały czas podtrzymywany, to często znak, że ktoś trzyma cię w określonej roli."),
      micro("Mieszane sygnały najmocniej działają wtedy, kiedy próbujesz sam dopowiedzieć brakujące fragmenty."),
      h2("Co się dzieje, kiedy znikasz na chwilę"),
      p("Co się dzieje, kiedy przez jakiś czas się nie odzywasz, jesteś mniej dostępny? Osoba, której zależy, zwykle to zauważa. Osoba, dla której jesteś opcją, często po prostu kieruje uwagę gdzie indziej."),
      p("To nie znaczy, że nic do ciebie nie czuje. Pokazuje raczej, jak wysoko jesteś w jej priorytetach, kiedy nic jej do tego nie zmusza."),
      h2("Pytanie, które naprawdę chcesz zadać"),
      p("Pytanie, czy ktoś się tobą bawi, bywa sposobem na odwlekanie trudniejszego pytania: dlaczego zostaję, skoro chyba już znam odpowiedź."),
      p("Odpowiedź nie leży w jednym zachowaniu. Leży w sumie tego, co się powtarza: kto inwestuje, kto reaguje na twoją nieobecność, kto mówi o przyszłości, a kto konsekwentnie ją omija."),
    ],
  },
  {
    slug: "toksyczna-relacja-czy-trudny-moment",
    kicker: "ROZRÓŻNIENIE",
    category: "sygnaly",
    title: "Toksyczna relacja czy trudny moment?",
    seoTitle: "Toksyczna relacja czy trudny moment? | CzyToMaSens",
    seoDescription: "Nie wiesz, czy przechodzicie kryzys, czy relacja jest destrukcyjna? Sprawdź, jak to odróżnić, zanim ocenisz wszystko na emocjach.",
    lead: "Nie każde napięcie oznacza toksyczną relację. Ale nie każdy kryzys jest tylko trudnym okresem, który sam minie.",
    readingTime: "4 min czytania",
    cardDescription: "Nie każdy trudny moment to toksyczna relacja. Sprawdź, jak to odróżnić, zanim ocenisz wszystko na emocjach.",
    highlight: "Nie każda trudność jest toksyczna. Ale nie każdy kryzys jest tylko chwilowy.",
    ctaText: "Ten tekst może pomóc nazwać różnicę między kryzysem a destrukcją, ale nie zna waszej historii. Nie wie, co wraca niezależnie od okoliczności.",
    ctaButton: "Sprawdź, czy to kryzys, czy coś trwalszego",
    related: ["czy-ten-zwiazek-ma-sens", "czy-warto-dac-druga-szanse", "jednostronna-relacja"],
    body: [
      h2("Trudność i destrukcja to nie to samo"),
      p("Trudny moment w związku zwykle ma swoje źródło na zewnątrz: stres finansowy, choroba, żałoba, ciężki okres w pracy. I ma tendencję do mijania, kiedy te okoliczności się zmieniają."),
      p("Destrukcyjna relacja działa inaczej. Nie zależy od tego, co dzieje się dookoła, bo tkwi w samym sposobie, w jaki ta osoba traktuje bliskość, konflikt i władzę nad drugim człowiekiem."),
      q("Nie każda trudność jest toksyczna. Ale nie każdy kryzys jest tylko chwilowy."),
      h2("Co dzieje się w spokojniejsze dni"),
      p("Sprawdź, jak wygląda wasza relacja poza trudnym momentem. Czy szacunek wraca, kiedy presja mija, czy raczej jest go brak na co dzień, niezależnie od okoliczności?"),
      p("Ludzie pod wpływem stresu bywają gorsi dla siebie nawzajem. Ale jeśli nawet spokojne dni są pełne napięcia albo kontroli, to już inna informacja."),
      h2("Czy ten ciężar niesiecie razem"),
      p("Trudny moment to coś, co przechodzicie razem, nawet jeśli każde z was na swój sposób. Destrukcyjna dynamika zwykle ma wyraźny kierunek: jedna osoba decyduje, druga się dostosowuje, jedna karze milczeniem albo wybuchami, druga przeprasza, choć nie wie za co."),
      p("Jeśli stale się tłumaczysz, stale przepraszasz i stale zastanawiasz się, co zrobiłeś nie tak, to nie jest już zwykła trudność. To dynamika władzy."),
      micro("Najtrudniej ocenić relację wtedy, kiedy jesteś w środku. Analiza pomaga oddzielić chwilowy kryzys od wzorca, który wraca niezależnie od okoliczności."),
      h2("Dlaczego trudno to dostrzec od środka"),
      p("Im dłużej jesteś w czymś destrukcyjnym, tym bardziej zmienia się twoje poczucie normy. To, co na początku uznałbyś za nie do przyjęcia, po roku zaczyna wyglądać jak coś, co po prostu trzeba przetrzymać."),
      h2("Lepsze pytanie niż „czy to toksyczne”"),
      p("Czasem bardziej pomaga pytanie: czy to, co się dzieje, ma datę końcową związaną z czymś konkretnym, czy trwa od zawsze, niezależnie od tego, co aktualnie dzieje się w waszym życiu."),
      p("Rozróżnienie między trudnym momentem a destrukcyjną relacją nie jest kwestią znalezienia etykiety w internecie. To kwestia spojrzenia na to, co powtarza się niezależnie od okoliczności."),
    ],
  },
  {
    slug: "czy-warto-dac-druga-szanse",
    kicker: "DECYZJA",
    category: "decyzja",
    title: "Czy warto dać drugą szansę?",
    seoTitle: "Czy warto dać drugą szansę? Tęsknota czy zmiana | CzyToMaSens",
    seoDescription: "Zastanawiasz się, czy wracać do byłej lub byłego? Sprawdź, jak odróżnić prawdziwą zmianę od chwilowej tęsknoty.",
    lead: "Druga szansa brzmi jak akt dobrej woli. W praktyce miesza się w niej nadzieja, strach przed żalem i zmęczenie samym pytaniem.",
    readingTime: "4 min czytania",
    cardDescription: "Tęsknota nie zawsze oznacza, że warto wracać. Sprawdź różnicę między prawdziwą zmianą a chwilową ulgą.",
    highlight: "Tęsknota mówi, że rozłąka bolała. Nie mówi jeszcze, czy coś naprawdę się zmieniło.",
    ctaText: "Ten tekst może pomóc nazwać kilka mechanizmów, ale nie zna waszej historii. Nie wie, co naprawdę się zmieniło, a co zostało tylko powiedziane.",
    ctaButton: "Sprawdź, czy ten powrót ma sens",
    related: ["czy-ten-zwiazek-ma-sens", "toksyczna-relacja-czy-trudny-moment", "jak-rozpoznac-ze-zwiazek-nie-ma-przyszlosci"],
    body: [
      h2("Co musi się zmienić, żeby to miało sens"),
      p("Druga szansa ma sens wtedy, kiedy zmienia się coś konkretnego, nie kiedy zmienia się tylko to, jak mocno teraz czujecie. Para, która się rozstała, a potem wraca do siebie zalana ulgą, łatwo myli tę ulgę z dowodem, że teraz będzie inaczej."),
      p("Tylko że fala emocji po rozstaniu mówi przede wszystkim o tym, jak bardzo bolała rozłąka. Nie mówi nic o tym, czy to, co doprowadziło do rozstania, zostało nazwane i zmienione."),
      q("Tęsknota mówi, że rozłąka bolała. Nie mówi jeszcze, czy coś naprawdę się zmieniło."),
      h2("Dlaczego ten sam temat wraca"),
      p("Jeśli wrócicie do siebie, a sprawa, przez którą się rozstaliście, zostaje nienazwana, ten sam wzorzec prędzej czy później się powtórzy. Problem nie zniknął. Po prostu na chwilę zniknął z pola widzenia."),
      h2("Słowa kontra to, co realnie się dzieje"),
      p("„Będę inny”, „to się więcej nie powtórzy”, „teraz to rozumiem” brzmi tak samo, niezależnie od tego, czy stoi za tym realna praca, czy tylko strach przed utratą."),
      p("Zmiana w zachowaniu da się sprawdzić. Czy ta osoba zrobiła coś konkretnego, podjęła decyzję, która ją coś kosztowała, czy po prostu poczekała, aż emocje opadną?"),
      micro("Przed powrotem warto sprawdzić nie to, co zostało obiecane, tylko to, co faktycznie się zmieniło."),
      h2("Tęsknisz za osobą czy za początkiem"),
      p("Czasem nie tęsknimy za człowiekiem, tylko za wersją relacji sprzed wszystkich problemów. Ta wersja może już nie istnieć, niezależnie od tego, czy wrócicie do siebie."),
      h2("Co czujesz, kiedy myślisz o tym spokojnie"),
      p("Zwróć uwagę, co czujesz na myśl o powrocie nie wieczorem, kiedy jest ci samotnie, tylko w spokojniejszym momencie w ciągu dnia. Ulgę czy niepokój. Ciekawość czy zmęczenie."),
      p("Druga szansa nie jest czymś, co musisz dać, żeby udowodnić sobie, że się starałeś. To decyzja, którą warto oprzeć na konkretnych dowodach zmiany."),
    ],
  },
  {
    slug: "relacja-bez-zaangazowania",
    kicker: "STATUS",
    category: "status",
    title: "Relacja bez zaangażowania",
    seoTitle: "Relacja bez zaangażowania. Czym jest situationship | CzyToMaSens",
    seoDescription: "Nie wiecie, kim dla siebie jesteście? Sprawdź, dlaczego brak statusu relacji kosztuje więcej, niż się wydaje, i komu ta niejasność służy.",
    lead: "To nie jest związek, ale to też nie jest nic. I właśnie ten brak nazwy zaczyna z czasem ważyć więcej niż sama bliskość.",
    readingTime: "4 min czytania",
    cardDescription: "Bliskość bez nazwy ma swoją cenę. Sprawdź, dlaczego brak statusu relacji kosztuje więcej, niż się wydaje.",
    highlight: "Niejasność nie jest neutralna, jeśli jedna osoba płaci za nią spokojem.",
    ctaText: "Ten tekst może pomóc nazwać mechanizm niejasności, ale nie zna waszej historii. Nie wie, kto unika czego, ani co już zostało powiedziane wprost.",
    ctaButton: "Sprawdź, czym naprawdę jest ta relacja",
    related: ["czy-ona-on-sie-mna-bawi", "czy-ten-zwiazek-ma-sens", "dlaczego-wracasz-do-tego-samego-partnera"],
    body: [
      h2("Brak nazwy, który mimo wszystko coś kosztuje"),
      p("To, co po angielsku nazywa się situationship, w praktyce wygląda tak: dwie osoby funkcjonują blisko siebie bez wspólnie ustalonych ram tego, czym ta bliskość właściwie jest."),
      p("Możecie świetnie się ze sobą czuć, kiedy jesteście razem, a mimo to gdzieś w tle towarzyszy ci napięcie, bo nie wiesz, w jakiej kategorii to wszystko umieścić."),
      q("Niejasność nie jest neutralna, jeśli jedna osoba płaci za nią spokojem."),
      h2("Dlaczego niejasność tak męczy"),
      p("Status relacji to nie jest formalność do odhaczenia, tylko informacja, która pozwala ci zdecydować, ile w to wkładać, jak bardzo się otwierać i czy planować coś wspólnie na dłużej."),
      p("Brak tej informacji to stan ciągłego czekania na coś, co nigdy nie nadchodzi. Nawet jeśli na zewnątrz nic dramatycznego się nie dzieje."),
      h2("Komu wygodnie jest bez nazwy"),
      p("Zwróć uwagę, kto na braku definicji zyskuje. Jeśli nazwiecie to związkiem, pojawiają się oczekiwania i odpowiedzialność. Brak nazwy daje dostęp do bliskości bez tego ciężaru."),
      p("To nie zawsze jest świadoma gra. Czasem to po prostu wygoda, której nikt nie chce nazwać wprost."),
      micro("Jeśli nie wiesz, kim dla siebie jesteście, sama bliskość może przestać wystarczać."),
      h2("Co pokazuje próba nazwania tego wprost"),
      p("Sprawdź, jak reaguje druga strona, kiedy próbujesz tę niejasność nazwać. Nie chodzi o to, czy od razu zgadza się na to, czego chcesz. Chodzi o to, czy w ogóle jest gotowa usiąść do rozmowy bez uciekania w żarty, zmianę tematu albo komunikat, że robisz z tego problem."),
      h2("A może to ty boisz się odpowiedzi"),
      p("Niejasność ma przewrotną cechę: pozwala podtrzymywać nadzieję. Jasna odpowiedź, nawet jeśli brzmi „nie”, zamyka temat. Czasem zostajemy w niejasności nie dlatego, że druga strona nas tam trzyma, tylko dlatego, że sami nie jesteśmy gotowi usłyszeć odpowiedzi."),
      p("Problemem nie jest brak etykiety. Problemem jest sytuacja, w której jedna strona chce więcej, druga unika rozmowy, a niejasność staje się sposobem na utrzymanie stanu, który komuś nie służy."),
    ],
  },
  {
    slug: "dlaczego-wracasz-do-tego-samego-partnera",
    kicker: "WZORZEC",
    category: "wzorzec",
    title: "Dlaczego wracasz do tego samego partnera",
    seoTitle: "Dlaczego wracasz do tego samego partnera | CzyToMaSens",
    seoDescription: "Nie chodzi tylko o miłość. Sprawdź, dlaczego wracasz do znanego napięcia, nawet jeśli wiesz, że ten schemat ci nie służy.",
    lead: "Nie chodzi o miłość. Albo przynajmniej nie tylko o nią.",
    readingTime: "5 min czytania",
    cardDescription: "Wracasz nie zawsze do człowieka. Czasem wracasz do napięcia, które znasz aż za dobrze.",
    highlight: "Znajome nie zawsze znaczy dobre. Czasem znaczy tylko przewidywalne.",
    ctaText: "Jeśli rozumiesz mechanizm, ale wciąż nie rozumiesz, dlaczego wracasz do tej konkretnej osoby, warto spojrzeć na fakty, a nie na samą teorię.",
    ctaButton: "Sprawdź swój schemat",
    related: ["czy-warto-dac-druga-szanse", "relacja-bez-zaangazowania", "czy-ona-on-sie-mna-bawi"],
    body: [
      p("Większość ludzi, którzy wracają do tych samych relacji albo wchodzą wciąż w ten sam typ związku z innymi ludźmi, nie robi tego dlatego, że nie rozumie, co się dzieje. Często rozumieją doskonale. Widzą wzorzec, potrafią go nazwać i wracają mimo to."),
      h2("Znajome potrafi udawać bezpieczne"),
      p("Twój układ nerwowy mógł nauczyć się rozpoznawać pewien typ bliskości jako normalny. Niekoniecznie dobry. Normalny w sensie znajomy. Nowa osoba, która oferuje spokój, może wydawać się nudna nie dlatego, że taka jest, ale dlatego, że nie uruchamia znanego napięcia."),
      q("Znajome nie zawsze znaczy dobre. Czasem znaczy tylko przewidywalne."),
      h2("Dlaczego nieregularna bliskość tak wciąga"),
      p("Kiedy bliskość pojawia się nieregularnie, raz jest, raz jej nie ma, mózg zaczyna szukać jej intensywniej. W relacji wygląda to tak: są momenty czułości, potem dystansu, potem znów czułość. I zamiast odejść, zostajesz, bo czekasz na rozwiązanie napięcia."),
      h2("Koszt, którego nie chcesz uznać za stratę"),
      p("Im więcej zainwestowałeś w relację, tym trudniej z niej wyjść. Nie dlatego, że jest dobra. Dlatego, że wyjście oznaczałoby przyznanie, że ta inwestycja nie dała efektu, którego chciałeś."),
      micro("Czasem nie potrzebujesz kolejnej teorii o schematach. Potrzebujesz zobaczyć, jak ten schemat działa w tej jednej relacji."),
      h2("Dlaczego sama wiedza nie wystarcza"),
      p("Wiedza o tym, skąd wzorzec pochodzi, to nie to samo, co zobaczenie, jak działa teraz, z tą osobą, w tej konkretnej konfiguracji."),
      p("To jest inne pytanie. I wymaga innego podejścia."),
    ],
  },
  {
    slug: "czy-moj-zwiazek-jest-zdrowy",
    kicker: "DIAGNOSTYKA",
    category: "diagnostyka",
    title: "Czy mój związek jest zdrowy?",
    seoTitle: "Czy mój związek jest zdrowy? | CzyToMaSens",
    seoDescription: "Zdrowych związków zwykle nie sprawdza się w internecie o drugiej w nocy. Zobacz, na co naprawdę warto spojrzeć.",
    lead: "Zdrowych związków zwykle nie sprawdza się w internecie o drugiej w nocy.",
    readingTime: "5 min czytania",
    cardDescription: "Nie chodzi o to, czy się kłócicie. Chodzi o to, co ta relacja robi z Tobą na co dzień.",
    highlight: "Pytanie nie brzmi tylko: co czujesz do tej osoby. Pytanie brzmi: kim jesteś przy niej.",
    ctaText: "Ten tekst może pomóc nazwać kilka sygnałów, ale nie zobaczy za ciebie waszych konkretnych sytuacji, reakcji i powtarzających się układów.",
    ctaButton: "Sprawdź, co pokazuje ta relacja",
    related: ["toksyczna-relacja-czy-trudny-moment", "czy-ten-zwiazek-ma-sens", "czy-ona-on-sie-mna-bawi"],
    body: [
      p("Samo pytanie jest trudniejsze, niż się wydaje. Wiele osób, które je zadają, gdzieś w środku zna odpowiedź. Trudność polega na tym, że między wiedzą a uznaniem tej wiedzy jest przepaść."),
      h2("Konflikt nie jest problemem sam w sobie"),
      p("Nie chodzi o to, czy w związku są konflikty. Para, która się nie kłóci, czasem jest parą, w której jedno z nich nauczyło się milczeć. Ważniejsze jest to, jak napięcie jest później przetwarzane."),
      h2("Jak jesteś przy tej osobie"),
      p("Przyglądaj się nie tylko temu, co czujesz do partnera. Przyglądaj się temu, jak funkcjonujesz przy nim. Czy mówisz to, co naprawdę myślisz? Czy filtrujesz każde zdanie? Czy po czasie razem czujesz się naładowany, czy opróżniony?"),
      q("Pytanie nie brzmi tylko: co czujesz do tej osoby. Pytanie brzmi: kim jesteś przy niej."),
      h2("Kiedy zaczynasz się kurczyć"),
      p("W niezdrowej relacji jedna osoba często stopniowo się kurczy. Przestaje mówić o pewnych potrzebach, rezygnuje z części siebie, unika tematów, które wcześniej były naturalne."),
      micro("Jeśli ten tekst przypomina ci konkretną sytuację, sama lista objawów może nie wystarczyć. Liczy się wzorzec, który powtarza się u was."),
      h2("Asymetria wysiłku"),
      p("Zwróć uwagę, kto w tej relacji pracuje nad relacją. Kto czyta, szuka, próbuje zrozumieć, przeprasza, wraca do rozmów. Jeśli to tylko ty, to też jest informacja."),
      p("Odpowiedź na pytanie, czy twój związek jest zdrowy, leży w detalach tego, co konkretnie dzieje się między wami."),
    ],
  },
  {
    slug: "jak-rozpoznac-ze-zwiazek-nie-ma-przyszlosci",
    kicker: "ROKOWANIA",
    category: "rokowania",
    title: "Jak rozpoznać, że związek nie ma przyszłości",
    seoTitle: "Jak rozpoznać, że związek nie ma przyszłości | CzyToMaSens",
    seoDescription: "Miłość i przyszłość relacji to nie zawsze to samo. Sprawdź, kiedy relacja traci kierunek mimo silnych uczuć.",
    lead: "Większość ludzi nie kończy złego związku za wcześnie. Kończy go za późno.",
    readingTime: "5 min czytania",
    cardDescription: "Można kochać i jednocześnie widzieć, że relacja nie ma kierunku. To nie jest sprzeczność.",
    highlight: "Uczucie i rokowania to dwie różne rzeczy.",
    ctaText: "Ten tekst może pomóc nazwać sygnały, ale nie zna twojej relacji. Nie wie, czy to chwilowy kryzys, czy coś, co od dawna nie ma kierunku.",
    ctaButton: "Sprawdź kierunek tej relacji",
    related: ["czy-ten-zwiazek-ma-sens", "czy-warto-dac-druga-szanse", "toksyczna-relacja-czy-trudny-moment"],
    body: [
      p("Sygnały, że związek nie ma przyszłości, rzadko pojawiają się jako jeden dramatyczny moment. Częściej są procesem. Powolnym przesunięciem, które widać dopiero wtedy, kiedy porównasz siebie sprzed kilku lat z sobą teraz."),
      h2("Miłość i rokowania to nie to samo"),
      p("Możesz głęboko kochać kogoś i jednocześnie być w relacji, która nie ma przyszłości. To nie jest sprzeczność. To jedna z najczęstszych i najbardziej bolesnych sytuacji."),
      q("Uczucie i rokowania to dwie różne rzeczy."),
      h2("Przyszłość, która ciągle jest mglista"),
      p("Zobacz, co dzieje się, kiedy rozmawiacie o przyszłości. Nie o wakacjach. O tym, gdzie będziecie za trzy lata, co chcecie budować i jak wyobrażacie sobie życie. Jeśli plany są zawsze ogólne i odkładane, to może być informacja."),
      h2("Relacja, w której bardziej czekasz, niż żyjesz"),
      p("Zauważ, czy jesteś bardziej zaangażowany w wyobrażoną wersję tego związku niż w tę, która naprawdę istnieje. Relacja, która istnieje głównie jako projekt naprawy, jest relacją, w której czekasz."),
      micro("Jeśli wiesz, że coś nie ma kierunku, ale nadal próbujesz znaleźć wyjątek, warto zobaczyć całość z dystansu."),
      h2("Zmęczenie bez wyraźnej przyczyny"),
      p("Czujesz ulgę, kiedy partner wychodzi. Każde spotkanie wymaga mobilizacji. Wracasz bardziej opróżniony, niż byłeś przed. Nie ma dramatycznych scen. Po prostu jesteś zmęczony."),
      p("Rozpoznanie, że związek nie ma przyszłości, nie polega na zebraniu wystarczającej liczby dowodów. Często dowody są od dawna. Chodzi o to, żeby zobaczyć je bez filtrowania przez nadzieję."),
    ],
  },
];

const categoryLabels: Record<Article["category"], string> = {
  decyzja: "Decyzja: zostać, wrócić, odpuścić",
  sygnaly: "Sygnały: niejasność, dystans, napięcie",
  status: "Status: bliskość bez nazwy",
  wzorzec: "Wzorzec: to wraca kolejny raz",
  rokowania: "Przyszłość: czy to ma kierunek",
  diagnostyka: "Kondycja relacji: co robi z Tobą na co dzień",
};

const articleInsights: Record<string, string[]> = {
  "czy-ten-zwiazek-ma-sens": ["jak odróżnić chwilowy kryzys od relacji bez kierunku", "dlaczego jeden dobry moment nie kasuje powtarzalnego wzorca"],
  "czy-warto-ratowac-zwiazek": ["jak odróżnić kryzys od powtarzalnego schematu", "czy ratujesz relację, czy własną nadzieję"],
  "czy-ona-on-sie-mna-bawi": ["po czym poznać, że jesteś opcją, a nie priorytetem", "dlaczego mieszane sygnały tak mocno wciągają"],
  "toksyczna-relacja-czy-trudny-moment": ["czym różni się trudny okres od stałej destrukcji", "jak sprawdzić, czy szacunek wraca, gdy presja mija"],
  "czy-warto-dac-druga-szanse": ["czym różni się tęsknota od realnej zmiany", "co musi się zmienić, żeby powrót miał sens"],
  "relacja-bez-zaangazowania": ["dlaczego brak nazwy też potrafi kosztować spokój", "kto korzysta z relacji bez jasnych zasad"],
  "dlaczego-wracasz-do-tego-samego-partnera": ["dlaczego znane napięcie bywa mylone z chemią", "co sprawia, że wracasz mimo świadomości schematu"],
  "czy-moj-zwiazek-jest-zdrowy": ["jak relacja wpływa na Ciebie na co dzień", "czym różni się konflikt od stałego napięcia"],
  "jak-rozpoznac-ze-zwiazek-nie-ma-przyszlosci": ["po czym poznać brak wspólnego kierunku", "dlaczego miłość nie zawsze oznacza przyszłość"],
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
                <span style={styles.eyebrow}>{indexRoute ? "PORADNIKI" : "PORADNIKI"}</span>
                <h2 className="articles-main-title" style={styles.title}>
                  {indexRoute ? "Poradniki, które pomagają nazwać problem w relacji" : "Poradniki, które pomagają nazwać problem w relacji"}
                </h2>
                <p className="articles-main-subtitle" style={styles.subtitle}>
                  {indexRoute
                    ? "Przewodniki po najczęstszych sytuacjach: niejasność, powroty, brak zaangażowania, mieszane sygnały i decyzje, których nie da się już odkładać."
                    : "Poradniki, które pomagają nazwać problem w relacji."}
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
