import React from "react";
import { motion } from "framer-motion";
import { ArticlesSection } from "../../ArticlesSection";
import { Kicker, PrimaryButton, Surface } from "./Layout";

const pillars = [
  {
    no: "01",
    title: "Empatia bez przytakiwania",
    text: "Twój punkt widzenia jest traktowany poważnie, ale nie staje się automatycznie jedyną wersją wydarzeń.",
  },
  {
    no: "02",
    title: "Fakty oddzielone od znaczeń",
    text: "System rozdziela zdarzenia, emocje, interpretacje i niewiadome, zamiast mieszać je w jeden werdykt.",
  },
  {
    no: "03",
    title: "Hipoteza i kontrhipoteza",
    text: "Otrzymujesz główne wyjaśnienie oraz najlepszą alternatywę, która może je uczciwie osłabić.",
  },
  {
    no: "04",
    title: "Sprawdzenie w rzeczywistości",
    text: "Pełna analiza kończy się konkretnym kryterium i bezpiecznym sposobem sprawdzenia, co rzeczywiście się zmienia.",
  },
];

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <>
      <div className="v3-hero">
        <Surface className="v3-hero-copy">
          <Kicker>PRYWATNA ANALIZA JEDNEJ RELACJI</Kicker>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            Nie potrzebujesz kolejnej opinii.
            <span> Potrzebujesz sprawdzić, co naprawdę się powtarza.</span>
          </motion.h1>
          <p className="v3-hero-lead">
            CzyToMaSens porządkuje opisane zdarzenia, oddziela je od interpretacji i pokazuje,
            czego nadal brakuje do uczciwego wniosku. Bez diagnozowania drugiej osoby i bez przyznawania Ci racji z automatu.
          </p>
          <div className="v3-hero-actions">
            <PrimaryButton onClick={onStart}>Rozpocznij analizę mojej sytuacji</PrimaryButton>
            <small>Bez konta. Odpowiedzi nie są publikowane. Analiza opiera się na jednej perspektywie.</small>
          </div>
          <div className="v3-hero-trust" aria-label="Najważniejsze zasady">
            <span>Fakty</span>
            <span>Kontrargument</span>
            <span>Granice niewiedzy</span>
          </div>
        </Surface>

        <Surface className="v3-hero-mirror" aria-label="Przykładowy sposób analizy">
          <div className="v3-mirror-head">
            <span>JAK WYGLĄDA PIERWSZY ODCZYT</span>
            <strong>Nie rozstrzygamy intencji. Sprawdzamy, co potwierdza zachowanie.</strong>
          </div>
          <div className="v3-mirror-reading">
            <article>
              <span>ZDARZENIE</span>
              <p>Od trzech tygodni kontakt inicjujesz głównie Ty.</p>
            </article>
            <article>
              <span>ZNACZENIE, KTÓRE TEMU NADAJESZ</span>
              <p>Brak działania tłumaczysz przeciążeniem i lękiem przed zaangażowaniem.</p>
            </article>
            <article>
              <span>NIEWIADOMA</span>
              <p>Nie wiadomo, czy inicjatywa pojawi się bez Twojego kolejnego impulsu.</p>
            </article>
          </div>
          <div className="v3-mirror-close">
            <span>NAJWAŻNIEJSZY RUCH</span>
            <p>Nie musisz dziś zgadywać, co druga osoba czuje. Potrzebujesz sprawdzić zachowanie, którego nie prowadzisz za rękę.</p>
          </div>
        </Surface>
      </div>

      <section className="v3-pillars" aria-label="Cztery filary analizy">
        {pillars.map((pillar, index) => (
          <motion.article
            key={pillar.no}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ delay: index * 0.04 }}
          >
            <span>{pillar.no}</span>
            <h2>{pillar.title}</h2>
            <p>{pillar.text}</p>
          </motion.article>
        ))}
      </section>

      <Surface className="v3-loop-promise">
        <div>
          <Kicker>NIE KOŃCZYSZ Z KOLEJNĄ OPINIĄ</Kicker>
          <h2>Analiza prowadzi od opisu sytuacji do kryterium, które można sprawdzić w realnym życiu.</h2>
          <p>
            Najpierw porządkujemy materiał. Potem pokazujemy, co przemawia za główną wersją,
            co ją osłabia i jakie zachowanie pozwoli odróżnić zmianę od kolejnej obietnicy.
          </p>
        </div>
        <ol>
          <li><span>1</span><div><strong>Zdarzenia</strong><small>Co dałoby się zobaczyć, usłyszeć lub umieścić na osi czasu.</small></div></li>
          <li><span>2</span><div><strong>Rozbieżności</strong><small>Gdzie znaczenie, opisany materiał i niewiedza nie mówią tego samego.</small></div></li>
          <li><span>3</span><div><strong>Sprawdzenie</strong><small>Co musiałoby wydarzyć się dalej, żeby uczciwie zmienić ocenę.</small></div></li>
        </ol>
      </Surface>

      <section className="v3-articles-home" aria-label="Poradniki o relacjach">
        <ArticlesSection
          onNavigateHome={() => { window.location.href = "/artykuly"; }}
          onNavigateArticle={(slug) => { window.location.href = `/artykuly/${slug}`; }}
          onStartAnalysis={onStart}
        />
      </section>
    </>
  );
}
