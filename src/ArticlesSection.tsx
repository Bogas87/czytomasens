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

const ARTICLES = [
  {
    slug: "dlaczego-wracasz",
    kicker: "WZORZEC",
    title: "Dlaczego wracasz do tego samego partnera",
    lead: "Większość osób tkwiących w pętli powrotów doskonale rozumie swój błąd na poziomie intelektualnym. Potrafią nazwać schemat, wskazać jego źródło w dzieciństwie, a mimo to – gdy tylko opadnie pierwszy kurz po rozstaniu – logika przegrywa z magnetycznym przyciąganiem. Psychologia behawioralna i neurobiologia odzierają ten proces z romantycznych złudzeń. To nie miłość dyktuje te powroty, lecz mechanizm przerywanego wzmocnienia, działający na mózg identycznie jak hazard, oraz głęboko zakorzeniona adaptacja układu nerwowego, który utożsamia emocjonalny chaos ze „bezpieczną znajomością”. Nowy, stabilny partner nie wyda Ci się atrakcyjny, dopóki Twój wewnętrzny system nie przejdzie twardego resetu.",
    breakSymbol: "-",
    question: "Jeżeli potrafisz bezbłędnie przeanalizować swój toksyczny związek, a mimo to wciąż w nim lądujesz, czas przestać pytać o teorię przywiązania. Pytanie brzmi: przed jaką wersją samego siebie uciekasz w tę relację i co tak naprawdę musiałbyś poczuć, gdyby w Twoim życiu nastała absolutna, niezagospodarowana niczyim dramatem cisza?",
    body: [
      "Większość ludzi, którzy wracają do tych samych relacji albo wchodzą wciąż w astonishment ten sam typ związku z innymi ludźmi, nie robi tego dlatego, że nie rozumie, co się dzieje. Często rozumieją doskonale. Widzą wzorzec, potrafią go nazwać, potrafią nawet powiedzieć, skąd pochodzi. I wracają mimo to. To jest właśnie ten moment, który wymaga wyjaśnienia.",
      "Psychologia przywiązania opisuje to jako kompulsję powtarzania, ale ta etykieta niewiele tłumaczy. Bardziej użyteczne jest zobaczenie, jak to działa w praktyce. Twój układ nerwowy, ukształtowany przez lata wczesnych relacji, nauczył się rozpoznawać pewien typ bliskości jako normalny. Niekoniecznie dobry. Normalny w sensie znajomy, przewidywalny na poziomie emocjonalnym, nawet jeśli intelektualnie wiesz, że to nie jest to, czego chcesz. Mózg przetwasza znajomość jako bezpieczeństwo. Nowa osoba, która oferuje spokój i stałość, może być przez twój układ nerwowy odczuwana jako nudna albo płaska, nie dlatego, że taka jest, ale dlatego, że nie aktywuje tych samych ścieżek pobudzenia, które znasz.",
      "To jest jeden z najbardziej niekomfortowych faktów o ludzkim przywiązaniu i jednocześnie jeden z najrzadziej wypowiadanych wprost: możesz nie chcieć kogoś, kto jest dla ciebie dobry, nie dlatego, że masz złe intencje, ale dlatego, że twój system emocjonalny nie jest nauczony odczuwać tego jako atrakcyjnego.",
      "Przerywane wzmocnienie to pojęcie z psychologii behawioralnej, które opisuje mechanizm silniejszy, niż większość ludzi sobie wyobraża. Kiedy nagroda pojawia się nieregularnie, nieprzewidywalnie, raz jest, a raz jej nie ma, mózg traktuje ją jako ważniejszą niż nagrodę, która jest zawsze. To jest ten sam mechanizm, który sprawia, że hazard uzależnia bardziej niż praca na pensji. W relacji wygląda to tak: są momenty bliskości, są momenty dystansu, jest czułość i jest jej brak, jest poczucie, że ktoś cię widzi, i jest poczucie, że znikasz. I zamiast sprawić, że odchodzisz, ten rytm sprawia, że zostajesz. Twój mózg jest dosłownie uzależniony od rozwiązania napięcia, które ta osoba w tobie generuje.",
      "Do tego dochodzi coś, co można nazwać efektem utopionych kosztów, tyle że w wersji emocjonalnej. Im więcej zainwestowałeś w relację, im więcej nadziei, czasu, energii, rozmów o zmianach, prób naprawy, tym trudniej z niej wyjść. Nie dlatego, że jest dobra. Dlatego, że wyjście oznaczałoby przyznanie, że ta inwestycja nie miała sensu. A mózg bardzo nie chce przyznawać się do błędów, szczególnie tak kosztownych.",
      "Jest jeszcze jeden wymiar, rzadko opisywany wprost. Zostając w złej relacji albo do niej wracając, czasem unikasz czegoś bardziej przerażającego niż sam związek. Tego, kim jesteś poza nim. Relacja, nawet trudna, daje strukturę. Daje kogoś, od kogo możesz się odbijać, o kogo możesz się martwić, kogo możesz próbować naprawić albo zrozumieć. To jest zajęcie dla głowy i dla serca. Wyjście z tego oznacza stanięcie z samym sobą bez tego zagospodarowania. I to jest dla wielu ludzi znacznie trudniejsze niż kolejny runda w znajomej relacji.",
      "To, co opisuję, nie jest teoriami. Jest obserwacją mechanizmów, które działają poniżej progu świadomej decyzji. Możesz je zobaczyć u siebie dopiero wtedy, kiedy naprawdę przyjrzysz się nie wzorcom w ogóle, ale temu, co konkretnie się dzieje między tobą a tą jedną osobą. Co ona robi, kiedy jest ci źle. Jak reagujesz, kiedy ona się oddala. Co czujesz, kiedy wraca. To są dane. I z tymi danymi można pracować.",
      "Problem w tym, że ogólna wiedza o przywiązaniu rzadko do tego wystarczy. Bo wiedza o tym, skąd wzorzec pochodzi, to nie to samo, co zobaczenie, jak ten wzorzec działa teraz, z tą osobą, w tej konkretnej konfiguracji.",
      "Jeśli czytasz to i masz poczucie, że rozumiesz mechanizm, ale wciąż nie rozumiesz, dlaczego ty, z tym konkretnym człowiekiem, nie możesz z tego wyjść albo przestać wracać, to nie jest kwestia wiedzy, której ci brakuje. To jest kwestia spojrzenia na to, co rzeczywiście się dzieje, a nie na to, co powinno się dziać według teorii.",
      "To jest zupełnie inne pytanie. I wymaga zupełnie innego podejścia."
    ],
  },
  {
    slug: "czy-zwiazek-jest-zdrowy",
    kicker: "DIAGNOSTYKA",
    title: "Czy mój związek jest zdrowy",
    lead: "Wpisywanie tego pytania w wyszukiwarkę o drugiej w nocy rzadko wynika z czystej curiosity – jest już samo w sobie symptomem. Wbrew powszechnej opinii, o zdrowiu relacji nie decyduje brak kłótni, lecz sposób, w jaki Wasze układy nerwowe reagują na swoją obecność poza momentami kryzysu. Najbardziej niszczycielskie mechanizmy, takie jak subtelna pogarda czy chroniczne stymulowanie stanu podwyższonej czujności (hypervigilance), rzadko przypominają filmowe awantury. To powolny proces emocjonalnego kurczenia się jednego z partnerów, który zaczyna filtrować swoje słowa, zarządzać nastrojem drugiej strony i nieświadomie rezygnować z własnej tożsamości w imię pozornego spokoju.",
    breakSymbol: "-",
    question: "Jeśli to Ty jesteś osobą, która analizuje dynamikę Waszego związku, czyta ten tekst i szuka rozwiązań, asymetria wysiłku już teraz daje Ci jasną odpowiedź. Spójrz w lustro i porównaj siebie sprzed tej relacji z tym, kim jesteś dzisiaj: czy na pewno chcesz spędzić kolejne lata z człowiekiem, przy którym musisz stawać się kimś mniejszym, niż w rzeczywistości jesteś?",
    body: [
      "To pytanie wpisuje w wyszukiwarkę kilkadziesiąt tysięcy osób miesięcznie. Co już samo w sobie jest informacją. Zdrowych związków się nie sprawdza w internecie o drugiej w nocy.",
      "But samo pytanie jest trudniejsze, niż się wydaje. Nie dlatego, że odpowiedź jest skomplikowana. Często jest zupełnie odwrotnie: wiele osób, które to pytanie zadają, gdzieś w środku znają odpowiedź. Trudność polega na tym, że między wiedzą a uznaniem tej wiedzy jest przepaść, przez którą większość ludzi nie potrafi samodzielnie przejść.",
      "Zacznijmy od tego, czego to pytanie zwykle nie dotyczy, mimo że tak wygląda. Nie dotyczy tego, czy w związku są konflikty. Para, która się nie kłóci, często jest parą, w której jedno z nich nauczyło się milczeć. Obecność napięcia nie jest oznaką choroby relacji. Sposób, w jaki to napięcie jest przetwarzane, owszem.",
      "Badacz John Gottman po kilkudziesięciu latach pracy z parami wyodrębnił cztery wzorce komunikacji, które z bardzo wysoką skutecznością przewidują rozpad związku. Pogarda jest wśród nich najgroźniejsza, bo nie chodzi tu o krzyk ani kłótnie, chodzi o subtelny komunikat: ty jesteś poniżej mnie. Może być wyrażana tonem głosu, przekręcaniem oczu, ironią, dobieraniem słów, które umniejszają. Można ją stosować raz na kilka tygodni i nadal niszczyć związek systematycznie.",
      "Przyglądaj się temu, jak funkcjonujesz, kiedy jesteś z tym człowiekiem. Nie temu, co czujesz do niego. Temu, jak jesteś z samym sobą przy nim. Czy mówisz to, co naprawdę myślisz, czy filtrujesz, zanim powiesz cokolwiek? Czy wnosisz do rozmów swoje prawdziwe zdanie, czy dostosowujesz je do tego, co on lub ona chce usłyszeć? Czy po spędzeniu czasu razem czujesz się naładowany, czy opróżniony?",
      "Jest mechanizm, który psychologowie opisują jako hypervigilance w relacji, stan podwyższonej czujności wobec sygnałów od partnera. Monitorujesz jego nastrój, zanim cokolwiek powiesz. Interpretujesz ton wiadomości. Czekasz na sygnał, że jest dobrze, zanim sam zdecydujesz się zrelaksować. To nie jest miłość. To jest adaptacja układu nerwowego do środowiska, które jest nieprzewidywalne. Jeśli robisz to chronicznie w związku, twój organizm traktuje tę relację jako sytuację wymagającą ostrożności. To jest informacja diagnostyczna, niezależnie od tego, jak bardzo kochasz tę osobę i ile dobrych chwil między wami jest.",
      "Innym rzadko opisywanym sygnałem jest to, co dzieje się z twoją tożsamością w czasie trwania relacji. W związku, który nie jest zdrowy, jeden z partnerów zwykle kurczy się. Nie dramatycznie, nie z dnia na dzień. Stopniowo przestaje wspominać o pewnych zainteresowaniach, bo partner komentuje je z dystansem. Przestaje widywać się z pewnymi znajomymi, bo to powoduje napięcie. Przestaje mówić o pewnych potrzebach, bo za każdym razem, gdy je zgłasza, czuje się z tym gorzej niż przed rozmową. Jeśli porównasz siebie sprzed tej relacji i siebie teraz, co widzisz? Czy jesteś kimś, kogo lubisz bardziej, czy mniej?",
      "Jest też asymetria wysiłku, która jest może najłatwiej obserwowalna, ale najczęściej racjonalizowana. Chodzi nie tylko o to, kto częściej inicjuje spotkania czy rozmowy. Chodzi o to, kto w tej relacji pracuje nad relacją. Kto myśli o tym, co między wami. Kto czyta artykuły takie jak ten. Kto wchodzi na terapię. Kto stara się zrozumieć, co się dzieje. Jeśli to tylko ty, to nie jest kwestia tego, że jesteś bardziej refleksyjny. To jest kwestia tego, że ty jesteś w tej relacji bardziej zainteresowany jej jakością niż twój partner. I to jest informacja o tym związku.",
      "Odpowiedź na pytanie, czy twój związek jest zdrowy, leży w detalach tego, co między wami konkretnie się dzieje. Nie w teoriach. Nie w listach objawów. W tym, jak reagujesz przy tej osobie, czego unikasz, o czym milczysz i kim jesteś po roku spędzonym razem.",
      "Żaden artykuł tego za ciebie nie zobaczy. Możesz to zobaczyć tylko ty, ale dopiero wtedy, kiedy przestaniesz filtrować to, co widzisz, przez to, co chcesz, żeby było prawdą."
    ],
  },
  {
    slug: "zwiazek-bez-przyszlosci",
    kicker: "ROKOWANIA",
    title: "Jak rozpoznać, że związek nie ma przyszłości",
    lead: "Największym błędem w martwych relacjach nie jest ich przedwczesne zakończenie, ale trwanie w nich o kilka lat za długo. Wynika to z destrukcyjnego kulturowego mitu, że „miłość powinna wystarczyć”. Tymczasem statystyki laboratoryjne są nieubłagane: większość konfliktów w parach jest strukturalnie nierozwiązywalna, a kluczem jest umiejętność życia z nimi bez wzajemnego wyniszczania. Kiedy partner unika rozmów o przyszłości, a Twoja energia ucieka w inwestowanie w „wyobrażoną, potencjalną wersję” tej osoby, związek staje się jedynie projektem budowlanym, który nigdy nie zostanie ukończony. Ciało wysyła sygnały znacznie wcześniej niż głowa – poprzez niewytłumaczalne zmęczenie i ulgę, gdy druga strona znika z pola widzenia.",
    breakSymbol: "-",
    question: "Blokuje Cię emocjonalny efekt utopionych kosztów: lęk, że odejście unieważni lata Twoich starań, kompromisów i cierpienia. Jednak trwanie w zawieszeniu to także decyzja. Czy masz odwagę przyznać przed samym sobą, że od dłuższego czasu nie żyjesz w realnym związku, lecz jedynie koczujesz w poczekalni, czekając na zmianę, która – jak doskonale wiesz ze zgromadzonych już dowodów – nigdy nie nadejdzie?",
    body: [
      "Większość ludzi nie kończy złego związku za wcześnie. Kończy go za późno. Często o kilka lat za późno. I nie dzieje się tak dlatego, że są naiwni albo słabi. Dzieje się tak dlatego, że sygnały, o których tutaj piszę, rzadko pojawiają się jako wyraźne zdarzenia. Są procesem. Powolnym przesunięciem, które jest prawie niewidoczne na co dzień, a widoczne dopiero wtedy, kiedy porównasz siebie sprzed trzech lat z sobą teraz.",
      "Zacznijmy od czegoś, co rzadko trafia do takich artykułów. Uczucie i rokowania to dwie kompletnie różne rzeczy. Możesz głęboko kochać kogoś i jednocześnie być w relacji, która nie ma przyszłości. To nie jest sprzeczność. To jest jedna z najczęstszych i najbardziej bolesnych sytuacji, w jakich ludzie się znajdują. Problem polega na tym, że kultura romantyczna nauczyła nas, że miłość powinna wystarczyć. Że jeśli dość się staramy i dość się kochamy, to wszystko inne się ułoży. To jest przekonanie, które sprawia, że ludzie zostają w miejscach, w których nie powinni być, jeszcze przez rok albo trzy.",
      "Gottman, który przez kilkadziesiąt lat obserwował pary w laboratoryjnych warunkach, doszedł do wniosku, że 69 procent konfliktów w związkach to konflikty nierozwiązywalne. Nie dlatego, że pary są niedojrzałe albo nie umieją rozmawiać. Dlatego, że wynikają z fundamentalnych różnic w osobowości, wartościach albo potrzebach. Pary, które trwają, nie są tymi, które te konflikty rozwiązują. Są tymi, które nauczyły się z nimi żyć w sposób, który nie niszczy ani jednej, ani drugiej strony.",
      "Przyglądaj się temu, co dzieje się, kiedy rozmawiasz o przyszłości. Nie o wakacjach na jesień. O tym, gdzie będziecie za trzy lata, co chcecie wspólnie budować, jak wyobrażacie sobie swoje życie. Unikanie tych rozmów przez partnera rzadko jest świadomą strategią. Często jest instynktowną odpowiedzią na niezgodność, która jest zbyt niekomfortowa, żeby ją zwerbalizować. Jeśli plany na przyszłość są zawsze ogólne, zawsze zobaczymy, zawsze odkładane, to nie jest kwestia tego, że partner nie jest gotowy na rozmowę. To jest kwestia tego, że na poziomie emocjonalnym nie umiecza cię w tej przyszłości.",
      "Jest też coś, co można nazwać wyobraźnią jako mechanizmem obronnym. Zauważ, czy jesteś bardziej zaangażowany w wyobrażoną wersję tego związku niż w tę, która rzeczywiście istnieje. Relacja, która istnieje głównie jako projekt naprawy albo jako coś, co przetrwasz do momentu, w którym coś się zmieni, nie jest relacją, w której żyjesz. Jest relacją, w której czekasz.",
      "Zmęczenie bez wyraźnej przyczyny to sygnał, który wielu ludzi ignoruje, bo nie wygląda jak coś istotnego. Czujesz ulgę, kiedy partner wychodzi. Każde spotkanie wymaga mobilizacji, której nie rozumiesz. Wracasz do domu po czasie spędzonym razem bardziej opróżniony, niż byłeś przed. Nie ma dramatycznych scen. Po prostu jesteś zmeczony. To jest informacja od ciała, nie od głowy. Układy nerwowe są dobre w rozpoznawaniu kosztów środowisk, w których żyjemy, nawet kiedy głowa produkuje jeszcze argumenty za zostaniem.",
      "Jest jeszcze jeden mechanizm, który sprawia, że trudno to zobaczyć. Im więcej zainwestowałeś, tym trudniej odejść. Nie dlatego, że relacja jest dobra. Dlatego, że psychologicznie znacznie trudniej jest zaakceptować, że coś, w co włożyłeś lata swojego życia, nie przyniesie efektu, którego oczekiwałeś. To jest efekt utopionych kosztów w wersji emocjonalnej i działa dokładnie tak samo jak u inwestora, który nie sprzedaje akcji tracących na wartości, bo sprzedanie ich oznaczałoby przyznanie się do straty.",
      "Często zostajemy nie dlatego, że nie widzimy sygnałów. Zostajemy dlatego, że widzimy je i jednocześnie boimy się tego, co jest po drugiej stronie. Wyjście ze związku to nie jest tylko utrata partnera. To jest utrata struktury, która organizuje twoje życie emocjonalne. Kogoś, od kogo się odbijasz, o kogo się martwisz, kogo próbujesz zrozumieć. I zostaje pytanie o to, kim jesteś bez tej relacji, czego chcesz, co możesz zbudować. To jest dla wielu osób znacznie trudniejsze niż kolejny rok w znajomym miejscu.",
      "Rozpoznanie, że związek nie ma przyszłości, nie jest kwestią zebrania wystarczającej liczby dowodów. Większość ludzi ma te dowody od dawna. Jest kwestią tego, żeby zobaczyć je bez filtrowania przez nadzieję, przez inwestycję emocjonalną, przez lęk przed tym, co po drugiej stronie.",
      "I to jest operacja, którą każdy musi przejść sam, na materiale swojej konkretnej relacji, nie na teoriach."
    ],
  },
];

