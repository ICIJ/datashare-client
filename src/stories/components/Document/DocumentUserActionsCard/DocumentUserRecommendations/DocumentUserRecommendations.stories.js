import DocumentUserRecommendations from '@/components/Document/DocumentUserActionsCard/DocumentUserRecommendations/DocumentUserRecommendations.vue'
import { storeDecoratorPipelineChainByCategory } from '~storybook/decorators/vuex'

export default {
  title: 'Components/Document/DocumentUserActionsCard/DocumentUserRecommendations/DocumentUserRecommendations',
  tags: ['autodocs'],
  decorators: [storeDecoratorPipelineChainByCategory],
  component: DocumentUserRecommendations,
  args: {
    usernames: []
  }
}
export const Default = {}
export const WithRecommendations = {
  args: { usernames: ['Riri', 'Fifi', 'Loulou'] }
}
