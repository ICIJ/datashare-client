import DocumentUserTagsAction from '@/components/Document/DocumentUserActionsCard/DocumentUserTags/DocumentUserTagsAction'

export default {
  title: 'Components/Document/DocumentUserActionsCard/DocumentUserTags/DocumentUserTagsAction',
  tags: ['autodocs'],
  component: DocumentUserTagsAction,
  args: {
    modelValue: ['test'],
    options: ['Foo', 'Bar', 'Baz', 'Qux']
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
