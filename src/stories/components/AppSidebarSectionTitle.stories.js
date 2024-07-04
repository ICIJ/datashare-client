import { vueRouter } from 'storybook-vue3-router'

import AppSidebarSectionTitle from '@/components/AppSidebarSectionTitle'

const routes = [{ path: '/', name: 'home' }]

export default {
  decorators: [vueRouter(routes)],
  title: 'Components/AppSidebar/Section/Title',
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: { type: 'text' }
    },
    title: {
      control: { type: 'text' }
    }
  },
  args: {
    icon: 'rocket-launch',
    title: 'Tasks'
  },
  render: (args) => ({
    components: {
      AppSidebarSectionTitle
    },
    setup() {
      return { args }
    },
    template: `
      <div class="card card-body border-0" style="max-width: 270px">
        <app-sidebar-section-title v-bind="args" />
      </div>
    `
  })
}

export const Default = {}
