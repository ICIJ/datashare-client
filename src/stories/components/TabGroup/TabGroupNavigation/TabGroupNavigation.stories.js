import { vueRouter } from 'storybook-vue3-router'

import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'

const routes = [
  { path: '/', name: 'general' },
  { path: '/appearance', name: 'appearance' },
  { path: '/document-processing', name: 'document-processing' },
  { path: '/batch-tasks', name: 'batch-tasks' },
  { path: '/plugins', name: 'plugins' },
  { path: '/extensions', name: 'extensions' }
]

export default {
  title: 'Components/TabGroup/TabGroupNavigation/TabGroupNavigation',
  tags: ['autodocs'],
  decorators: [vueRouter(routes)],
  component: TabGroupNavigation,
  args: {
    cardHeader: false,
    fill: false,
    justified: false,
    small: false,
    vertical: false,
    nowrap: true,
    flush: false
  },
  render: (args) => ({
    components: {
      TabGroupNavigation,
      TabGroupNavigationEntry
    },
    setup: () => ({ args }),
    mounted() {
      console.log(this.$route)
    },
    template: `
      <tab-group-navigation v-bind="args">
        <tab-group-navigation-entry icon="list" :to="{ name: 'general' }">
          General
        </tab-group-navigation-entry>
        <tab-group-navigation-entry icon="moon" :to="{ name: 'appearance' }">
          Appearance
        </tab-group-navigation-entry>
        <tab-group-navigation-entry icon="file-text" :to="{ name: 'document-processing' }">
          Document processing
        </tab-group-navigation-entry>
        <tab-group-navigation-entry :count="8" icon="rocket-launch" :to="{ name: 'batch-tasks' }">
          Batch tasks
        </tab-group-navigation-entry>
        <tab-group-navigation-entry icon="monitor" :to="{ name: 'plugins' }">
          Plugins
        </tab-group-navigation-entry>
        <tab-group-navigation-entry icon="database" :to="{ name: 'extensions' }">
          Extensions
        </tab-group-navigation-entry>
      </tab-group-navigation>
    `
  })
}

export const Default = {}
