import TabGroup from '@/components/TabGroup/TabGroup'
import TabGroupEntry from '@/components/TabGroup/TabGroupEntry'

export default {
  title: 'Components/TabGroup/TabGroup',
  tags: ['autodocs'],
  component: TabGroup,

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
      TabGroup,
      TabGroupEntry
    },
    setup: () => ({ args }),
    mounted() {
      console.log(this.$route)
    },
    template: `
      <tab-group v-bind="args">
        <tab-group-entry icon="list" :to="{ name: 'general' }" title="General">
          General
        </tab-group-entry>
        <tab-group-entry icon="moon" :to="{ name: 'appearance' }" title="Appearance">
          Appearance
        </tab-group-entry>
        <tab-group-entry icon="file-text" :to="{ name: 'document-processing' }" title="Document processing">
          Document processing
        </tab-group-entry>
        <tab-group-entry :count="8" icon="rocket-launch" :to="{ name: 'batch-tasks' }" title="Batch tasks">
          Batch tasks
        </tab-group-entry>
        <tab-group-entry icon="monitor" :to="{ name: 'plugins' }" title="Plugins">
          Plugins
        </tab-group-entry>
        <tab-group-entry icon="database" :to="{ name: 'extensions' }" title="Extensions">
          Extensions
        </tab-group-entry>
      </tab-group>
    `
  })
}

export const Default = {}
