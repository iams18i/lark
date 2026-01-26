import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Lark',
  tagline: 'Laravel-inspired CLI and Job Processing for TypeScript',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://lark.s18i.io',
  baseUrl: '/',

  organizationName: 'iams18i',
  projectName: 'lark',

  onBrokenLinks: 'throw',

  // SEO: Generate sitemap
  trailingSlash: false,

  markdown: {
    parseFrontMatter: async (params) => {
      const result = await params.defaultParseFrontMatter(params);
      return result;
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // SEO: Head tags for meta information
  headTags: [
    // SEO: Preconnect to external domains
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
    // SEO: DNS prefetch for npm
    {
      tagName: 'link',
      attributes: {
        rel: 'dns-prefetch',
        href: 'https://www.npmjs.com',
      },
    },
    // SEO: Structured data (JSON-LD)
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Lark',
        description: 'Laravel-inspired CLI and Job Processing framework for TypeScript. Build command-line applications with background job queues powered by Bull and Redis.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Cross-platform',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        author: {
          '@type': 'Organization',
          name: 's18i',
          url: 'https://github.com/iams18i',
        },
      }),
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/iams18i/lark/tree/main/apps/docs/',
          // SEO: Show last update time
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        // SEO: Sitemap configuration
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
        // SEO: Google Tag Manager (uncomment and add ID when ready)
        // gtag: {
        //   trackingID: 'G-XXXXXXXXXX',
        //   anonymizeIP: true,
        // },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // SEO: Social card image for link previews
    image: 'img/lark-social-card.jpg',
    
    // SEO: Meta description
    metadata: [
      {
        name: 'description',
        content: 'Lark is a Laravel-inspired CLI and job processing framework for TypeScript. Build powerful command-line applications with background job queues powered by Bull and Redis.',
      },
      {
        name: 'keywords',
        content: 'typescript, cli, command-line, jobs, queues, bull, redis, laravel, artisan, background-jobs, task-queue, nodejs, bun',
      },
      // SEO: Open Graph
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:site_name',
        content: 'Lark Documentation',
      },
      {
        property: 'og:locale',
        content: 'en_US',
      },
      // SEO: Twitter Card
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Lark - Laravel-inspired CLI and Job Processing for TypeScript',
      },
      {
        name: 'twitter:description',
        content: 'Build powerful CLI applications with background job queues. Inspired by Laravel Artisan.',
      },
      // SEO: Additional meta
      {
        name: 'author',
        content: 's18i',
      },
      {
        name: 'robots',
        content: 'index, follow',
      },
      {
        name: 'googlebot',
        content: 'index, follow',
      },
    ],

    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    
    // SEO: Algolia search (uncomment when configured)
    // algolia: {
    //   appId: 'YOUR_APP_ID',
    //   apiKey: 'YOUR_SEARCH_API_KEY',
    //   indexName: 'lark',
    //   contextualSearch: true,
    // },

    navbar: {
      title: 'Lark',
      logo: {
        alt: 'Lark - TypeScript CLI Framework Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://www.npmjs.com/package/@s18i/lark',
          label: 'npm',
          position: 'right',
          'aria-label': 'npm package',
        },
        {
          href: 'https://github.com/iams18i/lark',
          label: 'GitHub',
          position: 'right',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/getting-started/installation',
            },
            {
              label: 'Commands',
              to: '/lark/commands',
            },
            {
              label: 'Jobs & Queues',
              to: '/lark-jobs/overview',
            },
          ],
        },
        {
          title: 'Packages',
          items: [
            {
              label: '@s18i/lark',
              href: 'https://www.npmjs.com/package/@s18i/lark',
            },
            {
              label: '@s18i/lark-jobs',
              href: 'https://www.npmjs.com/package/@s18i/lark-jobs',
            },
            {
              label: 'create-lark',
              href: 'https://www.npmjs.com/package/create-@s18i/lark',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/iams18i/lark',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Lark. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
