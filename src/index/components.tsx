import exenv from "exenv";
import React, { useEffect, useMemo, useState } from "react";

import { ContextHeaderAnchor, ContextLink } from "./ContextPanel";

export let Ref: React.FC<
  React.PropsWithChildren<
    { id: string } & React.HTMLAttributes<HTMLAnchorElement>
  >
> = ({ children, id, ...props }) => (
  <a {...props} href={`#${id}`}>
    {children}
  </a>
);

export interface GardenSectionProps {
  id: string;
  summary: React.ReactNode;
}
export let GardenSection: React.FC<
  React.PropsWithChildren<GardenSectionProps>
> = ({ id, summary, children }) => (
  <ContextLink
    contextId={id}
    className="garden-header"
    summary={<ContextHeaderAnchor id={id}>{summary}</ContextHeaderAnchor>}
    contextTitle={summary}
  >
    {children}
  </ContextLink>
);

export interface CollapsibleAsideProps {
  summary: React.ReactNode;
}
export let CollapsibleAside: React.FC<
  React.PropsWithChildren<CollapsibleAsideProps>
> = ({ summary, children }) => (
  <aside>
    <details>
      <summary>{summary}</summary>
      <div>{children}</div>
    </details>
  </aside>
);

let getMobileCutoff = () => {
  if (!exenv.canUseDOM) return 0;
  let cutoffStr = getComputedStyle(document.body).getPropertyValue(
    "--mobile-cutoff",
  );
  return Number.parseFloat(cutoffStr.replace(/px$/, ""));
};

export let useIsMobile = () => {
  let mobileCutoff = useMemo(() => getMobileCutoff(), []);
  let [isMobile, setIsMobile] = useState(
    exenv.canUseDOM ? window.innerWidth <= mobileCutoff : true,
  );
  useEffect(() => {
    let onResize = () => setIsMobile(window.innerWidth <= mobileCutoff);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
};

export let IsMobileContext = React.createContext<boolean>(false);
