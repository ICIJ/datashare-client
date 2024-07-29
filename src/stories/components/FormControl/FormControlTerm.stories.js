import FormControlTerm from '@/components/FormControl/FormControlTerm'

export default {
  title: 'Components/FormControl/FormControlTerm',
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
