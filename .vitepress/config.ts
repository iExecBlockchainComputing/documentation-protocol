import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitepress';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { transformerTwoslash } from '@shikijs/vitepress-twoslash';
import { getSidebar } from './sidebar';
import { withMermaid } from 'vitepress-plugin-mermaid';

// https://vitepress.dev/reference/site-config
export default withMermaid(
  defineConfig({
    title: 'iExec protocol',
    description:
      'iExec is building the future of the Internet infrastructure by decentralizing the cloud computing market. It is the first blockchain-based cloud computing marketplace.',
    // Remove the trailing .html from URLs. Also needs the same option in vercel.json
    cleanUrls: true,
    lastUpdated: true,
    ignoreDeadLinks: true,
    markdown: {
      codeTransformers: [transformerTwoslash()],
      theme: {
        light: 'min-light',
        dark: 'vitesse-dark',
      },
    },
    head: [
      ['link', { rel: 'icon', href: '/Logo-RLC-Yellow.png' }],
      [
        'link',
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap',
        },
      ],
      [
        'script',
        {
          defer: '',
          src: 'https://widget.mava.app',
          'widget-version': 'v2',
          id: 'MavaWebChat',
          'enable-sdk': 'false',
          'data-token':
            '8e4e10aad5750451e8726768e8c639dae54f461beeb176f5ebd687371c9390f2',
        },
      ],
    ],
    themeConfig: {
      // https://vitepress.dev/reference/default-theme-config
      nav: [
        {
          text: 'For Developers',
          link: '/for-developers/quick-start-for-developers',
        },
        { text: 'For Workers', link: '/for-workers/quick-worker-start' },
        { text: 'Contact Us', link: '/help/contact-us' },
        { text: 'Tools', link: 'https://tools.docs.iex.ec/' },
      ],

      // Nav Table of Content on the right
      aside: true,
      outline: {
        level: [2, 3],
      },

      search: {
        provider: 'local',
      },
      sidebar: getSidebar(),
      logo: {
        light: '/Logo-RLC-Yellow.png',
        dark: '/Logo-RLC-Yellow.png',
        alt: 'iExec logo',
      },
      socialLinks: [
        { icon: 'github', link: 'https://github.com/iExecBlockchainComputing' },
        { icon: 'x', link: 'https://twitter.com/iEx_ec' },
        { icon: 'discord', link: 'https://discord.com/invite/pbt9m98wnU' },
      ],
      lastUpdated: {
        formatOptions: {
          dateStyle: 'medium',
        },
      },
      editLink: {
        pattern:
          'https://github.com/iExecBlockchainComputing/documentation-protocol/blob/main/:path',
        text: 'Suggest changes to this page',
      },
    },
    vite: {
      plugins: [
        AutoImport({
          include: [/\.vue$/, /\.md$/],
          resolvers: [ElementPlusResolver({ ssr: true })],
        }),
        Components({
          dirs: ['components'],
          include: [/\.vue$/, /\.md$/],
          resolvers: [ElementPlusResolver({ ssr: true })],
        }),
      ],
    },
  })
);
