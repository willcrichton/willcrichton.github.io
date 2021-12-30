import { cli } from "@nota-lang/esbuild-utils";
import { sassPlugin } from "esbuild-sass-plugin";
import { nota_plugin } from "@nota-lang/nota-syntax/dist/esbuild-plugin.js";
import fs from "fs/promises";
import path from "path";

let ssr_plugin = {
  name: "ssr",
  setup(build) {
    build.onResolve({ filter: /\.html$/ }, (args) => ({
      path: args.path,
      namespace: "ssr",
    }));

    build.onLoad({ filter: /./, namespace: "ssr" }, (args) => {
      let { name, dir } = path.parse(args.path);
      let script = `./${name}.mjs`;
      let contents = `
      import React from "react";
      import ReactDOM from "react-dom";
      import Doc, {metadata} from "./${name}.nota"
      import { Template } from "./${path.relative(dir, "src")}/template";
      import { canUseDOM } from "exenv";

      export let Page = (props) => <Template {...props}><Doc /></Template>;

      export {metadata};
      export { default as React } from "react";
      export { default as ReactDOMServer } from "react-dom/server";
      
      if (canUseDOM) {
        ReactDOM.hydrate(<Page {...metadata} script={"${script}"} />, document.documentElement);
      }
      `;

      return { contents, loader: "jsx", resolveDir: path.dirname(args.path) };
    });

    build.onEnd((_) => {
      let entryPoints = build.initialOptions.entryPoints;
      entryPoints.forEach(async (p) => {
        let { name, dir } = path.parse(path.relative("src", p));
        let script = `./${name}.mjs`;

        let { Page, React, ReactDOMServer, metadata } = await import(
          "./" + path.join("dist", dir, name + ".mjs")
        );
        let content = ReactDOMServer.renderToString(
          React.createElement(Page, { script, ...metadata })
        );
        await fs.writeFile(
          path.join("dist", dir, name + ".html"),
          `<!DOCTYPE html><html lang="en">${content}</html>`
        );
      });
    });
  },
};

let build = cli();
build({
  entryPoints: ["src/index.html", "src/notes/programmers-brain-review.html"],
  preserveSymlinks: true,
  format: "esm",
  splitting: true,
  outExtension: { ".js": ".mjs" },
  plugins: [sassPlugin(), nota_plugin(), ssr_plugin],
});