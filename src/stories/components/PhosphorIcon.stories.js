import PhosphorIcon from '@/components/PhosphorIcon'

export default {
  title: 'Components/PhosphorIcon',
  component: PhosphorIcon,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary', 'body-color']
    },
    weight: {
      control: { type: 'select' },
      options: ['thin', 'light', 'regular', 'bold', 'fill', 'duotone']
    },
    spin: {
      control: { type: 'boolean' }
    }
  },
  args: {
    weight: 'regular',
    spin: false,
    spinDuration: '1s'
  },
  render: (args) => ({
    components: {
      PhosphorIcon
    },
    setup() {
      return {
        args
      }
    },
    template: `
      <phosphor-icon v-bind="args"/>
    `
  })
}

export const Default = {
  args: {
    name: 'User',
    size: '32px'
  }
}

export const WeightBold = {
  args: {
    name: 'User',
    weight: 'bold',
    size: '32px'
  }
}

export const WeightFill = {
  args: {
    name: 'User',
    weight: 'fill',
    size: '32px'
  }
}

export const WeightDuotone = {
  args: {
    name: 'User',
    weight: 'duotone',
    size: '32px'
  }
}

export const Spinning = {
  args: {
    name: 'circle-notch',
    size: '32px',
    spin: true
  }
}
