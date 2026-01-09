import React, { useEffect } from "react";
import type { Config } from "vike/types";

export let Layout: Config["Layout"] = ({ children }) => {
  useEffect(() => {
    let isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
    let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isFirefox) document.documentElement.classList.add("firefox");
    if (isSafari) document.documentElement.classList.add("safari");
  }, []);
  return <div id="root">{children}</div>;
};
