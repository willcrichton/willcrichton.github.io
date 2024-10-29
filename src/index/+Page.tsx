import React, { useContext, useEffect, useMemo, useState } from "react";

import {
  ContextPanelView,
  PanelContext,
  useContextPanel,
} from "./ContextPanel";
import {
  BibEntryView,
  type BibtexEntry,
  Publications,
  PublicationsContext,
} from "./Publications";
import headshotUrl from "./assets/headshot-mini.jpg?url";
import githubIconUrl from "./assets/icon-github.png?url";
import mastodonIconUrl from "./assets/icon-mastodon.svg?url";
import twitterIconUrl from "./assets/icon-twitter.png?url";
import { IsMobileContext, Ref, useIsMobile } from "./components";
import { ResearchGarden } from "./garden/Garden";
import "./index.scss";

const linkDefs: React.FC<React.HTMLAttributes<HTMLAnchorElement>>[] = [
  props => (
    <a {...props} href="mailto:crichton.will@gmail.com">
      <span>✉️</span>
    </a>
  ),
  props => (
    <a {...props} href="https://github.com/willcrichton/">
      <img alt="Github" src={githubIconUrl} />
    </a>
  ),
  props => (
    <a {...props} href="https://twitter.com/tonofcrates">
      <img alt="Twitter" src={twitterIconUrl} />
    </a>
  ),
  props => (
    <a {...props} href="https://mastodon.social/@tonofcrates">
      <img alt="Mastodon" src={mastodonIconUrl} />
    </a>
  ),
  props => (
    <a
      {...props}
      href="https://willcrichton.net/assets/pdf/WillCrichton_CV.pdf"
    >
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
      centerTheta += delta ** 1.6 / 1e8;
      setCenterTheta(centerTheta);
      req = requestAnimationFrame(update);
    }
    req = requestAnimationFrame(update);
    return () => cancelAnimationFrame(req);
  }, [mouseOver]);

  let iconSize = 20;
  let r = 60 + iconSize / 2 + 7;
  let spacing = Math.PI / 8;
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
        alt="A headshot of Will"
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
        My goal is to empower people to use the full potential of computers
        through programming. To reach that potential, we need to combine a
        science of programming with a science of people. For me, these sciences
        are <em>programming language theory</em> and{" "}
        <em>cognitive psychology</em>, respectively. My research draws on these
        fields to make programming more usable, learnable, and powerful.
      </p>
      <p>
        In Fall 2025, I am starting as an assistant professor at Brown
        University, where I am founding the{" "}
        <a href="https://cel.cs.brown.edu/">Cognitive Engineering Lab</a>.{" "}
        <strong>I am recruiting PhD students!</strong> If you are considering my
        group, then talk contact
        me over email. Previously, I completed my PhD at Stanford, advised by{" "}
        <a href="https://amturing.acm.org/award_winners/hanrahan_4652251.cfm">
          Pat Hanrahan
        </a>{" "}
        and{" "}
        <a href="https://graphics.stanford.edu/~maneesh/">Maneesh Agrawala</a>.
        I am currently finishing up my postdoc at Brown with{" "}
        <a href="https://cs.brown.edu/~sk/">Shriram Krishnamurthi</a>.
      </p>
      <p>
        I do research primarily between{" "}
        <abbr title="Programming Languages">PL</abbr> and{" "}
        <abbr title="Human-Computer Interaction">HCI</abbr>. I build systems
        like{" "}
        <a href="https://github.com/willcrichton/flowistry/">program slicers</a>
        , <a href="https://nota-lang.org/">document languages</a>, and{" "}
        <a href="https://cognitive-engineering-lab.github.io/aquascope/">
          type system visualizers
        </a>
        . I develop theories like{" "}
        <Ref id="cah:wm-tracing">working memory for programmers</Ref>,{" "}
        <Ref id="ck:profiling-learning">
          psychometrics for programming languages
        </Ref>
        , and{" "}
        <Ref id="ck:document-calculus">
          type-safe templates for <span className="nobr">System F</span>
        </Ref>
        . I work on systems languages like <Ref id="sec-rust">Rust</Ref>, proof
        assistants like <Ref id="sec-proofs">Lean</Ref>, and <abbr>UI</abbr>{" "}
        tools like <Ref id="sec-browser">the browser</Ref>. My Rust research has
        been used by over 100,000 developers to date. My research garden (below)
        explains my current interests in greater detail.
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
        <button type="button" onClick={() => setShowAll(!showAll)}>
          {showAll ? "All" : "Selected"}
        </button>{" "}
        Publications
      </h1>
      <p>
        {showAll ? (
          <>
            This is an exhaustive list of my publications. Click the button
            above to see a selected subset.
          </>
        ) : (
          <>
            This is a representative set of my publications. Click the button
            above to see an exhaustive list.
          </>
        )}
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

export default () => {
  let panel = useContextPanel();
  let pubs = useMemo(() => new Publications(), []);
  let isMobile = useIsMobile();
  return (
    <IsMobileContext.Provider value={isMobile}>
      <PanelContext.Provider value={panel}>
        <PublicationsContext.Provider value={pubs}>
          <div className="frame">
            <IndexContent />
            <ContextPanelView />
          </div>
        </PublicationsContext.Provider>
      </PanelContext.Provider>
    </IsMobileContext.Provider>
  );
};
