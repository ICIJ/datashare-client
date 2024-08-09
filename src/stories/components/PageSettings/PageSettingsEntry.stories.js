import PageSettingsEntry from '@/components/PageSettings/PageSettingsEntry'

export default {
  title: 'Components/PageSettings/Entry',
  tags: ['autodocs'],
  component: PageSettingsEntry
}
export const Default = {
  args: {
    text: 'Path',
    value: 'path',
    icon: 'tree-structure'
  }
}
export const Checked = {
  args: {
    text: 'Path',
    value: 'path',
    icon: 'tree-structure',
    class: 'page-settings-entry-checked'
  }
}
