import React, { useContext, useEffect, useMemo, useRef, useState } from "react";

import {
  ContextPanel,
  ContextPanelView,
  PanelContext,
  getMobileCutoff,
} from "./ContextPanel";
import {
  BibEntryView,
  BibtexEntry,
  Publications,
  PublicationsContext,
} from "./Publications";
import headshotUrl from "./assets/headshot-mini.jpg?url";
import githubIconUrl from "./assets/icon-github.png?url";
import twitterIconUrl from "./assets/icon-twitter.png?url";
import { ResearchGarden } from "./garden/Garden";
import "./index.scss";

const linkDefs: React.FC<React.HTMLAttributes<HTMLAnchorElement>>[] = [
  props => (
    <a {...props} href="mailto:wcrichto@brown.edu">
      <span>✉️</span>
    </a>
  ),
  props => (
    <a {...props} href="https://github.com/willcrichton/">
      <img src={githubIconUrl} />
    </a>
  ),
  props => (
    <a {...props} href="https://twitter.com/tonofcrates">
      <img src={twitterIconUrl} />
    </a>
  ),
  props => (
    <a {...props} href="https://willcrichton.net/assets/pdf/WillCrichton_CV.pdf">
      <span>
        <abbr>CV</abbr>
      </span>
    </a>
  ),
];
let Headshot = () => {
  let [mouseOver, setMouseOver] = useState<number | null>(null);
  let [centerTheta, setCenterTheta] = useState(Math.PI / 2);

  useEffect(() => {
    if (mouseOver === null) return;
    let req: number;
    function update() {
      let delta = new Date().getTime() - mouseOver!;
      centerTheta += Math.pow(delta, 1.6) / 1e8;
      setCenterTheta(centerTheta);
      req = requestAnimationFrame(update);
    }
    req = requestAnimationFrame(update);
    return () => cancelAnimationFrame(req);
  }, [mouseOver]);

  let iconSize = 20;
  let r = 60 + iconSize / 2 + 7;
  let spacing = Math.PI / 6;
  let minTheta = centerTheta - ((linkDefs.length - 1) / 2) * spacing;
  let centerX = 60;
  let centerY = 60;
  let links = linkDefs.map((Link, i) => {
    let theta = minTheta + spacing * i;
    let x = Math.cos(theta) * r + centerX - iconSize / 2;
    let y = Math.sin(theta) * r + centerY - iconSize / 2;
    return (
      <Link
        key={i}
        style={{
          left: `${x}px`,
          top: `${y}px`,
        }}
      />
    );
  });

  return (
    <div className="headshot">
      <img
        src={headshotUrl}
        onMouseEnter={() => setMouseOver(new Date().getTime())}
        onMouseLeave={() => setMouseOver(null)}
      />
      {links}
    </div>
  );
};

let Header = () => (
  <>
    <header>
      <Headshot />
      <div className="name">
        <span className="first">
          Will{" "}
          <span
            style={{ cursor: "help" }}
            title="I was destined to work on programming languages."
          >
            P.L.
          </span>
        </span>
        <br />
        <span>Crichton</span>
      </div>
      <div className="title">
        Assistant Professor <i>of</i>
        <br />
        Computer Science <i>at</i>
        <br />
        Brown University
      </div>
    </header>

    <div>
      <p>
        I want to empower people to use the full potential of computers, which
        today means through programming. To reach that potential, we need to
        combine a science of programming with a science of people. For me, these
        sciences are <em>programming language theory</em> and{" "}
        <em>cognitive psychology</em>, respectively. My research draws on these
        fields to make programming more usable, learnable, and powerful.
      </p>
      <p>
        I am starting as an assistant professor at Brown in Summer 2025.{" "}
        <strong>I am recruiting PhD students!</strong> If you are considering my
        group, then talk to me in-person at either <abbr>OOPSLA</abbr> 2024 or{" "}
        <abbr>UIST</abbr> 2024, or you can contact me over email.
      </p>
    </div>
  </>
);

let PubList = ({ entries }: { entries: BibtexEntry[] }) =>
  entries.map(entry => <BibEntryView key={entry.citationKey} entry={entry} />);

let PublicationsView = () => {
  let pubs = useContext(PublicationsContext)!;
  let [showAll, setShowAll] = useState(false);
  let allConf = pubs.entries.filter(entry => entry.isConference());
  let confSelections = [
    "ck:profiling-learning",
    "ck:document-calculus",
    "cgk:ownership-conceptual-model",
    "cpah:ownership-infoflow",
    "cah:wm-tracing",
  ].map(k => pubs.entry(k));
  let wsSelections = [
    "c:rust-design-patterns",
    "c:pl-medium",
    "c:docgen-infoviz",
    "c:pl-course",
  ].map(k => pubs.entry(k));
  let allWs = pubs.entries.filter(entry => entry.isWorkshop());
  let allDiss = pubs.entries.filter(entry => entry.isDissertation());

  return (
    <section className="selected-publications">
      <h1>
        <button onClick={() => setShowAll(!showAll)}>
          {showAll ? "All" : "Selected"}
        </button>{" "}
        Publications
      </h1>
      <p>
        Click the button above to see {showAll ? "a selected set" : "all"} of my
        publications.
      </p>
      <section>
        <h2>Conference Papers</h2>
        <PubList entries={showAll ? allConf : confSelections} />
      </section>
      <section>
        <h2>Workshop Papers</h2>
        <PubList entries={showAll ? allWs : wsSelections} />
      </section>
      {showAll ? (
        <section>
          <h2>Theses</h2>
          <PubList entries={allDiss} />
        </section>
      ) : null}
    </section>
  );
};

let IndexContent = () => (
  <div className="main">
    <Header />
    <ResearchGarden />
    <PublicationsView />
  </div>
);

let Index = () => {
  let panelRef = useRef(null);
  let [state] = useState(() => new ContextPanel(panelRef));
  let pubs = useMemo(() => new Publications(), []);
  return (
    <PanelContext.Provider value={state}>
      <PublicationsContext.Provider value={pubs}>
        <div className="frame">
          <IndexContent />
          <ContextPanelView />
        </div>
      </PublicationsContext.Provider>
    </PanelContext.Provider>
  );
};

export default () => {
  // Hack: reset the entire site when we get resized around the threshold for switching logics.
  let [key, setKey] = useState(0);
  let cutoff = getMobileCutoff();
  useEffect(() => {
    let lastWidth = window.innerWidth;
    function onResize() {
      if (lastWidth < cutoff !== window.innerWidth < cutoff) setKey(key + 1);
      lastWidth = window.innerWidth;
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [key]);
  return <Index key={key} />;
};
