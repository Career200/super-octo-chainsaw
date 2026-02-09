// @ts-check
import { defineConfig } from "astro/config";

import preact from "@astrojs/preact";

export const baseString = "/super-octo-chainsaw/";

// https://astro.build/config
export default defineConfig({
  site: "https://career200.github.io",
  base: baseString,
  integrations: [preact({ devtools: true })],
});