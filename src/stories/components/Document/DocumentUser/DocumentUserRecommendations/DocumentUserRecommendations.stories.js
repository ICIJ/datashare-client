import DocumentUserRecommendations from '@/components/Document/DocumentUser/DocumentUserRecommendations/DocumentUserRecommendations'
import { storeDecoratorPipelineChainByCategory } from '~storybook/decorators/vuex'

export default {
  title: 'Components/Document/DocumentUser/DocumentUserRecommendations/DocumentUserRecommendations',
  tags: ['autodocs'],
  decorators: [storeDecoratorPipelineChainByCategory],
  component: DocumentUserRecommendations,
  args: {
    modelValue: [],
    recommendedBy: ['jsmith']
  }
}
export const Default = {}

export const WithRecommendations = {
  args: {
    recommendedBy: ['Riri', 'Fifi', 'Loulou']
  }
}
