import { vueRouter } from 'storybook-vue3-router'

import { withPinia } from '~storybook/decorators/pinia'
import AppSidebarFooter from '@/components/AppSidebar/AppSidebarFooter'

const routes = [
  { path: '/projects', name: 'project.list' },
  { path: '/settings/appearance', name: 'settings.appearance' }
]

export default {
  decorators: [vueRouter(routes), withPinia()],
  title: 'Components/AppSidebar/AppSidebarFooter',
  tags: ['autodocs'],
  component: AppSidebarFooter,
  argTypes: {
    compact: {
      control: {
        type: 'boolean'
      }
    },
    noHelp: {
      control: {
        type: 'boolean'
      }
    },
    noRemoveAll: {
      control: {
        type: 'boolean'
      }
    },
    noSignOut: {
      control: {
        type: 'boolean'
      }
    },
    noKeyboardShortcuts: {
      control: {
        type: 'boolean'
      }
    }
  },
  render: (args) => ({
    components: {
      AppSidebarFooter
    },
    setup: () => ({ args }),
    template: `
      <app-sidebar-footer v-bind="args">
        v17.1.0
      </app-sidebar-footer>
    `
  })
}

export const Default = {
  args: {
    compact: false,
    noHelp: false,
    noRemoveAll: false,
    noSignOut: true,
    noSettings: false,
    noKeyboardShortcuts: false
  }
}

export const Compact = {
  args: {
    compact: true,
    noHelp: true,
    noRemoveAll: true,
    noSignOut: true
  }
}
