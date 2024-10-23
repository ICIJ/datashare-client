import DisplayExtractionLevel from '@/components/Display/DisplayExtractionLevel'

export default {
  title: 'Components/Display/DisplayExtractionLevel',
  tags: ['autodocs'],
  component: DisplayExtractionLevel,
  argTypes: {
    value: {
      type: 'number'
    }
  },
  args: {
    value: 5
  }
}

export const Default = {}

export const OnDisk = {
  args: {
    value: 0
  }
}