const styles: Record<string, React.CSSProperties> = {
  section: {
    display: "block",
    clear: "both",
    width: "100%",
    marginTop: "64px",
    paddingBottom: "60px",
  },
  header: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: "28px",
    paddingBottom: "16px",
    borderBottom: `1px solid rgba(255,255,255,0.08)`,
  },
  headerLeft: {
    display: "flex",
    alignItems: "baseline",
    gap: "16px",
  },
  eyebrow: {
    fontSize: "11px",
    letterSpacing: "0.14em",
    color: BRAND.gold,
    fontWeight: 600,
    textTransform: "uppercase" as const,
  },
  headerTitle: {
    fontSize: "14px",
    color: BRAND.muted,
    fontWeight: 400,
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
    width: "100%",
  },
  card: {
    background: BRAND.panel,
    border: `1px solid ${BRAND.border}`,
    borderRadius: "12px",
    padding: "28px",
    cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s",
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    width: "100%",
  },
  cardKicker: {
    fontSize: "10px",
    letterSpacing: "0.16em",
    color: BRAND.gold,
    fontWeight: 600,
    textTransform: "uppercase" as const,
  },
  cardTitle: {
    fontSize: "17px",
    fontWeight: 600,
    color: BRAND.text,
    lineHeight: 1.4,
    margin: 0,
  },
  cardLead: {
    fontSize: "13px",
    color: BRAND.muted,
    lineHeight: 1.6,
    margin: 0,
  },
  cardArrow: {
    fontSize: "13px",
    color: BRAND.gold,
    marginTop: "auto",
    paddingTop: "12px",
    fontWeight: 500,
  },
  articleWrap: {
    background: BRAND.panelStrong,
    border: `1px solid ${BRAND.gold}`,
    borderRadius: "14px",
    padding: "40px",
    maxWidth: "720px",
    margin: "20px auto 0 auto",
  },
  articleBack: {
    background: "none",
    border: "none",
    color: BRAND.muted,
    fontSize: "13px",
    letterSpacing: "0.08em",
    cursor: "pointer",
    padding: "0",
    marginBottom: "28px",
    textTransform: "uppercase" as const,
  },
  articleKicker: {
    fontSize: "10px",
    letterSpacing: "0.18em",
    color: BRAND.gold,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    marginBottom: "12px",
  },
  articleTitle: {
    fontSize: "26px",
    fontWeight: 600,
    color: BRAND.text,
    lineHeight: 1.3,
    margin: "0 0 24px",
  },
  articleDivider: {
    width: "40px",
    height: "1px",
    background: BRAND.gold,
    margin: "0 0 28px",
    border: "none",
  },
  articlePara: {
    fontSize: "15px",
    lineHeight: 1.75,
    color: BRAND.muted,
    margin: "0 0 20px",
  },
  articleLeadPara: {
    fontSize: "16px",
    lineHeight: 1.75,
    color: BRAND.text,
    fontWeight: 500,
    margin: "0 0 28px",
  },
  separatorContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "36px 0",
    gap: "16px"
  },
  separatorLine: {
    flexGrow: 1,
    height: "1px",
    background: "linear-gradient(90deg, rgba(197,160,89,0) 0%, rgba(197,160,89,0.3) 50%, rgba(197,160,89,0) 100%)"
  },
  separatorSymbol: {
    color: BRAND.goldSoft,
    fontWeight: 600,
    fontSize: "1.4rem",
    fontFamily: "monospace"
  },
  questionBlock: {
    color: BRAND.goldSoft,
    fontSize: "15px",
    fontStyle: "italic",
    lineHeight: 1.75,
    marginBottom: "36px",
    backgroundColor: "rgba(197, 160, 89, 0.05)",
    padding: "24px",
    borderRadius: "8px",
    borderLeft: `3px solid ${BRAND.gold}`
  },
  articleCta: {
    marginTop: "44px",
    paddingTop: "32px",
    borderTop: `1px solid rgba(255,255,255,0.08)`,
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  },
  articleCtaText: {
    fontSize: "14px",
    color: BRAND.text,
    lineHeight: 1.6,
    margin: 0,
  },
};

