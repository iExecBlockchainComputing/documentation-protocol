import Theme from 'vitepress/theme';
import Layout from './Layout.vue';
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client';
import '@shikijs/vitepress-twoslash/style.css';
import type { EnhanceAppContext } from 'vitepress';
import './style.css';
import './tailwind-output.css';
import googleAnalytics from 'vitepress-plugin-google-analytics';

declare global {
  interface Window {
    dataLayer: any[];
    axeptioSettings: {
      clientId: string;
      cookiesVersion: string;
    };
  }
}

export default {
  extends: Theme,
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    app.use(TwoslashFloatingVue as any);

    googleAnalytics({
      id: 'GTM-P7KSD4T',
    });
  },
};
