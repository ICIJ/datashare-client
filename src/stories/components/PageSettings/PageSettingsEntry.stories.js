import PageSettingsEntry from '@/components/PageSettings/PageSettingsEntry.vue'

export default {
  title: 'Components/PageSettings/Entry',
  tags: ['autodocs'],
  render: (args) => ({
    components: {
      PageSettingsEntry
    },
    setup: () => ({ args }),
    template: `
      <page-settings-entry v-bind="args"/>
    `
  })
}
export const Default = {
  args: {
    text: "Path",
    value: "path",
    icon: 'tree-structure'
  }
}
export const Checked = {
  args: {
    text: "Path",
    value: "path",
    icon: 'tree-structure',
    class:"page-settings-entry-checked"
  }
}
