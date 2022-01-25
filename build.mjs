import { cli, is_main, ssr_plugin } from "@nota-lang/esbuild-utils";
import { nota_plugin } from "@nota-lang/nota-syntax/dist/esbuild-plugin.js";
import config from "./nota.config.mjs";

if (is_main(import.meta)) {
  let build = cli();
  build({
    entryPoints: ["src/index.html", "src/notes/programmers-brain-review.html"],
    preserveSymlinks: true,
    format: "esm",
    splitting: true,
    outExtension: { ".js": ".mjs" },
    plugins: [
      nota_plugin(),
      ssr_plugin({ template: "src/template.tsx" }),
      ...config.plugins,
    ],
  });
}
