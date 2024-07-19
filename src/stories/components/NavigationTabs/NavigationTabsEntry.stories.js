import NavigationTabsEntry from '@/components/NavigationTabs/NavigationTabsEntry'

export default {
  title: 'Components/NavigationTabs/NavigationTabsEntry',
  tags: ['autodocs'],
  component: NavigationTabsEntry,
  args: {
    active: true,
    default: 'Entities',
    icon: 'users',
    count: 8,
    target: '_self'
  },
  decorators: [
    () => ({
      template: '<ul class="list-unstyled d-inline-block"><story /></ul>'
    })
  ],
  parameters: {
    slots: {
      default: `Default slot content`
    }
  }
}

export const Default = {}
