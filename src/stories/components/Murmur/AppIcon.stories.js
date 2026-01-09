import { AppIcon } from '@icij/murmur-next'

import { variantsPlainArgType } from '~storybook/utils'

export default {
  title: 'Components/Murmur/AppIcon',
  tags: ['autodocs'],
  component: AppIcon,
  argTypes: {
    variant: variantsPlainArgType,
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
    spin: false,
    spinReverse: false,
    beat: false,
    fade: false,
    spinDuration: '1s'
  }
}

export const Default = {
  args: {
    size: '32px'
  },
  render: args => ({
    components: { AppIcon },
    setup() {
      return { args }
    },
    template: `
      <app-icon v-bind="args">
        <i-ph-user />
      </app-icon>
    `
  })
}

export const WeightBold = {
  args: {
    size: '32px'
  },
  render: args => ({
    components: { AppIcon },
    setup() {
      return { args }
    },
    template: `
      <app-icon v-bind="args">
        <i-ph-user-bold />
      </app-icon>
    `
  })
}

export const WeightFill = {
  args: {
    size: '32px'
  },
  render: args => ({
    components: { AppIcon },
    setup() {
      return { args }
    },
    template: `
      <app-icon v-bind="args">
        <i-ph-user-fill />
      </app-icon>
    `
  })
}

export const WeightDuotone = {
  args: {
    size: '32px'
  },
  render: args => ({
    components: { AppIcon },
    setup() {
      return { args }
    },
    template: `
      <app-icon v-bind="args">
        <i-ph-user-duotone />
      </app-icon>
    `
  })
}

export const HoverVariant = {
  args: {
    variant: 'link',
    hoverVariant: 'danger',
    size: '2xl'
  },
  render: args => ({
    components: { AppIcon },
    setup() {
      return { args }
    },
    template: `
      <app-icon v-bind="args">
        <i-ph-trash />
      </app-icon>
    `
  })
}

export const Spinning = {
  args: {
    size: '32px',
    spin: true
  },
  render: args => ({
    components: { AppIcon },
    setup() {
      return { args }
    },
    template: `
      <app-icon v-bind="args">
        <i-ph-circle-notch />
      </app-icon>
    `
  })
}

export const Beating = {
  args: {
    size: '32px',
    beat: true,
    variant: 'danger'
  },
  render: args => ({
    components: { AppIcon },
    setup() {
      return { args }
    },
    template: `
      <app-icon v-bind="args">
        <i-ph-heart-fill />
      </app-icon>
    `
  })
}

export const Fading = {
  args: {
    size: '32px',
    fade: true,
    fadeDuration: '3s',
    variant: 'success'
  },
  render: args => ({
    components: { AppIcon },
    setup() {
      return { args }
    },
    template: `
      <app-icon v-bind="args">
        <i-ph-alien-duotone />
      </app-icon>
    `
  })
}

export const VariantPrimary = {
  args: {
    variant: 'primary',
    size: '32px'
  },
  render: args => ({
    components: { AppIcon },
    setup() {
      return { args }
    },
    template: `
      <app-icon v-bind="args">
        <i-ph-rocket />
      </app-icon>
    `
  })
}

export const VariantSecondary = {
  args: {
    variant: 'secondary',
    size: '32px'
  },
  render: args => ({
    components: { AppIcon },
    setup() {
      return { args }
    },
    template: `
      <app-icon v-bind="args">
        <i-ph-rocket />
      </app-icon>
    `
  })
}
