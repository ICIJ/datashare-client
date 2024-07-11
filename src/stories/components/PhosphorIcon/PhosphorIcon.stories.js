import { PhosphorIcon } from '@icij/murmur-next'

export default {
  title: 'Components/Phosphor/Icon',
  tags: ['autodocs'],
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
    },
    spinReverse: {
      control: { type: 'boolean' }
    },
    beat: {
      control: { type: 'boolean' }
    },
    fade: {
      control: { type: 'boolean' }
    }
  },
  args: {
    weight: 'regular',
    spin: false,
    spinReverse: false,
    beat: false,
    fade: false,
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

export const Beating = {
  args: {
    name: 'heart',
    size: '32px',
    fill: true,
    beat: true,
    variant: 'danger'
  }
}

export const Fading = {
  args: {
    name: 'alien',
    size: '32px',
    weight: 'duotone',
    fade: true,
    fadeDuration: '3s',
    variant: 'success'
  }
}

export const VariantPrimary = {
  args: {
    name: 'rocket',
    variant: 'primary',
    size: '32px'
  }
}

export const VariantSecondary = {
  args: {
    name: 'rocket',
    variant: 'secondary',
    size: '32px'
  }
}
