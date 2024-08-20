import FormControlTerm from '@/components/Form/FormControl/FormControlTerm'
import { buttonSizesArgType } from '~storybook/utils'
import { SIZE } from '@/enums/sizes'

export default {
  title: 'Components/Form/FormControl/FormControlTerm',
  tags: ['autodocs'],
  component: FormControlTerm,
  argTypes: {
    size: buttonSizesArgType
  },
  args: {
    modelValue: ['Emmanuel AND Macron', 'path:"/vault/macronleaks"'],
    options: [],
    size: SIZE.MD
  }
}

export const Default = {}
