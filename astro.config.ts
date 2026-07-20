import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import expressiveCode from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import config from "./astro-paper.config";
import rehypeExternalLinks from "rehype-external-links";
import remarkDirective from "remark-directive";
import remarkCalloutDirectives from "@microflash/remark-callout-directives";
import githubCalloutOptions from "@microflash/remark-callout-directives/config/github";

export default defineConfig({
  site: config.site.url,
  prefetch: {
    prefetchAll: true,
  },
  integrations: [
    expressiveCode({
      themes: ["github-light", "github-dark"],
      themeCssSelector: theme =>
        `[data-theme="${theme.name === "github-dark" ? "dark" : "light"}"]`,
      useDarkModeMediaQuery: false,
      plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
      styleOverrides: {
        uiFontFamily: "var(--font-app)",
        codeFontFamily: "var(--font-code)",
      },
    }),
    mdx(),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !page.endsWith("/archives/"),
    }),
  ],
  i18n: {
    locales: ["en", "zh-CN"],
    defaultLocale: "zh-CN",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkDirective,
        [remarkCalloutDirectives, githubCalloutOptions],
        [
          remarkToc,
          {
            heading: "(Table of contents|目录)",
          },
        ],
        [
          remarkCollapse,
          { test: /^(Table of contents|目录)$/i, summary: () => "点击展开" },
        ],
      ],
      rehypePlugins: [
        [
          rehypeExternalLinks,
          {
            target: "_blank",
          },
        ],
      ],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "Inter",
      cssVariable: "--font-inter",
      provider: fontProviders.google(),
      fallbacks: [],
      // optimizedFallbacks: false,
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
    },
    {
      name: "MiSans",
      provider: fontProviders.local(),
      cssVariable: "--font-misans",
      options: {
        variants: [
          {
            weight: "400",
            style: "normal",
            src: ["./src/assets/fonts/MiSans/MiSans-Regular.otf"],
          },
          {
            weight: "700",
            style: "normal",
            src: ["./src/assets/fonts/MiSans/MiSans-Bold.otf"],
          },
        ],
      },
    },
    {
      name: "Cascadia Code",
      provider: fontProviders.google(),
      cssVariable: "--font-cascadia-code",
      styles: ["normal"],
      optimizedFallbacks: false,
      fallbacks: [],
      featureSettings: '"liga" 1',
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
