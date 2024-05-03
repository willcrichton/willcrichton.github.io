import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({  
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
  },
  plugins: [react(), vike({ prerender: true }), mdx()]  
}));
