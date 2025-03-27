import type { DefaultTheme } from 'vitepress';

export function getSidebar() {
  return {
    '/': [
      {
        text: 'iExec Technical Documentation',
        link: '/index',
        items: [],
      },
      {
        text: 'For Developers',
        items: [
          {
            text: 'Quick Start',
            link: '/for-developers/quick-start-for-developers',
          },
          {
            text: 'Build your first application',
            link: '/for-developers/your-first-app',
          },
          {
            text: 'Build Confidential Computing app',
            link: '/for-developers/confidential-computing/intel-sgx-technology',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/for-developers/confidential-computing/intel-sgx-technology',
              },
              {
                text: 'Build your first application with Scone framework',
                link: '/for-developers/confidential-computing/create-your-first-sgx-app',
              },
              {
                text: 'Access confidential assets',
                link: '/for-developers/confidential-computing/access-confidential-assets',
                collapsed: true,
                items: [
                  {
                    text: 'Attach a secret to your app',
                    link: '/for-developers/confidential-computing/app-developer-secret',
                  },
                  {
                    text: 'Access requester secrets',
                    link: '/for-developers/confidential-computing/requester-secrets',
                  },
                  {
                    text: 'Access a confidential dataset',
                    link: '/for-developers/confidential-computing/sgx-encrypted-dataset',
                  },
                ],
              },
              {
                text: 'Protect the result',
                link: '/for-developers/confidential-computing/end-to-end-encryption',
              },
            ],
          },
          {
            text: 'Build your first Intel TDX application  <span class="VPBadge warning" style="margin-left: 8px; margin-bottom: -1px; transform: translateY(-1px);">alpha</span>',
            link: '/for-developers/confidential-computing/create-your-first-tdx-app',
          },
          {
            text: 'Debug your tasks',
            link: '/for-developers/advanced/task-feedback',
          },
          {
            text: 'Go to production',
            link: '/for-developers/go-to-production',
          },
          {
            text: 'Technical references',
            collapsed: true,
            items: [
              {
                text: 'Application I/O',
                link: '/for-developers/application-io',
              },
            ],
          },
          {
            text: 'Manage your orders',
            collapsed: true,
            items: [
              {
                text: 'Manage your apporders',
                link: '/for-developers/advanced/manage-your-apporders',
              },
              {
                text: 'Manage your datasetorders',
                link: '/for-developers/advanced/manage-your-datasetorders',
              },
            ],
          },
          {
            text: 'Toolbox',
            collapsed: true,
            items: [
              {
                text: 'iExec explorer',
                link: '/for-developers/toolbox/iexec-explorer',
              },
              {
                text: 'iExec subgraph',
                link: '/for-developers/toolbox/iexec-subgraph',
              },
              {
                text: 'iExec SDK',
                link: '/for-developers/toolbox/iexec-sdk',
              },
            ],
          },
          {
            text: 'iExec sidechain',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/for-developers/sidechain/overview',
              },
              {
                text: 'Connect to iExec Sidechain',
                link: '/for-developers/sidechain/connect',
              },
            ],
          },
        ],
      },
      {
        text: 'For Workers',
        items: [
          {
            text: 'Quick start',
            link: '/for-workers/quick-worker-start',
          },
          {
            text: 'Manage a workerpool',
            link: '/for-workers/manage-a-pool-of-workers',
          },
        ],
      },
      {
        text: 'Use Cases',
        items: [
          {
            text: 'iExec DOracle',
            link: '/use-cases/iexec-doracle',
          },
        ],
      },
      {
        text: 'Key Concepts',
        items: [
          {
            text: 'Proof of Contribution',
            link: '/key-concepts/proof-of-contribution',
          },
          {
            text: 'Pay per task model',
            link: '/key-concepts/pay-per-task-model',
          },
        ],
      },
      {
        text: 'HELP',
        items: [
          {
            text: 'Glossary',
            link: '/help/glossary',
          },
          {
            text: 'Assets',
            link: '/help/assets',
          },
          {
            text: 'Contact Us',
            link: '/help/contact-us',
          },
        ],
      },
    ],
  } satisfies DefaultTheme.Sidebar;
}
