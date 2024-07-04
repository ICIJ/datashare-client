import AppSidebarSection from '@/components/AppSidebarSection'

export default {
  title: 'Components/AppSidebar/Section',
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
    icon: 'rocket',
    title: 'Group name'
  },
  render: (args) => ({
    components: {
      AppSidebarSection
    },
    template: `
      <app-sidebar-section v-bind="args">
      </app-sidebar-section>
    `
  })
}

export const Default = {}
