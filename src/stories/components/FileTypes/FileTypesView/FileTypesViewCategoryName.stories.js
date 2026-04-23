import FileTypesViewCategoryName from '@/components/FileTypes/FileTypesView/FileTypesViewCategoryName'

export default {
  tags: ['autodocs'],
  title: 'Components/FileTypes/FileTypesView/FileTypesViewCategoryName',
  component: FileTypesViewCategoryName,
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
