import IconButton from '@/components/IconButton'

export default {
  components: { IconButton },
  title: 'Components/Button/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg']
    },
    variant: {
      control: { type: 'select' },
      options: ['action', 'primary', 'secondary', 'tertiary', 'light']
    },
    pill: {
      control: { type: 'boolean' }
    },
    loading: {
      control: { type: 'boolean' }
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

export const HideLabel = {
  args: {
    variant: 'action',
    size: 'md',
    label: 'Button',
    hideLabel: true,
    iconRight: 'users'
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
      IconButton
    },
    setup() {
      return {
        args
      }
    },
    template: `
      <p class="text-muted">Click to toggle loading state.</p>
      <icon-button v-bind="args" @click="args.loading = !args.loading" />
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
      IconButton
    },
    setup() {
      return {
        args
      }
    },
    template: `
      <p class="text-muted">Click to toggle loading state.</p>
      <icon-button v-bind="args" @click="args.loading = !args.loading" />
    `
  })
}
