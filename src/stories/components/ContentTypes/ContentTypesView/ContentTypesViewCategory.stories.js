import ContentTypesViewCategory from '@/components/ContentTypes/ContentTypesView/ContentTypesViewCategory'
import ContentTypesViewCategoryName from '@/components/ContentTypes/ContentTypesView/ContentTypesViewCategoryName'
import ContentTypesViewCategoryEntry from '@/components/ContentTypes/ContentTypesView/ContentTypesViewCategoryEntry'

export default {
  tags: ['autodocs'],
  title: 'Components/ContentTypes/ContentTypesView/ContentTypesViewCategory',
  component: ContentTypesViewCategory,
  render: args => ({
    components: {
      ContentTypesViewCategory,
      ContentTypesViewCategoryName,
      ContentTypesViewCategoryEntry
    },
    setup: () => ({ args }),
    template: `
      <content-types-view-category v-bind="args">
        <content-types-view-category-name label="Documents" :count="1586" />
        <content-types-view-category-entry content-type="PDF" :count="1552" />
        <content-types-view-category-entry content-type="Word" :count="34" />
      </content-types-view-category>
    `
  })
}

export const Default = {}
