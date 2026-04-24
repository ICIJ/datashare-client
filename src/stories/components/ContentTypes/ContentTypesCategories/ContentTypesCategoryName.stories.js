import ContentTypesCategoryName from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName'

export default {
  tags: ['autodocs'],
  title: 'Components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName',
  component: ContentTypesCategoryName,
  args: {
    category: 'DOCUMENT',
    count: 1586,
    modelValue: false,
    indeterminate: false
  }
}

export const Default = {}

export const Selected = {
  args: {
    modelValue: true
  }
}

export const Indeterminate = {
  args: {
    indeterminate: true
  }
}

export const WithoutCount = {
  args: {
    count: 0
  }
}
