import React from "react";

import { ContextAnchor, ContextLink } from "./ContextPanel";

export let Ref: React.FC<React.PropsWithChildren<{ id: string }>> = ({
  children,
  id,
}) => <a href={`#${id}`}>{children}</a>;

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
    summary={<ContextAnchor id={id}>{summary}</ContextAnchor>}
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
