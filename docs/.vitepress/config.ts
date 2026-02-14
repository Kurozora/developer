import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Kurozora Developer',
  description: 'Official developer documentation for the Kurozora platform — API, SDKs, and integration guides.',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#FF9300' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Kurozora Developer' }],
    ['meta', { property: 'og:description', content: 'Build powerful apps with the Kurozora API and SDKs.' }],
    ['meta', { property: 'og:url', content: 'https://developer.kurozora.app' }],
  ],

  themeConfig: {
    logo: '/KurozoraKit.png',
    siteTitle: 'Kurozora Developer',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      {
        text: 'API',
        items: [
          { text: 'Overview', link: '/api/' },
          {
            text: 'Full Reference',
            link: 'https://api.kurozora.app/v1/',
            target: '_blank',
          },
        ],
      },
      {
        text: 'SDKs',
        items: [
          { text: 'KurozoraKit (Swift)', link: '/sdk-swift/' },
          { text: 'KurozoraKit (Kotlin)', link: '/sdk-kotlin/' },
        ],
      },
      {
        text: 'Resources',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Contributing', link: '/contributing' },
          { text: 'Community', link: '/community' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Architecture Overview', link: '/guide/architecture' },
            { text: 'Platform Support', link: '/guide/platforms' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'Kurozora API',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Authentication', link: '/api/authentication' },
            { text: 'Rate Limiting', link: '/api/rate-limiting' },
            { text: 'Pagination', link: '/api/pagination' },
          ],
        },
      ],
      '/sdk-swift/': [
        {
          text: 'KurozoraKit (Swift)',
          items: [
            { text: 'Overview', link: '/sdk-swift/' },
            { text: 'Installation', link: '/sdk-swift/installation' },
            { text: 'Configuration', link: '/sdk-swift/configuration' },
            { text: 'Authentication', link: '/sdk-swift/authentication' },
          ],
        },
        {
          text: 'Reference',
          items: [
            {
              text: 'Full API Reference (Jazzy)',
              link: '/jazzy-swift/index.html',
              target: '_blank',
            },
          ],
        },
      ],
      '/sdk-kotlin/': [
        {
          text: 'KurozoraKit (Kotlin)',
          items: [
            { text: 'Overview', link: '/sdk-kotlin/' },
            { text: 'Installation', link: '/sdk-kotlin/installation' },
            { text: 'Quick Start', link: '/sdk-kotlin/quickstart' },
            { text: 'Configuration', link: '/sdk-kotlin/configuration' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Architecture', link: '/sdk-kotlin/architecture' },
            { text: 'Builder Pattern', link: '/sdk-kotlin/builder-pattern' },
            { text: 'Result Handling', link: '/sdk-kotlin/result-handling' },
            { text: 'Error Handling', link: '/sdk-kotlin/error-handling' },
            { text: 'Authentication', link: '/sdk-kotlin/authentication' },
            { text: 'Platform Configuration', link: '/sdk-kotlin/platform' },
          ]
        },
        {
          text: 'Reference',
          items: [
            {
              text: 'Full API Reference (Dokka)',
              link: '/dokka-kotlin/index.html',
              target: '_blank',
            },
          ],
        },
      ],
      '/changelog': [
        {
          text: 'Resources',
          items: [
            { text: 'Changelog', link: '/changelog' },
            { text: 'Contributing', link: '/contributing' },
            { text: 'Community', link: '/community' },
          ],
        },
      ],
      '/contributing': [
        {
          text: 'Resources',
          items: [
            { text: 'Changelog', link: '/changelog' },
            { text: 'Contributing', link: '/contributing' },
            { text: 'Community', link: '/community' },
          ],
        },
      ],
      '/community': [
        {
          text: 'Resources',
          items: [
            { text: 'Changelog', link: '/changelog' },
            { text: 'Contributing', link: '/contributing' },
            { text: 'Community', link: '/community' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Kurozora' },
      { icon: 'discord', link: 'https://discord.gg/IijDhE6' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2018-present Kurozora',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/Kurozora/developer/edit/master/docs/:path',
      text: 'Edit this page on GitHub',
    },

    lastUpdated: {
      text: 'Last updated',
    },
  },
  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
    lineNumbers: true,
  },
})
