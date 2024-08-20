import NamedEntitySection from '@/components/NamedEntity/NamedEntitySection/NamedEntitySection'
import { entityCategoriesArgType } from '~storybook/utils'
import { ENTITY_CATEGORY } from '@/enums/entityCategories'

export default {
  title: 'Components/NamedEntity/NamedEntitySection/NamedEntitySection',
  tags: ['autodocs'],
  component: NamedEntitySection,
  argTypes: {
    category: entityCategoriesArgType
  },
  args: {
    category: ENTITY_CATEGORY.PERSON,
    count: 4,
    hasMore: true,
    entries: [
      {
        mention: 'Elton John',
        length: 'Elton John'.length,
        offsets: [12e2, 13e2],
        category: ENTITY_CATEGORY.PERSON
      },
      {
        mention: 'John Doe',
        length: 'John Doe'.length,
        offsets: [13e2, 14e2],
        category: ENTITY_CATEGORY.PERSON
      },
      {
        mention: 'Jane Doe',
        length: 'Jane Doe'.length,
        offsets: [14e2, 15e2],
        category: ENTITY_CATEGORY.PERSON
      }
    ]
  }
}

export const Default = {}
