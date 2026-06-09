import { useState } from "react";
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

export const ARTICLES = [
  {
    slug: "dlaczego-wracasz",
    kicker: "WZORZEC",
    title: "Dlaczego wracasz do tego samego partnera",
    lead: "Nie chodzi o miĹ‚oĹ›Ä‡. Albo przynajmniej nie tylko o niÄ….",
    body: [
      "WiÄ™kszoĹ›Ä‡ ludzi, ktĂłrzy wracajÄ… do tych samych relacji albo wchodzÄ… wciÄ…ĹĽ w ten sam typ zwiÄ…zku z innymi ludĹşmi, nie robi tego dlatego, ĹĽe nie rozumie, co siÄ™ dzieje. CzÄ™sto rozumiejÄ… doskonale. WidzÄ… wzorzec, potrafiÄ… go nazwaÄ‡, potrafiÄ… nawet powiedzieÄ‡, skÄ…d pochodzi. I wracajÄ… mimo to. To jest wĹ‚aĹ›nie ten moment, ktĂłry wymaga wyjaĹ›nienia.",

      "Psychologia przywiÄ…zania opisuje to jako kompulsjÄ™ powtarzania, ale ta etykieta niewiele tĹ‚umaczy. Bardziej uĹĽyteczne jest zobaczenie, jak to dziaĹ‚a w praktyce. TwĂłj ukĹ‚ad nerwowy, uksztaĹ‚towany przez lata wczesnych relacji, nauczyĹ‚ siÄ™ rozpoznawaÄ‡ pewien typ bliskoĹ›ci jako normalny. Niekoniecznie dobry. Normalny w sensie znajomy, przewidywalny na poziomie emocjonalnym, nawet jeĹ›li intelektualnie wiesz, ĹĽe to nie jest to, czego chcesz. MĂłzg przetwarza znajomoĹ›Ä‡ jako bezpieczeĹ„stwo. Nowa osoba, ktĂłra oferuje spokĂłj i staĹ‚oĹ›Ä‡, moĹĽe byÄ‡ przez twĂłj ukĹ‚ad nerwowy odczuwana jako nudna albo pĹ‚aska, nie dlatego, ĹĽe taka jest, ale dlatego, ĹĽe nie aktywuje tych samych Ĺ›cieĹĽek pobudzenia, ktĂłre znasz.",

      "To jest jeden z najbardziej niekomfortowych faktĂłw o ludzkim przywiÄ…zaniu i jednoczeĹ›nie jeden z najrzadziej wypowiadanych wprost: moĹĽesz nie chcieÄ‡ kogoĹ›, kto jest dla ciebie dobry, nie dlatego, ĹĽe masz zĹ‚e intencje, ale dlatego, ĹĽe twĂłj system emocjonalny nie jest nauczony odczuwaÄ‡ tego jako atrakcyjnego.",

      "Przerywane wzmocnienie to pojÄ™cie z psychologii behawioralnej, ktĂłre opisuje mechanizm silniejszy, niĹĽ wiÄ™kszoĹ›Ä‡ ludzi sobie wyobraĹĽa. Kiedy nagroda pojawia siÄ™ nieregularnie, nieprzewidywalnie, raz jest, a raz jej nie ma, mĂłzg traktuje jÄ… jako waĹĽniejszÄ… niĹĽ nagrodÄ™, ktĂłra jest zawsze. To jest ten sam mechanizm, ktĂłry sprawia, ĹĽe hazard uzaleĹĽnia bardziej niĹĽ praca na pensji. W relacji wyglÄ…da to tak: sÄ… momenty bliskoĹ›ci, sÄ… momenty dystansu, jest czuĹ‚oĹ›Ä‡ i jest jej brak, jest poczucie, ĹĽe ktoĹ› ciÄ™ widzi, i jest poczucie, ĹĽe znikasz. I zamiast sprawiÄ‡, ĹĽe odchodzisz, ten rytm sprawia, ĹĽe zostajesz. TwĂłj mĂłzg jest dosĹ‚ownie uzaleĹĽniony od rozwiÄ…zania napiÄ™cia, ktĂłre ta osoba w tobie generuje.",

      "Do tego dochodzi coĹ›, co moĹĽna nazwaÄ‡ efektem utopionych kosztĂłw, tyle ĹĽe w wersji emocjonalnej. Im wiÄ™cej zainwestowaĹ‚eĹ› w relacjÄ™, im wiÄ™cej nadziei, czasu, energii, rozmĂłw o zmianach, prĂłb naprawy, tym trudniej z niej wyjĹ›Ä‡. Nie dlatego, ĹĽe jest dobra. Dlatego, ĹĽe wyjĹ›cie oznaczaĹ‚oby przyznanie, ĹĽe ta inwestycja nie miaĹ‚a sensu. A mĂłzg bardzo nie chce przyznawaÄ‡ siÄ™ do bĹ‚Ä™dĂłw, szczegĂłlnie tak kosztownych.",

      "Jest jeszcze jeden wymiar, rzadko opisywany wprost. ZostajÄ…c w zĹ‚ej relacji albo do niej wracajÄ…c, czasem unikasz czegoĹ› bardziej przeraĹĽajÄ…cego niĹĽ sam zwiÄ…zek. Tego, kim jesteĹ› poza nim. Relacja, nawet trudna, daje strukturÄ™. Daje kogoĹ›, od kogo moĹĽesz siÄ™ odbijaÄ‡, o kogo moĹĽesz siÄ™ martwiÄ‡, kogo moĹĽesz prĂłbowaÄ‡ naprawiÄ‡ albo zrozumieÄ‡. To jest zajÄ™cie dla gĹ‚owy i dla serca. WyjĹ›cie z tego oznacza staniÄ™cie z samym sobÄ… bez tego zagospodarowania. I to jest dla wielu ludzi znacznie trudniejsze niĹĽ kolejna runda w znajomej relacji.",

      "To, co opisujÄ™, nie jest teoriami. Jest obserwacjÄ… mechanizmĂłw, ktĂłre dziaĹ‚ajÄ… poniĹĽej progu Ĺ›wiadomej decyzji. MoĹĽesz je zobaczyÄ‡ u siebie dopiero wtedy, kiedy naprawdÄ™ przyjrzysz siÄ™ nie wzorcom w ogĂłle, ale temu, co konkretnie siÄ™ dzieje miÄ™dzy tobÄ… a tÄ… jednÄ… osobÄ…. Co ona robi, kiedy jest ci Ĺşle. Jak reagujesz, kiedy ona siÄ™ oddala. Co czujesz, kiedy wraca. To sÄ… dane. I z tymi danymi moĹĽna pracowaÄ‡.",

      "Problem w tym, ĹĽe ogĂłlna wiedza o przywiÄ…zaniu rzadko do tego wystarczy. Bo wiedza o tym, skÄ…d wzorzec pochodzi, to nie to samo, co zobaczenie, jak ten wzorzec dziaĹ‚a teraz, z tÄ… osobÄ…, w tej konkretnej konfiguracji.",

      "JeĹ›li czytasz to i masz poczucie, ĹĽe rozumiesz mechanizm, ale wciÄ…ĹĽ nie rozumiesz, dlaczego ty, z tym konkretnym czĹ‚owiekiem, nie moĹĽesz z tego wyjĹ›Ä‡ albo przestaÄ‡ wracaÄ‡, to nie jest kwestia wiedzy, ktĂłrej ci brakuje. To jest kwestia spojrzenia na to, co rzeczywiĹ›cie siÄ™ dzieje, a nie na to, co powinno siÄ™ dziaÄ‡ wedĹ‚ug teorii.",

      "To jest zupeĹ‚nie inne pytanie. I wymaga zupeĹ‚nie innego podejĹ›cia.",
    ],
  },
  {
    slug: "czy-zwiazek-jest-zdrowy",
    kicker: "DIAGNOSTYKA",
    title: "Czy mĂłj zwiÄ…zek jest zdrowy",
    lead: "Zdrowych zwiÄ…zkĂłw siÄ™ nie sprawdza w internecie o drugiej w nocy.",
    body: [
      "To pytanie wpisuje w wyszukiwarkÄ™ kilkadziesiÄ…t tysiÄ™cy osĂłb miesiÄ™cznie. Co juĹĽ samo w sobie jest informacjÄ…. Zdrowych zwiÄ…zkĂłw siÄ™ nie sprawdza w internecie o drugiej w nocy.",

      "Ale samo pytanie jest trudniejsze, niĹĽ siÄ™ wydaje. Nie dlatego, ĹĽe odpowiedĹş jest skomplikowana. CzÄ™sto jest zupeĹ‚nie odwrotnie: wiele osĂłb, ktĂłre to pytanie zadajÄ…, gdzieĹ› w Ĺ›rodku znajÄ… odpowiedĹş. TrudnoĹ›Ä‡ polega na tym, ĹĽe miÄ™dzy wiedzÄ… a uznaniem tej wiedzy jest przepaĹ›Ä‡, przez ktĂłrÄ… wiÄ™kszoĹ›Ä‡ ludzi nie potrafi samodzielnie przejĹ›Ä‡.",

      "Zacznijmy od tego, czego to pytanie zwykle nie dotyczy, mimo ĹĽe tak wyglÄ…da. Nie dotyczy tego, czy w zwiÄ…zku sÄ… konflikty. Para, ktĂłra siÄ™ nie kĹ‚Ăłci, czÄ™sto jest parÄ…, w ktĂłrej jedno z nich nauczyĹ‚o siÄ™ milczeÄ‡. ObecnoĹ›Ä‡ napiÄ™cia nie jest oznakÄ… choroby relacji. SposĂłb, w jaki to napiÄ™cie jest przetwarzane, owszem.",

      "Badacz John Gottman po kilkudziesiÄ™ciu latach pracy z parami wyodrÄ™bniĹ‚ cztery wzorce komunikacji, ktĂłre z bardzo wysokÄ… skutecznoĹ›ciÄ… przewidujÄ… rozpad zwiÄ…zku. Pogarda jest wĹ›rĂłd nich najgroĹşniejsza, bo nie chodzi tu o krzyk ani kĹ‚Ăłtnie, chodzi o subtelny komunikat: ty jesteĹ› poniĹĽej mnie. MoĹĽe byÄ‡ wyraĹĽana tonem gĹ‚osu, przekrÄ™caniem oczu, ironiÄ…, dobieraniem sĹ‚Ăłw, ktĂłre umniejszajÄ…. MoĹĽna jÄ… stosowaÄ‡ raz na kilka tygodni i nadal niszczyÄ‡ zwiÄ…zek systematycznie.",

      "PrzyglÄ…daj siÄ™ temu, jak funkcjonujesz, kiedy jesteĹ› z tym czĹ‚owiekiem. Nie temu, co czujesz do niego. Temu, jak jesteĹ› z samym sobÄ… przy nim. Czy mĂłwisz to, co naprawdÄ™ myĹ›lisz, czy filtrujesz, zanim powiesz cokolwiek? Czy wnosisz do rozmĂłw swoje prawdziwe zdanie, czy dostosowujesz je do tego, co on lub ona chce usĹ‚yszeÄ‡? Czy po spÄ™dzeniu czasu razem czujesz siÄ™ naĹ‚adowany, czy oprĂłĹĽniony?",

      "Jest mechanizm, ktĂłry psychologowie opisujÄ… jako hypervigilance w relacji, stan podwyĹĽszonej czujnoĹ›ci wobec sygnaĹ‚Ăłw od partnera. Monitorujesz jego nastrĂłj, zanim cokolwiek powiesz. Interpretujesz ton wiadomoĹ›ci. Czekasz na sygnaĹ‚, ĹĽe jest dobrze, zanim sam zdecydujesz siÄ™ zrelaksowaÄ‡. To nie jest miĹ‚oĹ›Ä‡. To jest adaptacja ukĹ‚adu nerwowego do Ĺ›rodowiska, ktĂłre jest nieprzewidywalne. JeĹ›li robisz to chronicznie w zwiÄ…zku, twĂłj organizm traktuje tÄ™ relacjÄ™ jako sytuacjÄ™ wymagajÄ…cÄ… ostroĹĽnoĹ›ci. To jest informacja diagnostyczna, niezaleĹĽnie od tego, jak bardzo kochasz tÄ™ osobÄ™ i ile dobrych chwil miÄ™dzy wami jest.",

      "Innym rzadko opisywanym sygnaĹ‚em jest to, co dzieje siÄ™ z twojÄ… toĹĽsamoĹ›ciÄ… w czasie trwania relacji. W zwiÄ…zku, ktĂłry nie jest zdrowy, jeden z partnerĂłw zwykle kurczy siÄ™. Nie dramatycznie, nie z dnia na dzieĹ„. Stopniowo przestaje wspominaÄ‡ o pewnych zainteresowaniach, bo partner komentuje je z dystansem. Przestaje widywaÄ‡ siÄ™ z pewnymi znajomymi, bo to powoduje napiÄ™cie. Przestaje mĂłwiÄ‡ o pewnych potrzebach, bo za kaĹĽdym razem, gdy je zgĹ‚asza, czuje siÄ™ z tym gorzej niĹĽ przed rozmowÄ…. JeĹ›li porĂłwnasz siebie sprzed tej relacji i siebie teraz, co widzisz? Czy jesteĹ› kimĹ›, kogo lubisz bardziej, czy mniej?",

      "Jest teĹĽ asymetria wysiĹ‚ku, ktĂłra jest moĹĽe najĹ‚atwiej obserwowalna, ale najczÄ™Ĺ›ciej racjonalizowana. Chodzi nie tylko o to, kto czÄ™Ĺ›ciej inicjuje spotkania czy rozmowy. Chodzi o to, kto w tej relacji pracuje nad relacjÄ…. Kto myĹ›li o tym, co miÄ™dzy wami. Kto czyta artykuĹ‚y takie jak ten. Kto wchodzi na terapiÄ™. Kto stara siÄ™ zrozumieÄ‡, co siÄ™ dzieje. JeĹ›li to tylko ty, to nie jest kwestia tego, ĹĽe jesteĹ› bardziej refleksyjny. To jest kwestia tego, ĹĽe ty jesteĹ› w tej relacji bardziej zainteresowany jej jakoĹ›ciÄ… niĹĽ twĂłj partner. I to jest informacja o tym zwiÄ…zku.",

      "OdpowiedĹş na pytanie, czy twĂłj zwiÄ…zek jest zdrowy, leĹĽy w detalach tego, co miÄ™dzy wami konkretnie siÄ™ dzieje. Nie w teorii. Nie w listach objawĂłw. W tym, jak reagujesz przy tej osobie, czego unikasz, o czym milczysz i kim jesteĹ› po roku spÄ™dzonym razem.",

      "Ĺ»aden artykuĹ‚ tego za ciebie nie zobaczy. MoĹĽesz to zobaczyÄ‡ tylko ty, ale dopiero wtedy, kiedy przestaniesz filtrowaÄ‡ to, co widzisz, przez to, co chcesz, ĹĽeby byĹ‚o prawdÄ….",
    ],
  },
  {
    slug: "zwiazek-bez-przyszlosci",
    kicker: "ROKOWANIA",
    title: "Jak rozpoznaÄ‡, ĹĽe zwiÄ…zek nie ma przyszĹ‚oĹ›ci",
    lead: "WiÄ™kszoĹ›Ä‡ ludzi nie koĹ„czy zĹ‚ego zwiÄ…zku za wczeĹ›nie. KoĹ„czy go za pĂłĹşno.",
    body: [
      "WiÄ™kszoĹ›Ä‡ ludzi nie koĹ„czy zĹ‚ego zwiÄ…zku za wczeĹ›nie. KoĹ„czy go za pĂłĹşno. CzÄ™sto o kilka lat za pĂłĹşno. I nie dzieje siÄ™ tak dlatego, ĹĽe sÄ… naiwni albo sĹ‚abi. Dzieje siÄ™ tak dlatego, ĹĽe sygnaĹ‚y, o ktĂłrych tutaj piszÄ™, rzadko pojawiajÄ… siÄ™ jako wyraĹşne zdarzenia. SÄ… procesem. Powolnym przesuniÄ™ciem, ktĂłre jest prawie niewidoczne na co dzieĹ„, a widoczne dopiero wtedy, kiedy porĂłwnasz siebie sprzed trzech lat z sobÄ… teraz.",

      "Zacznijmy od czegoĹ›, co rzadko trafia do takich artykuĹ‚Ăłw. Uczucie i rokowania to dwie kompletnie rĂłĹĽne rzeczy. MoĹĽesz gĹ‚Ä™boko kochaÄ‡ kogoĹ› i jednoczeĹ›nie byÄ‡ w relacji, ktĂłra nie ma przyszĹ‚oĹ›ci. To nie jest sprzecznoĹ›Ä‡. To jest jedna z najczÄ™stszych i najbardziej bolesnych sytuacji, w jakich ludzie siÄ™ znajdujÄ…. Problem polega na tym, ĹĽe kultura romantyczna nauczyĹ‚a nas, ĹĽe miĹ‚oĹ›Ä‡ powinna wystarczyÄ‡. Ĺ»e jeĹ›li doĹ›Ä‡ siÄ™ staramy i doĹ›Ä‡ siÄ™ kochamy, to wszystko inne siÄ™ uĹ‚oĹĽy. To jest przekonanie, ktĂłre sprawia, ĹĽe ludzie zostajÄ… w miejscach, w ktĂłrych nie powinni byÄ‡, jeszcze przez rok albo trzy.",

      "Gottman, ktĂłry przez kilkadziesiÄ…t lat obserwowaĹ‚ pary w laboratoryjnych warunkach, doszedĹ‚ do wniosku, ĹĽe 69 procent konfliktĂłw w zwiÄ…zkach to konflikty nierozwiÄ…zywalne. Nie dlatego, ĹĽe pary sÄ… niedojrzaĹ‚e albo nie umiejÄ… rozmawiaÄ‡. Dlatego, ĹĽe wynikajÄ… z fundamentalnych rĂłĹĽnic w osobowoĹ›ci, wartoĹ›ciach albo potrzebach. Pary, ktĂłre trwajÄ…, nie sÄ… tymi, ktĂłre te konflikty rozwiÄ…zujÄ…. SÄ… tymi, ktĂłre nauczyĹ‚y siÄ™ z nimi ĹĽyÄ‡ w sposĂłb, ktĂłry nie niszczy ani jednej, ani drugiej strony.",

      "PrzyglÄ…daj siÄ™ temu, co dzieje siÄ™, kiedy rozmawiasz o przyszĹ‚oĹ›ci. Nie o wakacjach na jesieĹ„. O tym, gdzie bÄ™dziecie za trzy lata, co chcecie wspĂłlnie budowaÄ‡, jak wyobraĹĽacie sobie swoje ĹĽycie. Unikanie tych rozmĂłw przez partnera rzadko jest Ĺ›wiadomÄ… strategiÄ…. CzÄ™sto jest instynktownÄ… odpowiedziÄ… na niezgodnoĹ›Ä‡, ktĂłra jest zbyt niekomfortowa, ĹĽeby jÄ… zwerbalizowaÄ‡. JeĹ›li plany na przyszĹ‚oĹ›Ä‡ sÄ… zawsze ogĂłlne, zawsze zobaczymy, zawsze odkĹ‚adane, to nie jest kwestia tego, ĹĽe partner nie jest gotowy na rozmowÄ™. To jest kwestia tego, ĹĽe na poziomie emocjonalnym nie umieszcza ciÄ™ w tej przyszĹ‚oĹ›ci.",

      "Jest teĹĽ coĹ›, co moĹĽna nazwaÄ‡ wyobraĹşniÄ… jako mechanizmem obronnym. ZauwaĹĽ, czy jesteĹ› bardziej zaangaĹĽowany w wyobraĹĽonÄ… wersjÄ™ tego zwiÄ…zku niĹĽ w tÄ™, ktĂłra rzeczywiĹ›cie istnieje. Relacja, ktĂłra istnieje gĹ‚Ăłwnie jako projekt naprawy albo jako coĹ›, co przetrwasz do momentu, w ktĂłrym coĹ› siÄ™ zmieni, nie jest relacjÄ…, w ktĂłrej ĹĽyjesz. Jest relacjÄ…, w ktĂłrej czekasz.",

      "ZmÄ™czenie bez wyraĹşnej przyczyny to sygnaĹ‚, ktĂłry wielu ludzi ignoruje, bo nie wyglÄ…da jak coĹ› istotnego. Czujesz ulgÄ™, kiedy partner wychodzi. KaĹĽde spotkanie wymaga mobilizacji, ktĂłrej nie rozumiesz. Wracasz do domu po czasie spÄ™dzonym razem bardziej oprĂłĹĽniony, niĹĽ byĹ‚eĹ› przed. Nie ma dramatycznych scen. Po prostu jesteĹ› zmÄ™czony. To jest informacja od ciaĹ‚a, nie od gĹ‚owy. UkĹ‚ady nerwowe sÄ… dobre w rozpoznawaniu kosztĂłw Ĺ›rodowisk, w ktĂłrych ĹĽyjemy, nawet kiedy gĹ‚owa produkuje jeszcze argumenty za zostaniem.",

      "Jest jeszcze jeden mechanizm, ktĂłry sprawia, ĹĽe trudno to zobaczyÄ‡. Im wiÄ™cej zainwestowaĹ‚eĹ›, tym trudniej odejĹ›Ä‡. Nie dlatego, ĹĽe relacja jest dobra. Dlatego, ĹĽe psychologicznie znacznie trudniej jest zaakceptowaÄ‡, ĹĽe coĹ›, w co wĹ‚oĹĽyĹ‚eĹ› lata swojego ĹĽycia, nie przyniesie efektu, ktĂłrego oczekiwaĹ‚eĹ›. To jest efekt utopionych kosztĂłw w wersji emocjonalnej i dziaĹ‚a dokĹ‚adnie tak samo jak u inwestora, ktĂłry nie sprzedaje akcji tracÄ…cych na wartoĹ›ci, bo sprzedanie ich oznaczaĹ‚oby przyznanie siÄ™ do straty.",

      "CzÄ™sto zostajemy nie dlatego, ĹĽe nie widzimy sygnaĹ‚Ăłw. Zostajemy dlatego, ĹĽe widzimy je i jednoczeĹ›nie boimy siÄ™ tego, co jest po drugiej stronie. WyjĹ›cie ze zwiÄ…zku to nie jest tylko utrata partnera. To jest utrata struktury, ktĂłra organizuje twoje ĹĽycie emocjonalne. KogoĹ›, od kogo siÄ™ odbijasz, o kogo siÄ™ martwisz, kogo prĂłbujesz zrozumieÄ‡. I zostaje pytanie o to, kim jesteĹ› bez tej relacji, czego chcesz, co moĹĽesz zbudowaÄ‡. To jest dla wielu osĂłb znacznie trudniejsze niĹĽ kolejny rok w znajomym miejscu.",

      "Rozpoznanie, ĹĽe zwiÄ…zek nie ma przyszĹ‚oĹ›ci, nie jest kwestiÄ… zebrania wystarczajÄ…cej liczby dowodĂłw. WiÄ™kszoĹ›Ä‡ ludzi ma te dowody od dawna. Jest kwestiÄ… tego, ĹĽeby zobaczyÄ‡ je bez filtrowania przez nadziejÄ™, przez inwestycjÄ™ emocjonalnÄ…, przez lÄ™k przed tym, co po drugiej stronie.",

      "I to jest operacja, ktĂłrÄ… kaĹĽdy musi przejĹ›Ä‡ sam, na materiale swojej konkretnej relacji, nie na teoriach.",
    ],
  },
];

