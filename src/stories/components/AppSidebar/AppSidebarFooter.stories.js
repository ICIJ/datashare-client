import { vueRouter } from 'storybook-vue3-router'

import AppSidebarFooter from '@/components/AppSidebar/AppSidebarFooter'

const routes = [{ path: '/settings', name: 'settings' }]

export default {
  decorators: [vueRouter(routes)],
  title: 'Components/AppSidebar/AppSidebarFooter',
  tags: ['autodocs'],
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
    noSignOut: true
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
