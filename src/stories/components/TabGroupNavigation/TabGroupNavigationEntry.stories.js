import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigationEntry'

export default {
  title: 'Components/TabGroupNavigation/TabGroupNavigationEntry',
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
