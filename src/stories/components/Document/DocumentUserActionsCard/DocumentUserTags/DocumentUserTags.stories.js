import DocumentUserTags from '@/components/Document/DocumentUserActionsCard/DocumentUserTags/DocumentUserTags.vue'

export default {
  title: 'Components/Document/DocumentUserActionsCard/DocumentUserTags/DocumentUserTags',
  tags: ['autodocs'],
  component: DocumentUserTags,
  args: {
    modelValue: 'test',
    tags: [],
    listNameOthers: 'Added by others',
    listNameYours: 'Added by you'
  }
}
export const Default = {}
export const WithTags = {
  args: { tags: ['toto', 'titi', 'tata'] }
}

export const isServer = {
  isServer: true
}

export const isServerWithTags = {
  args: {
    isServer: true,
    tags: ['toto', 'titi', 'tata'],
    othersTags: ['toto', 'titi', 'tata']
  }
}
