import React from "react";

export let Layout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div id="root">{children}</div>
);
