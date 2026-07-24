import ContentTypesCategory from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategory'
import ContentTypesCategoryName from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName'
import ContentTypesEntry from '@/components/ContentTypes/ContentTypesCategories/ContentTypesEntry'

export default {
  tags: ['autodocs'],
  title: 'Components/ContentTypes/ContentTypesCategories/ContentTypesCategory',
  component: ContentTypesCategory,
  render: args => ({
    components: {
      ContentTypesCategory,
      ContentTypesCategoryName,
      ContentTypesEntry
    },
    setup: () => ({ args }),
    template: `
      <content-types-category v-bind="args">
        <content-types-category-name category="DOCUMENT" :count="1586" indeterminate />
        <content-types-entry content-type="PDF" :count="1552" model-value />
        <content-types-entry content-type="Word" :count="34" />
      </content-types-category>
    `
  })
}

export const Default = {}
