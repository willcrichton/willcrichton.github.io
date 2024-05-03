import classNames from "classnames";
import exenv from "exenv";
import { action, makeAutoObservable } from "mobx";
import { observer } from "mobx-react";
import React, { useContext, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

import "./ContextPanel.scss";

export class ContextPanel {
  selected: string | null = null;

  constructor(readonly panelRef: React.RefObject<HTMLDivElement>) {
    makeAutoObservable(this);
  }

  toggle = action((key: string) => {
    this.selected = this.selected === key ? null : key;
  });

  isSelected = (key: string | null) =>
    this.selected !== null && this.selected === key;

  createPortal = (child: React.ReactNode) =>
    createPortal(child, this.panelRef.current!);
}

export let PanelContext = React.createContext<ContextPanel | undefined>(
  undefined
);

export let ContextPanelView = observer(() => {
  let ctx = useContext(PanelContext)!;
  let style = {
    display: ctx.selected !== null ? "block" : "none",
  };
  return <div ref={ctx.panelRef} className="window" style={style}></div>;
});

export let getMobileCutoff = () => {
  if (!exenv.canUseDOM) return 0;
  let cutoffStr = getComputedStyle(document.body).getPropertyValue(
    "--mobile-cutoff"
  );
  return parseFloat(cutoffStr.replace(/px$/, ""));
};

export let ContextAnchor: React.FC<React.PropsWithChildren<{ id: string }>> =
  observer(({ children, id }) => {
    let ctx = useContext(PanelContext)!;
    let mobileCutoff = useMemo(() => getMobileCutoff(), []);
    let onClick: React.MouseEventHandler = () => {
      if (window.innerWidth <= mobileCutoff) return;
      ctx.toggle(id!);
    };
    let selected = ctx.isSelected(id);
    return (
      <div
        id={id}
        onClick={onClick}
        className={classNames("context-anchor", { selected })}
      >
        {children}
      </div>
    );
  });

export interface ContextLinkProps {
  summary: React.ReactNode;
  contextId: string;
  contextTitle: React.ReactNode;
}
export let ContextLink: React.FC<
  React.PropsWithChildren<
    ContextLinkProps & React.HTMLAttributes<HTMLDetailsElement>
  >
> = observer(({ summary, contextTitle, children, contextId, ...attrs }) => {
  let ctx = useContext(PanelContext)!;
  let summaryRef = useRef<HTMLElement>(null);
  let selected = ctx.isSelected(contextId);
  let mobileCutoff = useMemo(() => getMobileCutoff(), []);
  let onClickSummary: React.MouseEventHandler = e => {
    if (window.innerWidth <= mobileCutoff) return;
    if (e.target instanceof HTMLElement && e.target.closest("a") !== null)
      return;
    e.preventDefault();
    if (e.target instanceof HTMLElement && e.target === summaryRef.current!)
      ctx.toggle(contextId);
  };

  return (
    <details {...attrs} className={classNames("context-link", attrs.className)}>
      <summary ref={summaryRef} onClick={onClickSummary}>
        {summary}
      </summary>
      {selected ? (
        ctx.createPortal(
          <>
            {contextTitle}
            {children}
          </>
        )
      ) : (
        <div className="inline-content">{children}</div>
      )}
    </details>
  );
});
