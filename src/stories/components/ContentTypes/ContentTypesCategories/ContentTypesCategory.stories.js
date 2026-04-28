import ContentTypesCategory from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategory'
import ContentTypesCategoryName from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName'
import ContentTypesCategoryItem from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryItem'

export default {
  tags: ['autodocs'],
  title: 'Components/ContentTypes/ContentTypesCategories/ContentTypesCategory',
  component: ContentTypesCategory,
  render: args => ({
    components: {
      ContentTypesCategory,
      ContentTypesCategoryName,
      ContentTypesCategoryItem
    },
    setup: () => ({ args }),
    template: `
      <content-types-category v-bind="args">
        <content-types-category-name category="DOCUMENT" :count="1586" indeterminate />
        <content-types-category-item content-type="PDF" :count="1552" model-value />
        <content-types-category-item content-type="Word" :count="34" />
      </content-types-category>
    `
  })
}

export const Default = {}
