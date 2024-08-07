import ButtonIcon from '@/components/Button/ButtonIcon'

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
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg']
    },
    variant: {
      control: { type: 'select' },
      options: [
        'action',
        'primary',
        'secondary',
        'success',
        'danger',
        'warning',
        'info',
        'light',
        'dark',
        'outline-action',
        'outline-primary',
        'outline-secondary',
        'outline-success',
        'outline-danger',
        'outline-warning',
        'outline-info',
        'outline-light',
        'outline-dark'
      ]
    },
    pill: {
      control: { type: 'boolean' }
    },
    loading: {
      control: { type: 'boolean' }
    },
    counter: {
      control: { type: 'number' }
    },
    counterVariant: {
      control: { type: 'select' },
      options: [
        'action',
        'primary',
        'secondary',
        'success',
        'danger',
        'warning',
        'info',
        'light',
        'dark',
        'outline-action',
        'outline-primary',
        'outline-secondary',
        'outline-success',
        'outline-danger',
        'outline-warning',
        'outline-info',
        'outline-light',
        'outline-dark'
      ]
    }
  },
  args: {
    variant: 'action',
    size: 'md',
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
    variant: 'action',
    size: 'md',
    label: 'Button',
    iconLeft: 'CirclesThreePlus'
  }
}

export const IconBothSide = {
  args: {
    variant: 'action',
    size: 'md',
    label: 'Save search',
    iconLeft: 'CirclesThreePlus',
    iconRight: 'users'
  }
}

export const IconRight = {
  args: {
    variant: 'action',
    size: 'md',
    label: 'Button',
    iconRight: 'users'
  }
}

export const WithCounter = {
  args: {
    variant: 'outline-primary',
    size: 'md',
    label: 'Shakira',
    iconLeft: 'UserCircle',
    counter: 134
  }
}

export const HideLabel = {
  args: {
    variant: 'action',
    size: 'md',
    label: 'Button',
    hideLabel: true,
    iconRight: 'users'
  }
}

export const Square = {
  args: {
    variant: 'action',
    size: 'md',
    label: 'Path',
    hideLabel: true,
    pill: false,
    square: true,
    iconRight: 'path'
  }
}

export const SquareWithCounter = {
  args: {
    variant: 'action',
    size: 'md',
    label: 'Path',
    hideLabel: true,
    pill: false,
    square: true,
    iconRight: 'path',
    counter: '6',
    counterVariant: 'action'
  }
}

export const SquarePill = {
  args: {
    variant: 'action',
    size: 'md',
    label: 'Close',
    hideLabel: true,
    pill: true,
    square: true,
    iconRight: 'x'
  }
}

export const Truncated = {
  args: {
    variant: 'action',
    size: 'md',
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
    variant: 'action',
    size: 'md',
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
    variant: 'secondary',
    size: 'md',
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
