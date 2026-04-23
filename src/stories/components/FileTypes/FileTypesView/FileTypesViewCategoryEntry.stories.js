import FileTypesViewCategoryEntry from '@/components/FileTypes/FileTypesView/FileTypesViewCategoryEntry'

export default {
  tags: ['autodocs'],
  title: 'Components/FileTypes/FileTypesView/FileTypesViewCategoryEntry',
  component: FileTypesViewCategoryEntry,
  args: {
    fileType: 'PDF',
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
