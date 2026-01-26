import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/project-structure',
      ],
    },
    {
      type: 'category',
      label: 'Lark CLI',
      collapsed: false,
      items: [
        'lark/overview',
        'lark/commands',
        'lark/configuration',
      ],
    },
    {
      type: 'category',
      label: 'Lark Jobs',
      collapsed: false,
      items: [
        'lark-jobs/overview',
        'lark-jobs/creating-jobs',
        'lark-jobs/dispatching-jobs',
        'lark-jobs/queue-workers',
      ],
    },
  ],
};

export default sidebars;
