import AppSidebarToggler from '@/components/AppSidebar/AppSidebarToggler'

export default {
  title: 'Components/AppSidebar/AppSidebarToggler',
  tags: ['autodocs'],
  component: AppSidebarToggler,
  argTypes: {
    compact: {
      control: { type: 'boolean' }
    }
  },
  args: {
    compact: true
  },
  render: args => ({
    components: {
      AppSidebarToggler
    },
    setup() {
      return { args }
    },
    template: `
      <app-sidebar-toggler v-bind="args" />
    `
  })
}

export const Default = {}
