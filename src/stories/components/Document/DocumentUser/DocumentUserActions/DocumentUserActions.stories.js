import DocumentUserActions from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActions'

export default {
  title: 'Components/Document/DocumentUser/DocumentUserActions/DocumentUserActions',
  tags: ['autodocs'],
  component: DocumentUserActions,
  args: {
    dropdown: false,
    compact: false,
    showTags: true,
    showComments: false,
    showRecommended: false,
    showFolders: false,
    showNotes: false,
    hideLabels: false,
    hideTooltips: false,
    tags: 0,
    comments: 0,
    recommended: 0,
    folders: 0,
    notes: 0
  }
}

export const Default = {
  args: {
    compact: false,
    showTags: true,
    tags: 3
  }
}
export const Compact = {
  args: {
    compact: true,
    tags: 3
  }
}
export const Complete = {
  args: {
    compact: false,
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
export const CompleteCompact = {
  args: {
    compact: true,
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
export const DropdownDefault = {
  args: {
    compact: true,
    dropdown: true,
    showTags: true,
    showComments: true,
    tags: 3,
    comments: 4
  }
}
export const DropdownWithoutTooltip = {
  args: {
    hideTooltips: true,
    dropdown: true,
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
export const DropdownCompact = {
  args: {
    compact: true,
    dropdown: true,
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
