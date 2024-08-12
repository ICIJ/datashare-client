import KeyboardShortcutsSectionEntry from '@/components/KeyboardShortcuts/KeyboardShortcutsSection/KeyboardShortcutsSectionEntry'

export default {
  title: 'Components/KeyboardShortcuts/KeyboardShortcutsSection/KeyboardShortcutsSectionEntry',
  tags: ['autodocs'],
  component: KeyboardShortcutsSectionEntry,
  args: {
    label: 'Previous or next document',
    keys: 'super + ←/→'
  }
}

export const Default = {}

export const WithArray = {
  args: {
    label: 'Open or Close breadcrumb',
    keys: ['super', '⌥', 'B']
  }
}
