import KeyboardShortcutsSection from '@/components/KeyboardShortcuts/KeyboardShortcutsSection/KeyboardShortcutsSection'
import KeyboardShortcutsSectionEntry from '@/components/KeyboardShortcuts/KeyboardShortcutsSection/KeyboardShortcutsSectionEntry'

export default {
  title: 'Components/KeyboardShortcuts/KeyboardShortcutsSection/KeyboardShortcutsSection',
  tags: ['autodocs'],
  component: KeyboardShortcutsSection,
  args: {
    title: 'Search'
  },
  render: (args) => ({
    components: {
      KeyboardShortcutsSection,
      KeyboardShortcutsSectionEntry
    },
    setup: () => ({ args }),
    template: `
      <keyboard-shortcuts-section v-bind="args">
        <keyboard-shortcuts-section-entry label="Search in text" keys="ctrl + F" mac-keys="super + F" />
        <keyboard-shortcuts-section-entry label="Close search in text" keys="esc" />
        <keyboard-shortcuts-section-entry label="Go to Previous or Next document" keys="ctrl + ←/→" mac-keys="super + ←/→" />
      </keyboard-shortcuts-section>
    `
  })
}

export const Default = {}
