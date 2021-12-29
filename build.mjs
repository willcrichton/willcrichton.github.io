import {cli, copy_plugin} from "@nota-lang/esbuild-utils";
import {sassPlugin} from "esbuild-sass-plugin";
import {nota_plugin} from "@nota-lang/nota-syntax/dist/esbuild-plugin.js";

let build = cli();
build({
  entryPoints: ['src/index.tsx'],
  preserveSymlinks: true,
  format: "iife",
  // splitting: true,
  plugins: [sassPlugin(), copy_plugin({extensions: ['.html']}), nota_plugin()]
})