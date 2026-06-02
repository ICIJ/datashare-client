import AppSidebarSectionToggler from '@/components/AppSidebar/AppSidebarSectionToggler'

export default {
  title: 'Components/AppSidebar/AppSidebarSectionToggler',
  tags: ['autodocs'],
  component: AppSidebarSectionToggler,
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
