import FileTypesViewEntry from '@/components/FileTypes/FileTypesView/FileTypesViewEntry'

export default {
  tags: ['autodocs'],
  title: 'Components/FileTypes/FileTypesView/FileTypesViewEntry',
  component: FileTypesViewEntry,
  args: {
    fileType: 'application/pdf',
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
