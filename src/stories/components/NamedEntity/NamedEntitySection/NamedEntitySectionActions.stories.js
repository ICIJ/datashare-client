import NamedEntitySectionActions from '@/components/NamedEntity/NamedEntitySection/NamedEntitySectionActions'
import { entityCategoriesArgType } from '~storybook/utils'
import { ENTITY_CATEGORY } from '@/enums/entityCategories'

export default {
  title: 'Components/NamedEntity/NamedEntitySection/NamedEntitySectionActions',
  tags: ['autodocs'],
  component: NamedEntitySectionActions,
  argTypes: {
    category: entityCategoriesArgType
  },
  args: {
    category: ENTITY_CATEGORY.PERSON
  }
}

export const Default = {}
