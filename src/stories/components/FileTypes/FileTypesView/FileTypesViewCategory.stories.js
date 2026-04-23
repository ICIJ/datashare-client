import FileTypesViewCategory from '@/components/FileTypes/FileTypesView/FileTypesViewCategory'
import FileTypesViewCategoryName from '@/components/FileTypes/FileTypesView/FileTypesViewCategoryName'
import FileTypesViewCategoryEntry from '@/components/FileTypes/FileTypesView/FileTypesViewCategoryEntry'

export default {
  tags: ['autodocs'],
  title: 'Components/FileTypes/FileTypesView/FileTypesViewCategory',
  component: FileTypesViewCategory,
  render: args => ({
    components: {
      FileTypesViewCategory,
      FileTypesViewCategoryName,
      FileTypesViewCategoryEntry
    },
    setup: () => ({ args }),
    template: `
      <file-types-view-category v-bind="args">
        <file-types-view-category-name label="Documents" :count="1586" />
        <file-types-view-category-entry file-type="PDF" :count="1552" />
        <file-types-view-category-entry file-type="Word" :count="34" />
      </file-types-view-category>
    `
  })
}

export const Default = {}
