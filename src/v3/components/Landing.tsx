import React from "react";
import { Kicker } from "./Layout";
import "../../shared/product-consolidation.css";

const articleLinks = [
  {
    href: "/artykuly/czy-ten-zwiazek-ma-sens",
    title: "Czy ten związek ma jeszcze sens?",
    description: "Jak oddzielić pojedynczy kryzys od relacji, która od dawna nie daje Ci bezpieczeństwa.",
  },
  {
    href: "/artykuly/czy-warto-ratowac-zwiazek",
    title: "Czy warto ratować związek?",
    description: "Kiedy wysiłek jest wspólną pracą, a kiedy próbą utrzymania relacji w pojedynkę.",
  },
  {
    href: "/artykuly/czy-ona-on-sie-mna-bawi",
    title: "Mieszane sygnały w relacji",
    description: "Co naprawdę wynika z kontaktu, w którym bliskość przeplata się z dystansem.",
  },
];

const faqs = [
  {
    question: "Czy dostanę prostą odpowiedź: zostać czy odejść?",
    answer: "Nie. Dostaniesz uporządkowany obraz sytuacji i konkretne rzeczy, które warto jeszcze sprawdzić. Decyzja pozostaje po Twojej stronie.",
  },
  {
    question: "Czy analiza ocenia albo diagnozuje drugą osobę?",
    answer: "Nie. Pracujemy na zdarzeniach, zachowaniach, interpretacjach, emocjach i niewiadomych. Nie przypisujemy drugiej osobie diagnozy ani intencji jako faktu.",
  },
  {
    question: "Czym różni się analiza prywatna od Dwóch Spojrzeń?",
    answer: "W analizie prywatnej porządkujesz własną perspektywę. W Dwóch Spojrzeniach każde z Was odpowiada osobno, a później zestawiane są punkty wspólne, różnice i rzeczy nadal nierozstrzygnięte. Surowe odpowiedzi pozostają prywatne.",
  },
  {
    question: "Czy muszę podawać dane drugiej osoby?",
    answer: "Nie. Nie wpisuj nazwisk, adresów, numerów telefonu ani innych danych identyfikujących. Do analizy wystarcza opis sytuacji własnymi słowami.",
  },
];

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="ctms-landing ctms-landing-atelier">
      <section className="ctms-hero ctms-hero-atelier" aria-labelledby="ctms-hero-title">
        <div className="ctms-hero-copy">
          <Kicker>PRYWATNA PRZESTRZEŃ DO MYŚLENIA</Kicker>
          <h1 id="ctms-hero-title"><span>Co chcesz</span><br />dziś <em>zrozumieć?</em></h1>
          <p className="ctms-hero-lead">
            Kiedy emocje mieszają fakty z domysłami, łatwo zgubić własny punkt widzenia.
            Tutaj porządkujesz sytuację spokojnie — bez oceniania i bez udawania pewności.
          </p>

          <div className="ctms-mode-choice ctms-mode-choice-atelier" aria-label="Wybierz rodzaj analizy">
            <button className="ctms-mode-card ctms-mode-card-private" type="button" onClick={onStart}>
              <span className="ctms-mode-mark">DLA MNIE</span>
              <strong>Najpierw chcę zrozumieć własną perspektywę.</strong>
              <p>Prywatna analiza jednej historii. Bez udziału drugiej osoby.</p>
              <span className="ctms-mode-link">Rozpocznij prywatnie <i aria-hidden="true">→</i></span>
            </button>

            <a className="ctms-mode-card ctms-mode-card-couple" href="/dla-par">
              <span className="ctms-mode-mark">DLA NAS</span>
              <strong>Chcemy zobaczyć tę samą relację z dwóch stron.</strong>
              <p>Każde z Was odpowiada osobno. Surowe odpowiedzi pozostają prywatne.</p>
              <span className="ctms-mode-link">Rozpocznij dla dwojga <i aria-hidden="true">→</i></span>
            </a>
          </div>

          <div className="ctms-trustline" aria-label="Najważniejsze zasady">
            <span>bez publicznego profilu</span>
            <span>bez rejestracji</span>
            <span>pierwszy odczyt bezpłatny</span>
          </div>
        </div>

        <figure className="ctms-hero-human ctms-hero-human-atelier">
          <img
            src="/v3-assets/couple-editorial-premium.webp"
            alt="Dwie osoby stojące naprzeciw siebie w spokojnym, ciemnym wnętrzu"
            loading="eager"
            decoding="async"
          />
          <div className="ctms-hero-photo-wash" aria-hidden="true" />
          <figcaption>
            <span>RELACJA RZADKO MA TYLKO JEDNĄ WERSJĘ</span>
            <strong>Nie szukamy winnego. Szukamy tego, co można zobaczyć wyraźniej.</strong>
            <p>Fakt, znaczenie, emocja i niewiadoma to nie to samo.</p>
          </figcaption>
        </figure>
      </section>

      <section className="ctms-manifesto" aria-label="Zasada CzyToMaSens">
        <span className="ctms-manifesto-index">01</span>
        <p>Najpierw <em>zobacz</em>. Potem nazwij. Dopiero na końcu decyduj.</p>
      </section>

      <section className="ctms-method ctms-method-atelier" id="jak-dziala" aria-labelledby="ctms-method-title">
        <div className="ctms-method-heading">
          <Kicker>JAK PRACUJEMY</Kicker>
          <h2 id="ctms-method-title">Mniej etykiet. Więcej rzeczy, które da się sprawdzić.</h2>
          <p>Jedna sytuacja może wyglądać inaczej, kiedy oddzielisz to, co się wydarzyło, od tego, co temu przypisujesz.</p>
        </div>
        <div className="ctms-method-steps">
          <article className="ctms-method-step">
            <span className="ctms-method-number">01</span>
            <div><h3>Zdarzenie</h3><p>Co dokładnie się wydarzyło, w jakiej kolejności i jak często wraca.</p></div>
          </article>
          <article className="ctms-method-step">
            <span className="ctms-method-number">02</span>
            <div><h3>Znaczenie</h3><p>Co temu nadajesz, co temu przeczy i czego nadal po prostu nie wiadomo.</p></div>
          </article>
          <article className="ctms-method-step">
            <span className="ctms-method-number">03</span>
            <div><h3>Sprawdzenie</h3><p>Jakie zachowanie pokaże zmianę albo powrót starego wzorca.</p></div>
          </article>
        </div>
      </section>

      <section className="ctms-reading-room ctms-reading-room-atelier" aria-labelledby="ctms-reading-room-title">
        <div className="ctms-reading-room-visual" aria-hidden="true">
          <span className="ctms-orbit ctms-orbit-one" />
          <span className="ctms-orbit ctms-orbit-two" />
          <b>fakt</b>
          <i>znaczenie</i>
        </div>
        <div className="ctms-reading-room-copy">
          <Kicker>NA KONKRECIE</Kicker>
          <h2 id="ctms-reading-room-title">„On mnie ignoruje” to wniosek. Najpierw zobaczmy, co naprawdę się wydarzyło.</h2>
          <p>Jedno zdanie potrafi mieszać obserwację, interpretację i przewidywanie. Rozdzielenie ich często zmienia obraz całej sytuacji.</p>
          <dl>
            <div><dt>Zdarzenie</dt><dd>Kontakt wrócił dopiero po Twojej kolejnej wiadomości.</dd></div>
            <div><dt>Interpretacja</dt><dd>„Relacja utrzymuje się głównie dzięki mojej inicjatywie”.</dd></div>
            <div><dt>Niewiadoma</dt><dd>Czy to stały brak inicjatywy, czy reakcja na konkretny konflikt?</dd></div>
            <div><dt>Co sprawdzić</dt><dd>Czy własny ruch pojawi się bez kolejnego impulsu z Twojej strony.</dd></div>
          </dl>
        </div>
      </section>

      <section className="ctms-offer ctms-offer-atelier" id="raport" aria-labelledby="ctms-offer-title">
        <div className="ctms-offer-intro">
          <Kicker>NAJPIERW WARTOŚĆ</Kicker>
          <h2 id="ctms-offer-title">Sprawdź, czy ten sposób myślenia naprawdę Ci pomaga.</h2>
          <p>Pierwszy odczyt ma już uporządkować sytuację. Pełny raport jest kolejnym poziomem pracy, nie opłatą za dokończenie zdania.</p>
        </div>
        <div className="ctms-offer-columns">
          <div className="ctms-offer-free">
            <span className="ctms-offer-label">PIERWSZY ODCZYT</span>
            <h3>Krótko, ale konkretnie.</h3>
            <ul className="ctms-offer-list">
              <li>sedno sytuacji i główny sygnał;</li>
              <li>najważniejsza niewiadoma;</li>
              <li>jedno kryterium sprawdzenia;</li>
              <li>pierwszy fragment uporządkowanej mapy.</li>
            </ul>
          </div>
          <div className="ctms-offer-premium">
            <span className="ctms-offer-label">PEŁNY RAPORT</span>
            <h3>Głębiej, kiedy tego potrzebujesz.</h3>
            <ul className="ctms-offer-list">
              <li>co wspiera Twój obecny odczyt;</li>
              <li>co może go osłabić;</li>
              <li>gdzie kończy się fakt, a zaczyna dopowiedzenie;</li>
              <li>co sprawdzić w zachowaniu, nie w deklaracjach.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="ctms-guides ctms-guides-atelier" aria-labelledby="ctms-guides-title">
        <div className="ctms-section-head">
          <Kicker>PORADNIKI</Kicker>
          <h2 id="ctms-guides-title">Teksty do spokojnego myślenia. Bez gotowych recept.</h2>
        </div>
        <div className="ctms-guides-grid ctms-guides-grid-editorial">
          {articleLinks.map((article, index) => (
            <a key={article.href} href={article.href}>
              <span className="ctms-guide-index">0{index + 1}</span>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <span className="ctms-guide-link">Czytaj <i aria-hidden="true">→</i></span>
            </a>
          ))}
        </div>
      </section>

      <section className="ctms-final-callout">
        <div>
          <Kicker>JEDEN KROK NA RAZ</Kicker>
          <h2>Nie potrzebujesz dziś odpowiedzi na całe życie.</h2>
          <p>Czasem wystarczy zobaczyć jedną rzecz wyraźniej niż wczoraj.</p>
        </div>
        <button type="button" onClick={onStart}>Rozpocznij prywatną analizę <span aria-hidden="true">→</span></button>
      </section>

      <section className="ctms-faq" aria-labelledby="ctms-faq-title">
        <div className="ctms-section-head">
          <Kicker>PRZED ANALIZĄ</Kicker>
          <h2 id="ctms-faq-title">Jasne zasady przed wpisaniem osobistej historii.</h2>
        </div>
        <div className="ctms-faq-grid">
          {faqs.map((item) => (
            <details key={item.question}>
              <summary>{item.question}<span aria-hidden="true">+</span></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
