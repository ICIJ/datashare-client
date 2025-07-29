import { uniqueId } from 'lodash'
import { PhosphorIcon, ButtonIcon } from '@icij/murmur-next'
import { vueRouter } from 'storybook-vue3-router'

import KeyboardShortcutsPopover from '@/components/KeyboardShortcuts/KeyboardShortcutsPopover/KeyboardShortcutsPopover'
import KeyboardShortcutsSectionEntry from '@/components/KeyboardShortcuts/KeyboardShortcutsSection/KeyboardShortcutsSectionEntry'

const routes = [{ path: '/', name: 'keyboard-shortcuts' }]

export default {
  title: 'Components/KeyboardShortcuts/KeyboardShortcutsPopover/KeyboardShortcutsPopover',
  tags: ['autodocs'],
  decorators: [vueRouter(routes)],
  component: KeyboardShortcutsPopover,
  render: args => ({
    components: {
      ButtonIcon,
      KeyboardShortcutsPopover,
      KeyboardShortcutsSectionEntry,
      PhosphorIcon
    },
    setup: () => {
      const btnId = uniqueId('keyboard-shortcuts-popover-btn-')
      return { args, btnId }
    },
    template: `
      <button-icon icon-left="keyboard" hide-label square variant="outline-dark" :id="btnId" />
      <span class="text-secondary-emphasis m-3">
        <phosphor-icon name="arrow-left" fade bounce />
        hover me
      </span>
      <keyboard-shortcuts-popover v-bind="args" :target="btnId">
        <keyboard-shortcuts-section-entry label="Search in text" keys="ctrl + F" mac-keys="super + F" />
        <keyboard-shortcuts-section-entry label="Close search in text" keys="esc" />
        <keyboard-shortcuts-section-entry label="Open or Close breadcrumb" keys="esc" />
        <keyboard-shortcuts-section-entry label="Open expanded view of document" keys="ctrl + option + E" />
        <keyboard-shortcuts-section-entry label="Go to Previous or Next document" keys="ctrl + ←/→" mac-keys="super + ←/→" />
        <keyboard-shortcuts-section-entry label="Go to Previous or Next tab" keys="ctrl + option + ←/→" />
        <keyboard-shortcuts-section-entry label="Go to Previous or Next page" keys="ctrl + option + ←/→" />
        <keyboard-shortcuts-section-entry label="Go to Previous or Next occurrence" keys="ctrl + F" />
        <keyboard-shortcuts-section-entry label="Star or Unstar a document" keys="ctrl + option + S" />
        <keyboard-shortcuts-section-entry label="Add tag" keys="ctrl + option + T" />
        <keyboard-shortcuts-section-entry label="Add comment" keys="ctrl + option + C" />
        <keyboard-shortcuts-section-entry label="Recommend document" keys="ctrl + option + R" />
        <keyboard-shortcuts-section-entry label="Add to folder(s)" keys="ctrl + option + F" />
        <keyboard-shortcuts-section-entry label="Add note" keys="ctrl + option + N" />
      </keyboard-shortcuts-popover>
    `
  })
}

export const Default = {}
