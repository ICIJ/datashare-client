import EntitySectionMore from '@/components/Entity/EntitySection/EntitySectionMore'
import { entityCategoriesArgType } from '~storybook/utils'
import { ENTITY_CATEGORY } from '@/enums/entityCategories'

export default {
  title: 'Components/Entity/EntitySection/EntitySectionMore',
  tags: ['autodocs'],
  component: EntitySectionMore,
  argTypes: {
    category: entityCategoriesArgType
  },
  args: {
    category: ENTITY_CATEGORY.PERSON
  }
}

export const Default = {}

export const ForOrganization = {
  args: {
    category: ENTITY_CATEGORY.ORGANIZATION
  }
}

export const ForLocation = {
  args: {
    category: ENTITY_CATEGORY.LOCATION
  }
}

export const ForEmail = {
  args: {
    category: ENTITY_CATEGORY.EMAIL
  }
}
