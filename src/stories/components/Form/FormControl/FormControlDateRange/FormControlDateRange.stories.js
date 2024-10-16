import FormControlDateRange from '@/components/Form/FormControl/FormControlDateRange/FormControlDateRange'

export default {
  title: 'Components/Form/FormControl/FormControlDateRange/FormControlDateRange',
  tags: ['autodocs'],
  component: FormControlDateRange,
  args: {
    modelValue: [new Date('2017-05-07'), new Date('2017-11-05')]
  },
  decorators: [
    () => ({
      template: '<div class="px-4 py-5"><story /></div>'
    })
  ]
}

export const Default = {}