// â”€â”€ Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const styles: Record<string, React.CSSProperties> = {
  section: {
    marginTop: "48px",
    paddingBottom: "8px",
  },
  header: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: `1px solid rgba(255,255,255,0.06)`,
  },
  headerLeft: {
    display: "flex",
    alignItems: "baseline",
    gap: "16px",
  },
  eyebrow: {
    fontSize: "10px",
    letterSpacing: "0.14em",
    color: BRAND.gold,
    fontWeight: 600,
    textTransform: "uppercase" as const,
  },
  headerTitle: {
    fontSize: "13px",
    color: BRAND.muted,
    fontWeight: 400,
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  card: {
    background: BRAND.panel,
    border: `1px solid ${BRAND.border}`,
    borderRadius: "10px",
    padding: "24px",
    cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s",
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },
  cardHovered: {
    background: BRAND.panelStrong,
    borderColor: "rgba(197,160,89,0.25)",
  },
  cardKicker: {
    fontSize: "9px",
    letterSpacing: "0.16em",
    color: BRAND.gold,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    opacity: 0.8,
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: 600,
    color: BRAND.text,
    lineHeight: 1.4,
    margin: 0,
  },
  cardLead: {
    fontSize: "13px",
    color: BRAND.muted,
    lineHeight: 1.65,
    margin: 0,
  },
  cardArrow: {
    fontSize: "12px",
    color: BRAND.gold,
    marginTop: "auto",
    paddingTop: "8px",
    opacity: 0.7,
  },
  // Article full view
  articleWrap: {
    background: BRAND.panel,
    border: `1px solid ${BRAND.border}`,
    borderRadius: "12px",
    padding: "clamp(28px, 4vw, 52px)",
    maxWidth: "680px",
    margin: "0 auto",
  },
  articleBack: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    color: BRAND.muted,
    fontSize: "12px",
    letterSpacing: "0.1em",
    cursor: "pointer",
    padding: "0",
    marginBottom: "32px",
    textTransform: "uppercase" as const,
    fontWeight: 500,
  },
  articleKicker: {
    fontSize: "9px",
    letterSpacing: "0.18em",
    color: BRAND.gold,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    marginBottom: "12px",
  },
  articleTitle: {
    fontSize: "clamp(22px, 3vw, 30px)",
    fontWeight: 700,
    color: BRAND.text,
    lineHeight: 1.25,
    margin: "0 0 20px",
  },
  articleDivider: {
    width: "32px",
    height: "1px",
    background: BRAND.gold,
    opacity: 0.4,
    margin: "0 0 28px",
    border: "none",
  },
  articlePara: {
    fontSize: "16px",
    lineHeight: 1.8,
    color: BRAND.muted,
    margin: "0 0 20px",
  },
  articleCta: {
    marginTop: "40px",
    paddingTop: "32px",
    borderTop: `1px solid rgba(255,255,255,0.06)`,
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  articleCtaText: {
    fontSize: "14px",
    color: BRAND.muted,
    lineHeight: 1.6,
    margin: 0,
  },
};

