import DocumentUserRecommendationsAction from '@/components/Document/DocumentUser/DocumentUserRecommendations/DocumentUserRecommendationsAction'
import { storeDecoratorPipelineChainByCategory } from '~storybook/decorators/vuex'

export default {
  title: 'Components/Document/DocumentUser/DocumentUserRecommendations/DocumentUserRecommendationsAction',
  tags: ['autodocs'],
  decorators: [storeDecoratorPipelineChainByCategory],
  component: DocumentUserRecommendationsAction,
  args: { modelValue: false }
}
export const Default = {}
export const Unmark = {
  args: { modelValue: true }
}
