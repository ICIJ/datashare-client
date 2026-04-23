import ContentTypesViewCategoryName from '@/components/ContentTypes/ContentTypesView/ContentTypesViewCategoryName'

export default {
  tags: ['autodocs'],
  title: 'Components/ContentTypes/ContentTypesView/ContentTypesViewCategoryName',
  component: ContentTypesViewCategoryName,
  args: {
    label: 'Documents',
    count: 1586,
    modelValue: false
  }
}

export const Default = {}

export const Selected = {
  args: {
    modelValue: true
  }
}

export const WithoutCount = {
  args: {
    count: null
  }
}
