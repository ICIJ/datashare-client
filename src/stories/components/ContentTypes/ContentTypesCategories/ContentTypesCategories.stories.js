import ContentTypesAll from '@/components/ContentTypes/ContentTypesAll'
import ContentTypesCategories from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategories'
import ContentTypesCategory from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategory'
import ContentTypesCategoryName from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName'
import ContentTypesEntry from '@/components/ContentTypes/ContentTypesCategories/ContentTypesEntry'

export default {
  tags: ['autodocs'],
  title: 'Components/ContentTypes/ContentTypesCategories/ContentTypesCategories',
  component: ContentTypesCategories
}

export const Grouped = {
  render: () => ({
    components: {
      ContentTypesAll,
      ContentTypesCategories,
      ContentTypesCategory,
      ContentTypesCategoryName,
      ContentTypesEntry
    },
    template: `
      <content-types-categories>
        <content-types-all :count="2344" />
        <content-types-category>
          <content-types-category-name category="DOCUMENT" :count="1586" indeterminate />
          <content-types-entry content-type="PDF" :count="1552" model-value />
          <content-types-entry content-type="Word" :count="34" />
        </content-types-category>
        <content-types-category>
          <content-types-category-name category="IMAGE" :count="648" />
          <content-types-entry content-type="PNG" :count="489" />
          <content-types-entry content-type="JPEG" :count="124" />
          <content-types-entry content-type="TIFF" :count="35" />
        </content-types-category>
        <content-types-category>
          <content-types-category-name category="SPREADSHEET" :count="110" />
          <content-types-entry content-type="CSV" :count="98" />
          <content-types-entry content-type="Excel" :count="12" />
        </content-types-category>
      </content-types-categories>
    `
  })
}

export const Flat = {
  render: () => ({
    components: {
      ContentTypesAll,
      ContentTypesCategories,
      ContentTypesEntry
    },
    template: `
      <content-types-categories>
        <content-types-all :count="2344" />
        <content-types-entry content-type="PDF" :count="1552" />
        <content-types-entry content-type="PNG" :count="489" />
        <content-types-entry content-type="JPEG" :count="124" />
        <content-types-entry content-type="CSV" :count="98" />
        <content-types-entry content-type="TIFF" :count="35" />
        <content-types-entry content-type="Word" :count="34" />
        <content-types-entry content-type="Excel" :count="12" />
      </content-types-categories>
    `
  })
}
