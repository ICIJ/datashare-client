import EntitySectionActions from '@/components/Entity/EntitySection/EntitySectionActions'
import { ENTITY_CATEGORY } from '@/enums/entityCategories'
import { entityCategoriesArgType } from '~storybook/utils'

export default {
  title: 'Components/Entity/EntitySection/EntitySectionActions',
  tags: ['autodocs'],
  component: EntitySectionActions,
  argTypes: {
    category: entityCategoriesArgType
  },
  args: {
    category: ENTITY_CATEGORY.PERSON
  }
}

export const Default = {}
