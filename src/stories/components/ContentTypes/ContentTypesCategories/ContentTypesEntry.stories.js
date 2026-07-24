import ContentTypesEntry from '@/components/ContentTypes/ContentTypesCategories/ContentTypesEntry'

export default {
  tags: ['autodocs'],
  title: 'Components/ContentTypes/ContentTypesCategories/ContentTypesEntry',
  component: ContentTypesEntry,
  args: {
    contentType: 'application/pdf',
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
