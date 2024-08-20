import DisplayProgress from '@/components/Display/DisplayProgress'
import { variantsPlainArgType } from '~storybook/utils'
import { VARIANT } from '@/enums/variants'

export default {
  title: 'Components/Display/DisplayProgress',
  tags: ['autodocs'],
  component: DisplayProgress,
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 1, step: 0.1 }
    },
    variant: variantsPlainArgType
  },
  args: {
    value: 0.5,
    variant: VARIANT.PRIMARY
  }
}

export const Default = {}
