import ContentTypesViewEntry from '@/components/ContentTypes/ContentTypesView/ContentTypesViewEntry'

export default {
  tags: ['autodocs'],
  title: 'Components/ContentTypes/ContentTypesView/ContentTypesViewEntry',
  component: ContentTypesViewEntry,
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
    count: null
  }
}
