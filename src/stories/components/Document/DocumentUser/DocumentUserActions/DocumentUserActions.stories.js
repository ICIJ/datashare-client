import DocumentUserActions from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActions'
import { withPinia } from '~storybook/decorators/pinia'

export default {
  title: 'Components/Document/DocumentUser/DocumentUserActions/DocumentUserActions',
  tags: ['autodocs'],
  decorators: [withPinia()],
  component: DocumentUserActions,
  args: {
    compact: false,
    showTags: true,
    showComments: false,
    showRecommended: false,
    showFolders: false,
    showNotes: false,
    tags: 0,
    comments: 0,
    recommended: 0,
    folders: 0,
    notes: 0
  }
}

export const Default = {
  args: {
    showTags: true,
    tags: 3,
    showComments: true,
    showRecommended: true,
    showFolders: true,
    showNotes: true,
    showRecommendations: true
  }
}

export const DropdownWithoutTooltip = {
  args: {
    showTags: true,
    showComments: true,
    showRecommended: true,
    showFolders: true,
    showNotes: true,
    tags: 3,
    comments: 4,
    recommended: 0,
    folders: 5,
    notes: 3
  }
}
