import { vueRouter } from 'storybook-vue3-router'

import AppSidebarSection from '@/components/AppSidebarSection'
import AppSidebarSectionEntry from '@/components/AppSidebarSectionEntry'

const routes = [{ path: '/', name: 'home' }]

export default {
  decorators: [vueRouter(routes)],
  title: 'Components/AppSidebar/Section',
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
    },
    compact: {
      control: { type: 'boolean' }
    }
  },
  args: {
    icon: 'circles-three-plus',
    title: 'Projects',
    active: true,
    compact: false
  },
  render: (args) => ({
    components: {
      AppSidebarSection,
      AppSidebarSectionEntry
    },
    setup() {
      return { args }
    },
    computed: {
      style() {
        return {
          maxWidth: args.compact ? '90px' : '300px'
        }
      }
    },
    template: `
      <div :style="style">
        <app-sidebar-section v-bind="args" :to="{ name: 'home' }">
          <app-sidebar-section-entry icon="dots-nine" :to="{ name: 'home' }" :action-to="{ name: 'home' }" action-title="Add project">
            All projects
          </app-sidebar-section-entry>
          <app-sidebar-section-entry :to="{ name: 'home' }" :active="args.active" icon="push-pin">
            Banana Papers
          </app-sidebar-section-entry>
          <app-sidebar-section-entry :to="{ name: 'home' }" icon="push-pin">
            Citrus Confidential
          </app-sidebar-section-entry>
        </app-sidebar-section>
      </div>
    `
  })
}

export const Default = {}
