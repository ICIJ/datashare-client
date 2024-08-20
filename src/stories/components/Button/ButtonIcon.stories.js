import ButtonIcon from '@/components/Button/ButtonIcon'
import { buttonSizesArgType, variantsArgType } from '~storybook/utils'
import { VARIANT } from '@/enums/variants'
import { SIZE } from '@/enums/sizes'

export default {
  components: { ButtonIcon },
  title: 'Components/Button/ButtonIcon',
  component: ButtonIcon,
  tags: ['autodocs'],
  decorators: [
    () => ({
      template: '<div class="p-4"><story /></div>'
    })
  ],
  argTypes: {
    size: buttonSizesArgType,
    variant: variantsArgType,
    pill: {
      control: { type: 'boolean' }
    },
    loading: {
      control: { type: 'boolean' }
    },
    counter: {
      control: { type: 'number' }
    },
    counterVariant: variantsArgType
  },
  args: {
    variant: VARIANT.ACTION,
    size: SIZE.MD,
    pill: false,
    loading: false
  },
  parameters: {
    pseudo: {
      hover: ['#hover'],
      focus: ['#focus'],
      active: ['#active']
    }
  }
}

export const IconLeft = {
  args: {
    variant: VARIANT.ACTION,
    size: SIZE.MD,
    label: 'Button',
    iconLeft: 'CirclesThreePlus'
  }
}

export const IconBothSide = {
  args: {
    variant: VARIANT.ACTION,
    size: SIZE.MD,
    label: 'Save search',
    iconLeft: 'CirclesThreePlus',
    iconRight: 'users'
  }
}

export const IconRight = {
  args: {
    variant: VARIANT.ACTION,
    size: SIZE.MD,
    label: 'Button',
    iconRight: 'users'
  }
}

export const WithCounter = {
  args: {
    variant: VARIANT.OUTLINE_PRIMARY,
    size: SIZE.MD,
    label: 'Shakira',
    iconLeft: 'UserCircle',
    counter: 134
  }
}

export const HideLabel = {
  args: {
    variant: VARIANT.ACTION,
    size: SIZE.MD,
    label: 'Button',
    hideLabel: true,
    iconRight: 'users'
  }
}

export const Square = {
  args: {
    variant: VARIANT.ACTION,
    size: SIZE.MD,
    label: 'Path',
    hideLabel: true,
    pill: false,
    square: true,
    iconRight: 'path'
  }
}

export const SquareWithCounter = {
  args: {
    variant: VARIANT.ACTION,
    size: SIZE.MD,
    label: 'Path',
    hideLabel: true,
    pill: false,
    square: true,
    iconRight: 'path',
    counter: 6,
    counterVariant: VARIANT.ACTION
  }
}

export const SquarePill = {
  args: {
    variant: VARIANT.ACTION,
    size: SIZE.MD,
    label: 'Close',
    hideLabel: true,
    pill: true,
    square: true,
    iconRight: 'x'
  }
}

export const Truncated = {
  args: {
    variant: VARIANT.ACTION,
    size: SIZE.MD,
    label: 'Saving the tags',
    truncate: true,
    iconLeft: 'floppy-disk'
  },
  render: (args) => ({
    components: {
      ButtonIcon
    },
    setup() {
      return {
        args
      }
    },
    template: `
      <div style="max-width: 150px">
        <button-icon v-bind="args" />
      </div>
    `
  })
}

export const Loading = {
  args: {
    variant: VARIANT.ACTION,
    size: SIZE.MD,
    label: 'Save',
    pill: true,
    loading: true,
    iconLeft: 'floppy-disk'
  },
  render: (args) => ({
    components: {
      ButtonIcon
    },
    setup() {
      return {
        args
      }
    },
    template: `
      <p class="text-muted">Click to toggle loading state.</p>
      <button-icon v-bind="args" @click="args.loading = !args.loading" />
    `
  })
}

export const LoadingSpinner = {
  args: {
    variant: VARIANT.SECONDARY,
    size: SIZE.MD,
    label: 'Refresh',
    pill: true,
    loading: true,
    loadingDuration: '500ms',
    loadingText: 'Refreshing...',
    iconLeft: 'arrow-clockwise',
    iconSpinner: 'arrow-clockwise'
  },
  render: (args) => ({
    components: {
      ButtonIcon
    },
    setup() {
      return {
        args
      }
    },
    template: `
      <p class="text-muted">Click to toggle loading state.</p>
      <button-icon v-bind="args" @click="args.loading = !args.loading" />
    `
  })
}
