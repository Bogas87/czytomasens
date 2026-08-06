import React from "react";
import { motion } from "framer-motion";
import { ArticlesSection } from "../../ArticlesSection";
import { Kicker, PrimaryButton, Surface } from "./Layout";

const values = [
  ["01", "Empatia bez potakiwania", "Twój punkt widzenia jest traktowany poważnie, ale nie staje się automatycznie jedyną wersją wydarzeń."],
  ["02", "Fakty przed interpretacją", "Najpierw porządkujemy zachowania, słowa i kolejność zdarzeń. Dopiero później sprawdzamy ich możliwe znaczenie."],
  ["03", "Hipoteza i kontrhipoteza", "System pokazuje główne wyjaśnienie oraz najmocniejszą alternatywę, która może je uczciwie osłabić."],
  ["04", "Kryterium do sprawdzenia", "Pełna analiza kończy się konkretem: co musiałoby wydarzyć się dalej, żeby zmienić ocenę sytuacji."],
] as const;

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="ctms-home">
      <Surface className="ctms-hero">
        <div className="ctms-hero-main">
          <Kicker>PRYWATNA ANALIZA JEDNEJ RELACJI</Kicker>
          <div className="ctms-sequence" aria-label="Sposób analizy">
            <span>Zdarzenie</span><i>→</i><span>Interpretacja</span><i>→</i><span>Niewiadoma</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            Możesz mieć rację. <em>Najpierw sprawdźmy, na czym naprawdę opiera się ta ocena.</em>
          </motion.h1>
          <p>
            CzyToMaSens porządkuje to, co się wydarzyło, oddziela fakty od dopowiedzeń i pokazuje,
            czego nadal brakuje do uczciwego wniosku. Bez diagnozowania drugiej osoby i bez automatycznego przyznawania Ci racji.
          </p>
          <div className="ctms-hero-actions">
            <PrimaryButton onClick={onStart}>Sprawdź moją sytuację</PrimaryButton>
            <small>Bez konta. Jedna perspektywa. Jasno pokazane granice wiedzy.</small>
          </div>
        </div>

        <aside className="ctms-hero-proof" aria-label="Przykładowy fragment analizy">
          <div className="ctms-proof-head">
            <span>PRZYKŁADOWY ODCZYT</span>
            <strong>Nie zgadujemy intencji. Sprawdzamy, co potwierdza zachowanie.</strong>
          </div>
          <div className="ctms-proof-list">
            <article><b>01</b><div><span>CO SIĘ WYDARZYŁO</span><p>Od trzech tygodni kontakt inicjujesz głównie Ty.</p></div></article>
            <article><b>02</b><div><span>CO TEMU DOPISUJESZ</span><p>Brak działania tłumaczysz przeciążeniem i lękiem przed zaangażowaniem.</p></div></article>
            <article><b>03</b><div><span>CZEGO NIE WIEMY</span><p>Czy inicjatywa pojawi się bez Twojego kolejnego impulsu.</p></div></article>
          </div>
          <div className="ctms-proof-close">
            <span>NAJBLIŻSZY RUCH</span>
            <p>Sprawdzić zachowanie, którego nie prowadzisz za rękę.</p>
          </div>
        </aside>
      </Surface>

      <section className="ctms-values" aria-label="Najważniejsze cechy analizy">
        {values.map(([no, title, text], index) => (
          <motion.article
            key={no}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.035 }}
          >
            <span>{no}</span>
            <div><h2>{title}</h2><p>{text}</p></div>
          </motion.article>
        ))}
      </section>

      <Surface className="ctms-flow">
        <div>
          <Kicker>NIE KOŃCZYSZ Z KOLEJNĄ OPINIĄ</Kicker>
          <h2>Od opisu sytuacji do kryterium, które można sprawdzić w realnym życiu.</h2>
        </div>
        <ol>
          <li><span>01</span><div><strong>Porządkujemy materiał</strong><small>Co wydarzyło się konkretnie i co jest tylko interpretacją.</small></div></li>
          <li><span>02</span><div><strong>Sprawdzamy rozbieżności</strong><small>Gdzie Twoja ocena, zachowania i niewiedza nie mówią tego samego.</small></div></li>
          <li><span>03</span><div><strong>Ustalamy próbę rzeczywistości</strong><small>Co musi wydarzyć się dalej, żeby wzmocnić lub osłabić wniosek.</small></div></li>
        </ol>
      </Surface>

      <section className="v3-articles-home" aria-label="Poradniki o relacjach">
        <ArticlesSection
          onNavigateHome={() => { window.location.href = "/artykuly"; }}
          onNavigateArticle={(slug) => { window.location.href = `/artykuly/${slug}`; }}
          onStartAnalysis={onStart}
        />
      </section>
    </div>
  );
}
