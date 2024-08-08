import DocumentUserRecommendations from '@/components/Document/DocumentUserActionsCard/DocumentUserRecommendations/DocumentUserRecommendations'
import { storeDecoratorPipelineChainByCategory } from '~storybook/decorators/vuex'

export default {
  title: 'Components/Document/DocumentUserActionsCard/DocumentUserRecommendations/DocumentUserRecommendations',
  tags: ['autodocs'],
  decorators: [storeDecoratorPipelineChainByCategory],
  component: DocumentUserRecommendations,
  args: {
    modelValue: [],
    username: 'jsmith'
  }
}
export const Default = {}
export const WithRecommendations = {
  args: { modelValue: ['Riri', 'Fifi', 'Loulou'] }
}
