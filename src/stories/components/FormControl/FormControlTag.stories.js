import FormControlTag from '@/components/FormControl/FormControlTag'

export default {
  title: 'Components/FormControl/FormControlTag',
  tags: ['autodocs'],
  component: FormControlTag,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    }
  },
  args: {
    modelValue: ["Foo", "Bar"],
    options: [],
    size: 'md'
  }
}

export const Default = {}
