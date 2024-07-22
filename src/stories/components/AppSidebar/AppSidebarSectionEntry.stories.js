import { vueRouter } from 'storybook-vue3-router'

import AppSidebarSectionEntry from '@/components/AppSidebar/AppSidebarSectionEntry'

const routes = [{ path: '/', name: 'home' }]

export default {
  decorators: [vueRouter(routes)],
  title: 'Components/AppSidebar/AppSidebarSectionEntry',
  tags: ['autodocs'],
  component: AppSidebarSectionEntry,
  argTypes: {
    icon: {
      control: { type: 'text' }
    },
    content: {
      control: { type: 'text' }
    },
    active: {
      control: { type: 'boolean' }
    }
  },
  args: {
    icon: 'clock-counter-clockwise',
    content: 'Visited documents',
    active: false
  },
  render: (args) => ({
    components: {
      AppSidebarSectionEntry
    },
    setup() {
      return { args }
    },
    template: `
      <div class="card card-body border-0" style="max-width: 270px">
        <app-sidebar-section-entry v-bind="args" :to="{ name: 'home' }">
          {{ args.content }}
        </app-sidebar-section-entry>
      </div>
    `
  })
}

export const Default = {}

export const WithAction = {
  args: {
    content: 'Batch search',
    icon: 'list-magnifying-glass',
    actionIcon: 'plus',
    actionTitle: 'Add batch search',
    actionTo: { name: 'home' }
  }
}
