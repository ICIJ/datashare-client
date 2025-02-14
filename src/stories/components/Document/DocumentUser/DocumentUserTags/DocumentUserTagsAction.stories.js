import DocumentUserTagsAction from '@/components/Document/DocumentUser/DocumentUserTags/DocumentUserTagsAction'

export default {
  title: 'Components/Document/DocumentUser/DocumentUserTags/DocumentUserTagsAction',
  tags: ['autodocs'],
  component: DocumentUserTagsAction,
  args: {
    modelValue: ['test'],
    tags: ['Foo', 'Bar', 'Baz', 'Qux']
  }
}
export const Default = {}

export const WithTags = {
  args: {
    tags: ['toto', 'titi', 'tata']
  }
}
