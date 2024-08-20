import NamedEntitySectionMore from '@/components/NamedEntity/NamedEntitySection/NamedEntitySectionMore'
import { entityCategoriesArgType } from '~storybook/utils'
import { ENTITY_CATEGORY } from '@/enums/entityCategories'

export default {
  title: 'Components/NamedEntity/NamedEntitySection/NamedEntitySectionMore',
  tags: ['autodocs'],
  component: NamedEntitySectionMore,
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
