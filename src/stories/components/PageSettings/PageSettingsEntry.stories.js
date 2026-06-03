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
    icon: markRaw(IPhTreeStructure)
  }
}
export const Checked = {
  args: {
    text: 'Path',
    value: 'path',
    icon: markRaw(IPhTreeStructure),
    class: 'page-settings-entry-checked'
  }
}
