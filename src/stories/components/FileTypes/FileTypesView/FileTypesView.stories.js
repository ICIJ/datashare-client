import FileTypesView from '@/components/FileTypes/FileTypesView/FileTypesView'
import FileTypesViewCategory from '@/components/FileTypes/FileTypesView/FileTypesViewCategory'
import FileTypesViewCategoryName from '@/components/FileTypes/FileTypesView/FileTypesViewCategoryName'
import FileTypesViewCategoryEntry from '@/components/FileTypes/FileTypesView/FileTypesViewCategoryEntry'
import FileTypesViewEntry from '@/components/FileTypes/FileTypesView/FileTypesViewEntry'

export default {
  tags: ['autodocs'],
  title: 'Components/FileTypes/FileTypesView/FileTypesView',
  component: FileTypesView
}

export const Grouped = {
  render: () => ({
    components: {
      FileTypesView,
      FileTypesViewCategory,
      FileTypesViewCategoryName,
      FileTypesViewCategoryEntry
    },
    template: `
      <file-types-view>
        <file-types-view-category>
          <file-types-view-category-name label="Documents" :count="1586" />
          <file-types-view-category-entry file-type="PDF" :count="1552" />
          <file-types-view-category-entry file-type="Word" :count="34" />
        </file-types-view-category>
        <file-types-view-category>
          <file-types-view-category-name label="Images" :count="489" />
          <file-types-view-category-entry file-type="PNG" :count="298" />
          <file-types-view-category-entry file-type="JPEG" :count="122" />
          <file-types-view-category-entry file-type="TIFF" :count="69" />
        </file-types-view-category>
        <file-types-view-category>
          <file-types-view-category-name label="Spreadsheets" :count="110" />
          <file-types-view-category-entry file-type="CSV" :count="98" />
          <file-types-view-category-entry file-type="Excel" :count="12" />
        </file-types-view-category>
      </file-types-view>
    `
  })
}

export const Flat = {
  render: () => ({
    components: {
      FileTypesView,
      FileTypesViewEntry
    },
    template: `
      <file-types-view>
        <file-types-view-entry file-type="PDF" :count="1552" />
        <file-types-view-entry file-type="PNG" :count="489" />
        <file-types-view-entry file-type="JPEG" :count="122" />
        <file-types-view-entry file-type="CSV" :count="98" />
        <file-types-view-entry file-type="TIFF" :count="69" />
        <file-types-view-entry file-type="Word" :count="34" />
        <file-types-view-entry file-type="Excel" :count="12" />
      </file-types-view>
    `
  })
}
