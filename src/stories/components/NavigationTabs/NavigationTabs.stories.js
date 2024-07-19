import { vueRouter } from 'storybook-vue3-router'

import NavigationTabs from '@/components/NavigationTabs/NavigationTabs'
import NavigationTabsEntry from '@/components/NavigationTabs/NavigationTabsEntry'

const routes = [
  { path: '/', name: 'general' },
  { path: '/appearence', name: 'appearence' },
  { path: '/document-processing', name: 'document-processing' },
  { path: '/batch-tasks', name: 'batch-tasks' },
  { path: '/plugins', name: 'plugins' },
  { path: '/extensions', name: 'extensions' },
]

export default {
  title: 'Components/NavigationTabs/NavigationTabs',
  tags: ['autodocs'],
  decorators: [vueRouter(routes)],
  component: NavigationTabs,
  args: {
    cardHeader: false,
    fill: false,
    justified: false,
    small: false,
    vertical: false,
    nowrap: true
  },
  render: (args) => ({
    components: {
      NavigationTabs,
      NavigationTabsEntry
    },
    setup: () => ({ args }),
    template: `
      <navigation-tabs v-bind="args">
        <navigation-tabs-entry icon="list" :to="{ name: 'general' }">
          General
        </navigation-tabs-entry>
        <navigation-tabs-entry icon="moon" :to="{ name: 'appearence' }">
          Appearence
        </navigation-tabs-entry>
        <navigation-tabs-entry icon="file-text" :to="{ name: 'document-processing' }">
          Document processing
        </navigation-tabs-entry>
        <navigation-tabs-entry :count="8" icon="rocket-launch" :to="{ name: 'batch-tasks' }">
          Batch tasks
        </navigation-tabs-entry>
        <navigation-tabs-entry icon="monitor" :to="{ name: 'plugins' }">
          Plugins
        </navigation-tabs-entry>
        <navigation-tabs-entry icon="database" :to="{ name: 'extensions' }">
          Extensions
        </navigation-tabs-entry>
      </navigation-tabs>
    `
  })
}

export const Default = {}
