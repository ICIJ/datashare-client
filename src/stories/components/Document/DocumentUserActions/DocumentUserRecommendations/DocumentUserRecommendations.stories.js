import DocumentUserRecommendations from '@/components/Document/DocumentUserActions/DocumentUserRecommendations/DocumentUserRecommendations'
import { storeDecoratorPipelineChainByCategory } from '~storybook/decorators/vuex'

export default {
  title: 'Components/Document/DocumentUserActions/DocumentUserRecommendations/DocumentUserRecommendations',
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
