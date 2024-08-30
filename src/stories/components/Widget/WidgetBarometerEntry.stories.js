import WidgetBarometerEntry from '@/components/Widget/WidgetBarometerEntry'
import { variantsArgType } from '~storybook/utils'

export default {
  title: 'Components/Widget/WidgetBarometerEntry',
  component: WidgetBarometerEntry,
  tags: ['autodocs'],
  argTypes: {
    variant: variantsArgType
  },
  args: {
    icon: 'floppy-disk',
    label: 'records',
    value: '30000',
    variant: 'action'
  }
}
export const Default = {}
