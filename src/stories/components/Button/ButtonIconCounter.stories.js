import ButtonIconCounter from '@/components/Button/ButtonIconCounter'
import { variantsArgType } from '~storybook/utils'
import { VARIANT } from '@/enums/variants'

export default {
  components: { ButtonIconCounter },
  title: 'Components/Button/ButtonIconCounter',
  component: ButtonIconCounter,
  tags: ['autodocs'],
  argTypes: {
    counter: {
      control: { type: 'number' }
    },
    variant: variantsArgType
  },
  args: {
    variant: VARIANT.SECONDARY,
    counter: 123
  }
}

export const Default = {}
