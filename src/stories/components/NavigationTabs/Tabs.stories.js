import Tabs from '@/components/NavigationTabs/Tabs'
import TabsEntry from '@/components/NavigationTabs/TabsEntry'

export default {
  title: 'Components/NavigationTabs/Tabs',
  tags: ['autodocs'],
  component: Tabs,

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
      Tabs,
      TabsEntry
    },
    setup: () => ({ args }),
    mounted() {
      console.log(this.$route)
    },
    template: `
      <tabs v-bind="args">
        <tabs-entry icon="list" :to="{ name: 'general' }" title="General">
          General
        </tabs-entry>
        <tabs-entry icon="moon" :to="{ name: 'appearance' }" title="Appearance">
          Appearance
        </tabs-entry>
        <tabs-entry icon="file-text" :to="{ name: 'document-processing' }" title="Document processing">
          Document processing
        </tabs-entry>
        <tabs-entry :count="8" icon="rocket-launch" :to="{ name: 'batch-tasks' }" title="Batch tasks">
          Batch tasks
        </tabs-entry>
        <tabs-entry icon="monitor" :to="{ name: 'plugins' }" title="Plugins">
          Plugins
        </tabs-entry>
        <tabs-entry icon="database" :to="{ name: 'extensions' }" title="Extensions">
          Extensions
        </tabs-entry>
      </tabs>
    `
  })
}

export const Default = {}
