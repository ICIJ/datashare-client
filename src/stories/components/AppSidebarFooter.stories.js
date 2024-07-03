import { vueRouter } from 'storybook-vue3-router'

import AppSidebarFooter from '@/components/AppSidebarFooter'

const routes = [{ path: '/settings', name: 'settings' }]

export default {
  decorators: [vueRouter(routes)],
  title: 'Components/AppSidebar/Footer',
  tags: ['autodocs'],
  render: (args) => ({
    components: {
      AppSidebarFooter
    },
    template: `
      <app-sidebar-footer>
        v17.1.0
      </app-sidebar-footer>
    `
  })
}

export const Default = {}
