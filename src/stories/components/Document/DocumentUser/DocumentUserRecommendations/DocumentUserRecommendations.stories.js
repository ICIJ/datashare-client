import DocumentUserRecommendations from '@/components/Document/DocumentUser/DocumentUserRecommendations/DocumentUserRecommendations'
import { withPinia } from '~storybook/decorators/pinia'

export default {
  title: 'Components/Document/DocumentUser/DocumentUserRecommendations/DocumentUserRecommendations',
  tags: ['autodocs'],
  decorators: [withPinia()],
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
