import ContentTypesView from '@/components/ContentTypes/ContentTypesView/ContentTypesView'
import ContentTypesViewCategory from '@/components/ContentTypes/ContentTypesView/ContentTypesViewCategory'
import ContentTypesViewCategoryName from '@/components/ContentTypes/ContentTypesView/ContentTypesViewCategoryName'
import ContentTypesViewCategoryEntry from '@/components/ContentTypes/ContentTypesView/ContentTypesViewCategoryEntry'
import ContentTypesViewEntry from '@/components/ContentTypes/ContentTypesView/ContentTypesViewEntry'

export default {
  tags: ['autodocs'],
  title: 'Components/ContentTypes/ContentTypesView/ContentTypesView',
  component: ContentTypesView
}

export const Grouped = {
  render: () => ({
    components: {
      ContentTypesView,
      ContentTypesViewCategory,
      ContentTypesViewCategoryName,
      ContentTypesViewCategoryEntry
    },
    template: `
      <content-types-view>
        <content-types-view-category>
          <content-types-view-category-name label="Documents" :count="1586" />
          <content-types-view-category-entry content-type="PDF" :count="1552" />
          <content-types-view-category-entry content-type="Word" :count="34" />
        </content-types-view-category>
        <content-types-view-category>
          <content-types-view-category-name label="Images" :count="489" />
          <content-types-view-category-entry content-type="PNG" :count="298" />
          <content-types-view-category-entry content-type="JPEG" :count="122" />
          <content-types-view-category-entry content-type="TIFF" :count="69" />
        </content-types-view-category>
        <content-types-view-category>
          <content-types-view-category-name label="Spreadsheets" :count="110" />
          <content-types-view-category-entry content-type="CSV" :count="98" />
          <content-types-view-category-entry content-type="Excel" :count="12" />
        </content-types-view-category>
      </content-types-view>
    `
  })
}

export const Flat = {
  render: () => ({
    components: {
      ContentTypesView,
      ContentTypesViewEntry
    },
    template: `
      <content-types-view>
        <content-types-view-entry content-type="PDF" :count="1552" />
        <content-types-view-entry content-type="PNG" :count="489" />
        <content-types-view-entry content-type="JPEG" :count="122" />
        <content-types-view-entry content-type="CSV" :count="98" />
        <content-types-view-entry content-type="TIFF" :count="69" />
        <content-types-view-entry content-type="Word" :count="34" />
        <content-types-view-entry content-type="Excel" :count="12" />
      </content-types-view>
    `
  })
}
