import FormControlRange from '@/components/FormControl/FormControlRange/FormControlRange'

export default {
  title: 'Components/FormControl/FormControlRange/FormControlRange',
  tags: ['autodocs'],
  component: FormControlRange,
  args: {
    modelValue: 1,
    min: 1,
    max: 6
  },
  decorators: [
    () => ({
      template: '<div class="p-4"><story /></div>'
    })
  ]
}

export const Default = {}
