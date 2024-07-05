import IconButton from '@/components/IconButton'

export default {
  components: { IconButton },
  title: 'Components/Button/IconButtons',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg']
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary', 'light']
    },
    pill: {
      control: { type: 'boolean' }
    },
    loading: {
      control: { type: 'boolean' }
    }
  },
  args: {
    variant: 'primary',
    size: 'md',
    pill: false,
    loading: false
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
      <IconButton v-bind="args" >{{args.label}}</IconButton>
    `
  }),
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
    variant: 'primary',
    size: 'md',
    label: 'Button',
    iconLeft: 'CirclesThreePlus'
  }
}

export const IconBothSide = {
  args: {
    variant: 'primary',
    size: 'md',
    label: 'Save search',
    iconLeft: 'CirclesThreePlus',
    iconRight: 'users'
  }
}

export const IconRight = {
  args: {
    variant: 'primary',
    size: 'md',
    label: 'Button',
    iconRight: 'users'
  }
}

export const HideLabel = {
  args: {
    variant: 'primary',
    size: 'md',
    label: 'Button',
    hideLabel: true,
    iconRight: 'users'
  }
}

export const SquarePill = {
  args: {
    variant: 'primary',
    size: 'md',
    label: 'Close',
    hideLabel: true,
    pill: true,
    square: true,
    iconRight: 'x'
  }
}
