import WidgetBarometerDiskUsage from '@/components/Widget/WidgetBarometerDiskUsage'
import { variantsArgType } from '~storybook/utils'

export default {
  title: 'Components/Widget/WidgetBarometerDiskUsage',
  component: WidgetBarometerDiskUsage,
  tags: ['autodocs'],
  argTypes: {
    variant: variantsArgType
  },
  args: {
    size: 300050005050
  },
  decorators: [
    () => ({
      template: '<div class="bg-tertiary-subtle rounded-1 p-4"><story /></div>'
    })
  ]
}

export const Default = {}
