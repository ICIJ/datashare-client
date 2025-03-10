import DisplayUser from '@/components/Display/DisplayUser'
import { withPinia } from '~storybook/decorators/pinia'

export default {
  title: 'Components/Display/DisplayUser',
  decorators: [withPinia()],
  tags: ['autodocs'],
  component: DisplayUser,
  args: {
    value: 'batman'
  }
}

export const Default = {}
