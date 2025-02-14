import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'

export default {
  title: 'Components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry',
  tags: ['autodocs'],
  component: TabGroupNavigationEntry,
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
