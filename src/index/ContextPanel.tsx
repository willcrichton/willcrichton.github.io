import classNames from "classnames";
import exenv from "exenv";
import { action, makeAutoObservable } from "mobx";
import { observer } from "mobx-react";
import React, { useContext, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

import "./ContextPanel.scss";

export class ContextPanel {
  selected: string | null = null;

  constructor(readonly panelRef: React.RefObject<HTMLDivElement>) {
    makeAutoObservable(this);
  }

  toggle(key: string, changeHash: boolean) {
    if (changeHash) {
      let url = new URL(window.location.toString());
      let newHash = `#${key}`;
      if (url.hash !== newHash) {
        url.hash = newHash;
        window.history.pushState(null, "", url);
      }
    }

    this.selected = this.selected === key ? null : key;
  }

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
      ctx.toggle(id!, true);
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
    if (e.target instanceof HTMLElement && e.target === summaryRef.current!) {
      ctx.toggle(contextId, true);
    }
  };

  useEffect(() => {
    let onHashChange = (event: HashChangeEvent) => {
      let oldUrl = new URL(event.oldURL);
      let newUrl = new URL(event.newURL);
      if (newUrl.hash.slice(1) === contextId) ctx.toggle(contextId, false);
      else if (
        oldUrl.hash.slice(1) === contextId &&
        newUrl.hash.slice(1).length == 0
      )
        ctx.toggle(contextId, false);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [contextId]);

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
