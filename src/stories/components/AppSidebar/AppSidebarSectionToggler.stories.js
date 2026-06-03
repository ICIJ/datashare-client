import { markRaw } from 'vue'
import IPhRocketLaunch from '~icons/ph/rocket-launch'

import AppSidebarSectionToggler from '@/components/AppSidebar/AppSidebarSectionToggler'

export default {
  title: 'Components/AppSidebar/AppSidebarSectionToggler',
  tags: ['autodocs'],
  component: AppSidebarSectionToggler,
  argTypes: {
    // `icon` is rendered via `<component :is="icon" />`, so it expects an icon
    // component (e.g. `~icons/ph/*`), not a string. Disable the control rather
    // than expose a text field that can't resolve to a component at runtime.
    icon: {
      control: false
    },
    title: {
      control: { type: 'text' }
    },
    active: {
      control: { type: 'boolean' }
    }
  },
  args: {
    icon: markRaw(IPhRocketLaunch),
    title: 'Tasks',
    active: true,
    to: { path: '/' }
  },
  render: args => ({
    components: {
      AppSidebarSectionToggler
    },
    setup() {
      return { args }
    },
    template: `
      <div style="max-width: 90px">
        <app-sidebar-section-toggler v-bind="args" />
      </div>
    `
  })
}

export const Default = {}
