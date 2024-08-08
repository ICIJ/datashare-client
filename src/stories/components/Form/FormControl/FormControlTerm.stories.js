import FormControlTerm from '@/components/Form/FormControl/FormControlTerm'

export default {
  title: 'Components/Form/FormControl/FormControlTerm',
  tags: ['autodocs'],
  component: FormControlTerm,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    }
  },
  args: {
    modelValue: ['Emmanuel AND Macron', 'path:"/vault/macronleaks"'],
    options: [],
    size: 'md'
  }
}

export const Default = {}
