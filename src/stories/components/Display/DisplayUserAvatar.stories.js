import DisplayUserAvatar from '@/components/Display/DisplayUserAvatar'

export default {
  title: 'Components/Display/DisplayUserAvatar',
  decorators: [() => ({ template: `<story class="border" />` })],
  tags: ['autodocs'],
  component: DisplayUserAvatar,
  args: {
    value: 'batman',
    height: 50,
    showPlaceholder: false
  }
}

export const Default = {}
