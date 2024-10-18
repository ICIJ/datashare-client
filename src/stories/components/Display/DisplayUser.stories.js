import DisplayUser from '@/components/Display/DisplayUser'
import { storeDecoratorPipelineChainByCategory } from '~storybook/decorators/vuex'

export default {
  title: 'Components/Display/DisplayUser',
  decorators: [storeDecoratorPipelineChainByCategory],
  tags: ['autodocs'],
  component: DisplayUser,
  args: {
    value: 'batman'
  }
}

export const Default = {}
