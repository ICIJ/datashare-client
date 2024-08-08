import FormControlRange from '@/components/Form/FormControl/FormControlRange/FormControlRange'

export default {
  title: 'Components/Form/FormControl/FormControlRange/FormControlRange',
  tags: ['autodocs'],
  component: FormControlRange,
  args: {
    modelValue: 0,
    min: 0,
    max: 2
  },
  decorators: [
    () => ({
      template: '<div class="p-4"><story /></div>'
    })
  ]
}

export const Default = {}

export const MaxSix = {
  args: {
    modelValue: 0,
    min: 0,
    max: 6
  }
}
