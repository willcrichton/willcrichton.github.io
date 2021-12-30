import React from "react";

export let Template = ({ title, script, children }) => (
  <>
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="true"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Cabin:ital,wght@0,400;0,700;1,400&family=Expletus+Sans:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <link href="index.css" rel="stylesheet" />
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title}</title>
    </head>
    <body>
      {children}
      <script src={script} type="module"></script>
    </body>
  </>
);
