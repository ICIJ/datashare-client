import WidgetBarometerDocuments from '@/components/Widget/WidgetBarometerDocuments'
import { variantsArgType } from '~storybook/utils'

export default {
  title: 'Components/Widget/WidgetBarometerDocuments',
  component: WidgetBarometerDocuments,
  tags: ['autodocs'],
  argTypes: {
    variant: variantsArgType
  },
  args: {
    nbDocuments: 43,
    nbDocumentsOnDisks: 123
  },
  decorators: [
    () => ({
      template: '<div class="bg-tertiary-subtle rounded-1 p-4"><story /></div>'
    })
  ]
}

export const Default = {}
