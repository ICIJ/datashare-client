import FormControlDateRange from '@/components/Form/FormControl/FormControlDateRange/FormControlDateRange'

export default {
  title: 'Components/Form/FormControl/FormControlDateRange/FormControlDateRange',
  tags: ['autodocs'],
  component: FormControlDateRange,
  args: {
    modelValue: {
      start: null,
      end: null
    }
  },
  decorators: [
    () => ({
      template: '<div class="px-4 py-5"><story /></div>'
    })
  ]
}

export const Default = {}
