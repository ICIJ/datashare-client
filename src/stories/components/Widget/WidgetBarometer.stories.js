import { variantsArgType } from '~storybook/utils'
import { getCategoryIcon } from '@/utils/namedEntity'
import { ENTITY_CATEGORY } from '@/enums/entityCategories'
import { VARIANT } from '@/enums/variants'
import WidgetBarometer from '@/components/Widget/WidgetBarometer'
import WidgetBarometerEntry from '@/components/Widget/WidgetBarometerEntry'
import WidgetBarometerEntryDocuments from '@/components/Widget/WidgetBarometerEntryDocuments'
import WidgetBarometerEntryDiskUsage from '@/components/Widget/WidgetBarometerEntryDiskUsage'
const documents = {
  nbDocuments: 43,
  nbDocumentsOnDisks: 123
}
const diskUsage = {
  size: 300050005050
}
const persons = {
  icon: getCategoryIcon(ENTITY_CATEGORY.PERSON),
  label: 'Persons',
  value: 9000,
  variant: VARIANT.CATEGORY_PERSON
}
const organizations = {
  icon: getCategoryIcon(ENTITY_CATEGORY.ORGANIZATION),
  label: 'Organizations',
  value: 9000,
  variant: VARIANT.CATEGORY_ORGANIZATION
}
const locations = {
  icon: getCategoryIcon(ENTITY_CATEGORY.LOCATION),
  label: 'Locations',
  value: 9000,
  variant: VARIANT.CATEGORY_LOCATION
}
const emails = {
  icon: getCategoryIcon(ENTITY_CATEGORY.EMAIL),
  label: 'Emails',
  value: 9000,
  variant: VARIANT.CATEGORY_EMAIL
}
const args = { documents, diskUsage, persons, organizations, locations, emails }

export default {
  title: 'Components/Widget/WidgetBarometer',
  component: WidgetBarometer,
  tags: ['autodocs'],
  argTypes: {
    variant: variantsArgType
  },
  args,
  render: (args) => ({
    components: {
      WidgetBarometer,
      WidgetBarometerEntry,
      WidgetBarometerEntryDocuments,
      WidgetBarometerEntryDiskUsage
    },
    setup() {
      return { args }
    },
    template: `
      <widget-barometer>
        <WidgetBarometerEntryDocuments  v-bind="args.documents"/>
        <WidgetBarometerEntryDiskUsage  v-bind="args.diskUsage"/>
        <WidgetBarometerEntry  v-bind="args.persons"/>
        <WidgetBarometerEntry v-bind="args.organizations"/>
        <WidgetBarometerEntry v-bind="args.locations"/>
        <WidgetBarometerEntry v-bind="args.emails"/>
      </widget-barometer>
    `
  })
}
export const Default = {}