// â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function ArticlesSection({ onStartAnalysis }: { onStartAnalysis: () => void }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const openArticle = ARTICLES.find((a) => a.slug === openSlug);

  return (
    <section style={styles.section}>
      <AnimatePresence mode="wait">

        {!openSlug && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div style={styles.header}>
              <div style={styles.headerLeft}>
                <span style={styles.eyebrow}>Czytaj</span>
                <p style={styles.headerTitle}>Mechanizmy, ktĂłrych nie widaÄ‡ z bliska</p>
              </div>
            </div>

            <div style={styles.grid}>
              {ARTICLES.map((article) => (
                <button
                  key={article.slug}
                  style={{
                    ...styles.card,
                    ...(hoveredSlug === article.slug ? styles.cardHovered : {}),
                    textAlign: "left",
                  }}
                  onClick={() => setOpenSlug(article.slug)}
                  onMouseEnter={() => setHoveredSlug(article.slug)}
                  onMouseLeave={() => setHoveredSlug(null)}
                >
                  <div style={styles.cardKicker}>{article.kicker}</div>
                  <h3 style={styles.cardTitle}>{article.title}</h3>
                  <p style={styles.cardLead}>{article.lead}</p>
                  <div style={styles.cardArrow}>Czytaj â†’</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {openSlug && openArticle && (
          <motion.div
            key="article"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div style={styles.articleWrap}>
              <button
                style={styles.articleBack}
                onClick={() => setOpenSlug(null)}
              >
                â† WrĂłÄ‡
              </button>

              <div style={styles.articleKicker}>{openArticle.kicker}</div>
              <h2 style={styles.articleTitle}>{openArticle.title}</h2>
              <hr style={styles.articleDivider} />

              {openArticle.body.map((para, i) => (
                <p key={i} style={styles.articlePara}>{para}</p>
              ))}

              <div style={styles.articleCta}>
                <p style={styles.articleCtaText}>
                  JeĹ›li chcesz zobaczyÄ‡, co naprawdÄ™ dzieje siÄ™ w twojej konkretnej relacji, nie w teorii, ale na podstawie tego, co sam opisujesz.
                </p>
                <button
                  className="ctms-btn ctms-btn-primary"
                  onClick={onStartAnalysis}
                >
                  SprawdĹş swojÄ… relacjÄ™
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </section>
  );
}

