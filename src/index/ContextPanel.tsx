import classNames from "classnames";
import { action, makeAutoObservable } from "mobx";
import { observer } from "mobx-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import "./ContextPanel.scss";
import { IsMobileContext, Ref } from "./components";

export class ContextPanel {
  selected: string | null = null;

  constructor(
    readonly panelRef: React.MutableRefObject<HTMLDivElement | null>,
  ) {
    makeAutoObservable(this);
  }

  updateSelection = action((url: string) => {
    let id = new URL(url).hash.slice(1);
    this.selected = id !== "" ? id : null;
  });

  createPortal = (child: React.ReactNode) =>
    createPortal(child, this.panelRef.current!);
}

export let useContextPanel = () => {
  let panelRef = useRef<HTMLDivElement>(null);
  let [panel] = useState(() => new ContextPanel(panelRef));
  useEffect(() => {
    panel.updateSelection(window.location.href);
    let onHashChange = (event: HashChangeEvent) =>
      panel.updateSelection(event.newURL);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return panel;
};

export let PanelContext = React.createContext<ContextPanel | undefined>(
  undefined,
);

export let ContextPanelView = observer(() => {
  let ctx = useContext(PanelContext)!;
  let isMobile = useContext(IsMobileContext);
  let style = {
    display: !isMobile && ctx.selected !== null ? "block" : "none",
  };
  return <div ref={ctx.panelRef} className="window" style={style} />;
});

export let ContextAnchor: React.FC<React.PropsWithChildren<{ id: string }>> =
  observer(({ children, id }) => {
    let ctx = useContext(PanelContext);
    if (!ctx) return null;

    let isMobile = useContext(IsMobileContext);
    let selected = ctx.selected === id;
    let className = classNames("context-anchor", { selected });
    let hash = `#${id}`;
    if (isMobile) {
      return (
        <span className={className} id={id}>
          {children}
        </span>
      );
    } else {
      return (
        <a
          id={id}
          href={hash}
          className={className}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            let oldURL = window.location.href;
            let newURL = new URL(window.location.href);
            if (window.location.hash === hash) {
              newURL.hash = "";
            } else {
              newURL.hash = hash;
            }
            window.history.pushState({}, "", newURL);
            window.dispatchEvent(
              new HashChangeEvent("hashchange", {
                oldURL,
                newURL: newURL.href,
              }),
            );
          }}
        >
          {children}
        </a>
      );
    }
  });

export let ContextHeaderAnchor: React.FC<
  React.PropsWithChildren<{ id: string }>
> = ContextAnchor;

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
  let ctx = useContext(PanelContext);
  if (!ctx) return null;

  let currentlySelected = ctx.selected === contextId;
  let isMobile = useContext(IsMobileContext);

  if (isMobile) {
    return (
      <details
        {...attrs}
        className={classNames("context-link", attrs.className)}
        open={currentlySelected}
      >
        <summary>{summary}</summary>
        <div className="inline-content">{children}</div>
      </details>
    );
  } else {
    return (
      <div className={classNames("context-link", attrs.className)}>
        <div className={classNames("summary", { selected: currentlySelected })}>
          {summary}
        </div>
        {currentlySelected &&
          ctx.createPortal(
            <>
              {contextTitle}
              {children}
            </>,
          )}
      </div>
    );
  }
});
