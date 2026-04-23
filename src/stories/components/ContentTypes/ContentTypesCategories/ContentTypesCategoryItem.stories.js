import ContentTypesCategoryItem from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryItem'

export default {
  tags: ['autodocs'],
  title: 'Components/ContentTypes/ContentTypesCategories/ContentTypesCategoryItem',
  component: ContentTypesCategoryItem,
  args: {
    contentType: 'PDF',
    count: 1552,
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
    count: 0
  }
}
