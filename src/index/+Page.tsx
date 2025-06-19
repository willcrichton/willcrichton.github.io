import React, { useContext, useEffect, useMemo, useState } from "react";

import Blurb from "./Blurb.mdx";
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
import { IsMobileContext, useIsMobile } from "./components";
import { ResearchGarden } from "./garden/Garden";
import "./index.scss";
import { action } from "mobx";
import { observer, useLocalObservable } from "mobx-react";
import { POSTS, PostEntry } from "./Posts";
import { TALKS, TalkEntry } from "./Talks";

const linkDefs: React.FC<React.HTMLAttributes<HTMLAnchorElement>>[] = [
  props => (
    <a {...props} href="mailto:will_crichton@brown.edu">
      <span>✉️</span>
    </a>
  ),
  props => (
    <a {...props} href="https://github.com/willcrichton/">
      <img alt="Github" src={githubIconUrl} />
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

let useAnimation = (
  f: (delta: number) => void,
  deps?: React.DependencyList,
) => {
  useEffect(() => {
    let last = new Date().getTime();
    let req: number;
    function callback() {
      let current = new Date().getTime();
      let delta = current - last;
      last = current;
      f(delta);
      req = requestAnimationFrame(callback);
    }
    req = requestAnimationFrame(callback);
    return () => cancelAnimationFrame(req);
  }, deps);
};

let Headshot = observer(() => {
  let state = useLocalObservable(() => ({
    theta: Math.PI / 2,
    mouseOver: false,
    velocity: 0,
  }));

  useAnimation(
    action(delta => {
      if (state.mouseOver) state.velocity = state.velocity * 1.01 + 1;
      else state.velocity = Math.max(state.velocity * 0.97 - 5, 0);
      state.theta += state.velocity * delta * 1e-6;
    }),
    [],
  );

  let iconSize = 20;
  let r = 60 + iconSize / 2 + 7;
  let spacing = Math.PI / 8;
  let minTheta = state.theta - ((linkDefs.length - 1) / 2) * spacing;
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
        onMouseEnter={() => {
          state.mouseOver = true;
        }}
        onMouseLeave={() => {
          state.mouseOver = false;
        }}
      />
      {links}
    </div>
  );
});

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
      <Blurb />
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
    "gck:interactive-trait-debugger",
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

let CollapsibleList = ({ els }: { els: React.ReactElement[] }) => {
  let [expanded, setExpanded] = useState(false);
  return (
    <div className="collapsible-list">
      <ul>{expanded ? els : els.slice(0, 3)}</ul>
      <button type="button" onClick={() => setExpanded(!expanded)}>
        {expanded ? "Hide" : "See All"}
      </button>
    </div>
  );
};

let IndexContent = () => (
  <div className="main">
    <Header />
    <ResearchGarden />

    <section>
      <h1>Talks</h1>
      <CollapsibleList
        els={TALKS.map(talk => <TalkEntry talk={talk} key={talk.title} />)}
      />
    </section>

    <section>
      <h1>Posts</h1>
      <CollapsibleList
        els={POSTS.map(post => <PostEntry post={post} key={post.title} />)}
      />
    </section>

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
