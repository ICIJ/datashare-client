import WidgetBarometer from '@/components/Widget/WidgetBarometer'
import { variantsArgType } from '~storybook/utils'
import { getCategoryIcon } from '@/utils/entity'
import { ENTITY_CATEGORY } from '@/enums/entityCategories'
import { VARIANT } from '@/enums/variants'

export default {
  title: 'Components/Widget/WidgetBarometer',
  component: WidgetBarometer,
  tags: ['autodocs'],
  argTypes: {
    variant: variantsArgType
  },
  args: {
    icon: 'floppy-disk',
    label: 'records',
    value: 30000,
    variant: 'action'
  },
  decorators: [
    () => ({
      template: '<div class="bg-tertiary-subtle rounded-1 p-4"><story /></div>'
    })
  ]
}

export const Default = {}

export const ForPeople = {
  args: {
    icon: getCategoryIcon(ENTITY_CATEGORY.PERSON),
    label: 'Persons',
    value: 9000,
    variant: VARIANT.CATEGORY_PERSON,
    borderVariant: VARIANT.CATEGORY_PERSON
  }
}

export const ForOrganization = {
  args: {
    icon: getCategoryIcon(ENTITY_CATEGORY.ORGANIZATION),
    label: 'Organizations',
    value: 9000,
    variant: VARIANT.CATEGORY_ORGANIZATION,
    borderVariant: VARIANT.CATEGORY_ORGANIZATION
  }
}

export const ForLocation = {
  args: {
    icon: getCategoryIcon(ENTITY_CATEGORY.LOCATION),
    label: 'Locations',
    value: 9000,
    variant: VARIANT.CATEGORY_LOCATION,
    borderVariant: VARIANT.CATEGORY_LOCATION
  }
}

export const ForEmail = {
  args: {
    icon: getCategoryIcon(ENTITY_CATEGORY.EMAIL),
    label: 'Emails',
    value: 9000,
    variant: VARIANT.CATEGORY_EMAIL,
    borderVariant: VARIANT.CATEGORY_EMAIL
  }
}
