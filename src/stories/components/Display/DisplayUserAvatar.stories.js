import DisplayUserAvatar from '@/components/Display/DisplayUserAvatar'
import { withPinia } from '~storybook/decorators/pinia'

export default {
  title: 'Components/Display/DisplayUserAvatar',
  decorators: [withPinia(), () => ({ template: `<story class="border" />` })],
  tags: ['autodocs'],
  component: DisplayUserAvatar,
  args: {
    value: 'batman',
    avatarHeight: 50
  }
}

export const Default = {}
