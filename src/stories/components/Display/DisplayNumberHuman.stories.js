import DisplayNumberHuman from '@/components/Display/DisplayNumberHuman'

export default {
  title: 'Components/Display/DisplayNumberHuman',
  tags: ['autodocs'],
  component: DisplayNumberHuman,
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

export const Hundreds = {
  args: {
    value: 3e2
  }
}

export const Thousands = {
  args: {
    value: 4e3
  }
}

export const Millions = {
  args: {
    value: 5e6
  }
}
