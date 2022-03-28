import { cli, isMain, ssrPlugin } from "@nota-lang/esbuild-utils";
import { notaPlugin } from "@nota-lang/nota-syntax/dist/esbuild-plugin.js";
import config from "./nota.config.mjs";

if (isMain(import.meta)) {
  let build = cli();
  build({
    entryPoints: ["src/index.html", "src/notes/programmers-brain-review.html"],
    preserveSymlinks: true,
    format: "esm",
    splitting: true,
    outExtension: { ".js": ".mjs" },
    plugins: [
      notaPlugin(),
      ssrPlugin({ template: "src/template.tsx" }),
      ...config.plugins,
    ],
  });
}