export function ArticlesSection({ onStartAnalysis }: { onStartAnalysis: () => void }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const openArticle = ARTICLES.find((a) => a.slug === openSlug);

  return (
    <div style={styles.section}>
      <AnimatePresence mode="wait">

        {!openSlug && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div style={styles.header}>
              <div style={styles.headerLeft}>
                <span style={styles.eyebrow}>Ekspertyza</span>
                <p style={styles.headerTitle}>Mechanizmy, których nie widać z bliska</p>
              </div>
            </div>

            <div style={styles.grid}>
              {ARTICLES.map((article) => (
                <button
                  key={article.slug}
                  style={{
                    ...styles.card,
                    background: hoveredSlug === article.slug ? BRAND.panelStrong : BRAND.panel,
                    borderColor: hoveredSlug === article.slug ? "rgba(197,160,89,0.35)" : BRAND.border,
                    textAlign: "left",
                  }}
                  onClick={() => setOpenSlug(article.slug)}
                  onMouseEnter={() => setHoveredSlug(article.slug)}
                  onMouseLeave={() => setHoveredSlug(null)}
                >
                  <div style={styles.cardKicker}>{article.kicker}</div>
                  <h3 style={styles.cardTitle}>{article.title}</h3>
                  <p style={styles.cardLead}>{article.lead.slice(0, 130)}...</p>
                  <div style={styles.cardArrow}>Czytaj analizę →</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {openSlug && openArticle && (
          <motion.div
            key="article"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            <div style={styles.articleWrap}>
              <button
                style={styles.articleBack}
                onClick={() => setOpenSlug(null)}
              >
                ← Wróć do listy
              </button>

              <div style={styles.articleKicker}>{openArticle.kicker}</div>
              <h2 style={styles.articleTitle}>{openArticle.title}</h2>
              <div style={styles.articleDivider} />

              <p style={styles.articleLeadPara}>{openArticle.lead}</p>

              <div style={styles.separatorContainer}>
                <span style={styles.separatorLine}></span>
                <span style={styles.separatorSymbol}>{openArticle.breakSymbol}</span>
                <span style={styles.separatorLine}></span>
              </div>

              <div style={styles.questionBlock}>
                {openArticle.question}
              </div>

              {openArticle.body.map((para, i) => (
                <p key={i} style={styles.articlePara}>{para}</p>
              ))}

              <div style={styles.articleCta}>
                <p style={styles.articleCtaText}>
                  Ogólne schematy pozwalają nazwać problem, ale nie dają rozwiązań dla Twojej sytuacji. Jeśli chcesz zobaczyć, co naprawdę dzieje się w Twojej konkretnej relacji, nie w teorii, ale na podstawie faktów i zachowań:
                </p>
                <button
                  className="ctms-btn ctms-btn-primary"
                  onClick={onStartAnalysis}
                  style={{ alignSelf: "flex-start" }}
                >
                  Sprawdź swoją relację
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}