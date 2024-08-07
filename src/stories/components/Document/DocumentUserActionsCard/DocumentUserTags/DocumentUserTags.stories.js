import DocumentUserTags from '@/components/Document/DocumentUserActionsCard/DocumentUserTags/DocumentUserTags'

export default {
  title: 'Components/Document/DocumentUserActionsCard/DocumentUserTags/DocumentUserTags',
  tags: ['autodocs'],
  component: DocumentUserTags,
  args: {
    modelValue: [],
    options: ['toto', 'titi', 'tata'],
    listNameOthers: 'Added by others',
    listNameYours: 'Added by you'
  }
}
export const Default = {}
export const WithTags = {
  args: { modelValue: ['toto', 'titi', 'tata'], options: ['toto', 'titi', 'tata', 'test'] }
}

export const isServer = {
  isServer: true
}

export const isServerWithTags = {
  args: {
    isServer: true,
    modelValue: ['toto', 'titi', 'tata'],
    othersTags: ['riri', 'fifi', 'loulou']
  }
}
