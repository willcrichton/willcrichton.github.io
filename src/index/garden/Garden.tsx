import React from "react";

import Browser from "./Browser.mdx";
import Cognition from "./Cognition.mdx";
import Communication from "./Communication.mdx";
import Lean from "./Lean.mdx";
import Rust from "./Rust.mdx";
import Teaching from "./Teaching.mdx";

export let ResearchGarden = () => (
  <section className="research-garden">
    <h1>Research Garden</h1>
    <p>
      This is where I grow my ideas. Click on the sections that interest you.
    </p>
    <section>
      <div>
        <h2>Concepts</h2>
        <span>Research interests focused a broad vision for the future.</span>
      </div>
      <Cognition />
      <Communication />
      <Teaching />
    </section>
    <section>
      <div>
        <h2>Technologies</h2>
        <span>Research interests focused on a particular system.</span>
      </div>
      <Rust />
      <Browser />
      <Lean />
    </section>
  </section>
);
