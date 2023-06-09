// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "ai-utils.js",
  tagline:
    "A TypeScript-first library for building AI apps, chatbots and agents.",
  // favicon: "img/favicon.ico",
  url: "https://ai-utils.js",
  baseUrl: "/",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "throw",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  markdown: {
    mermaid: true,
  },

  themes: ["@docusaurus/theme-mermaid"],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "api",
          path: "docs",
          sidebarPath: require.resolve("./sidebars.js"),
          lastVersion: "current",
          onlyIncludeVersions: ["current"],
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        routeBasePath: "concept",
        id: "concept",
        path: "concept",
        sidebarCollapsible: false,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        routeBasePath: "integration",
        id: "integration",
        path: "integration",
        sidebarCollapsible: false,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        routeBasePath: "recipe",
        id: "recipe",
        path: "recipe",
      },
    ],
    [
      "docusaurus-plugin-typedoc",
      {
        // typedoc options:
        entryPoints: ["../src/index.ts"],
        tsconfig: "../tsconfig.json",
        groupOrder: ["Functions", "Variables", "*"],
        name: "ai-utils.js",
        plugin: ["typedoc-plugin-zod"],
        excludePrivate: true,
        excludeProtected: true,
        sourceLinkTemplate:
          "https://github.com/lgrammel/ai-utils.js/tree/main/{path}#L{line}",

        // docusaurus options:
        out: ".",
        sidebar: {
          categoryLabel: "API",
          collapsed: false,
          fullNames: true,
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      // image: "img/docusaurus-social-card.jpg",
      navbar: {
        title: "ai-utils.js",
        items: [
          {
            to: "/concept/",
            label: "Concepts",
            activeBaseRegex: `/concept/`,
            sidebarId: "concept",
            position: "left",
          },
          {
            to: "/integration/model-provider/",
            label: "Integrations",
            activeBaseRegex: `/integration/model-provider/`,
            sidebarId: "integration",
            position: "left",
          },
          {
            to: "/recipe/",
            label: "Recipes & Prompts",
            activeBaseRegex: `/recipe/`,
            sidebarId: "recipe",
            position: "left",
          },
          {
            href: "https://github.com/lgrammel/ai-utils.js/tree/main/examples",
            label: "Examples",
          },
          {
            to: "/api/modules/",
            label: "API",
            activeBaseRegex: `/api/`,
            position: "left",
          },
          {
            href: "https://github.com/lgrammel/ai-utils.js",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Documentation",
            items: [
              {
                label: "Concepts",
                to: "/concept/",
              },
              {
                label: "Integrations",
                to: "/integration/model-provider/",
              },
              {
                label: "API",
                to: "/api/modules/",
              },
            ],
          },
          {
            title: "Learn",
            items: [
              {
                label: "Recipes & Prompts",
                to: "/recipe/",
              },
              {
                href: "https://github.com/lgrammel/ai-utils.js/tree/main/examples",
                label: "Examples",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Twitter",
                href: "https://twitter.com/lgrammel",
              },
              {
                label: "GitHub",
                href: "https://github.com/lgrammel/ai-utils.js",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Lars Grammel.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
