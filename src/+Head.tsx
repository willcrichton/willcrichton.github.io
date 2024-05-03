import React from "react";

import "./common.scss";
import biolinumR from "./fonts/LinBiolinum_R.woff2?url";
import libertineR from "./fonts/LinLibertine_R.woff2?url";
import libertineRI from "./fonts/LinLibertine_RI.woff2?url";

export let Head = () => (
  <>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    {[biolinumR, libertineR, libertineRI].map((url, i) => (
      <link
        key={i}
        rel="preload"
        as="font"
        href={url}
        crossOrigin="anonymous"
      />
    ))}
  </>
);
