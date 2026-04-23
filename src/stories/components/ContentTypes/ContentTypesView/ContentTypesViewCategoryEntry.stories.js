import ContentTypesViewCategoryEntry from '@/components/ContentTypes/ContentTypesView/ContentTypesViewCategoryEntry'

export default {
  tags: ['autodocs'],
  title: 'Components/ContentTypes/ContentTypesView/ContentTypesViewCategoryEntry',
  component: ContentTypesViewCategoryEntry,
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
    count: null
  }
}
