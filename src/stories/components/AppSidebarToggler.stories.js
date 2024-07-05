import AppSidebarToggler from '@/components/AppSidebarToggler'

export default {
  title: 'Components/AppSidebar/Toggler',
  tags: ['autodocs'],
  argTypes: {
    compact: {
      control: { type: 'boolean' }
    }
  },
  args: {
    compact: true
  },
  render: (args) => ({
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
