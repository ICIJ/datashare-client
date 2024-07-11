import { vueRouter } from 'storybook-vue3-router'

import AppSidebarSectionToggler from '@/components/AppSidebar/AppSidebarSectionToggler'

const routes = [{ path: '/', name: 'home' }]

export default {
  decorators: [vueRouter(routes)],
  title: 'Components/AppSidebar/AppSidebarSectionToggler',
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: { type: 'text' }
    },
    title: {
      control: { type: 'text' }
    },
    active: {
      control: { type: 'boolean' }
    }
  },
  args: {
    icon: 'rocket-launch',
    title: 'Tasks',
    active: true
  },
  render: (args) => ({
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
