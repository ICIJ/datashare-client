import DocumentUserActions from '@/components/Document/DocumentUserActions/DocumentUserActions'

export default {
  title: 'Components/Document/DocumentUserActions/DocumentUserActions',
  tags: ['autodocs'],
  component: DocumentUserActions,
  args: {
    showTags: true,
    showComments: false,
    showRecommended: false,
    showFolders: false,
    showNotes: false,
    hideLabels: false
  }
}

export const Default = {
  args: {
    showTags: true,
    tags: 3
  }
}
export const Complete = {
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
