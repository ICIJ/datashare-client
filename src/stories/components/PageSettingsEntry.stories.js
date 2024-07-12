import PageSettingsEntry from '@/components/PageSettingsEntry'

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
