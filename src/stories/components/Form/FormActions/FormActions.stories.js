import FormActions from '@/components/Form/FormActions/FormActions'
import ButtonIcon from '@/components//Button/ButtonIcon'

export default {
  title: 'Components/Form/FormActions/FormActions',
  tags: ['autodocs'],
  component: FormActions,
  argTypes: {
    compact: {
      control: 'boolean'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    variant: {
      control: 'select',
      options: [
        'action',
        'primary',
        'secondary',
        'tertiary',
        'danger',
        'info',
        'success',
        'warning',
        'light',
        'dark',
        'outline-primary',
        'outline-secondary',
        'outline-secondary',
        'outline-danger',
        'outline-info',
        'outline-success',
        'outline-warning',
        'outline-tertiary',
        'outline-dark',
        'outline-light'
      ]
    },
    compactVariant: {
      control: 'select',
      options: [
        'action',
        'primary',
        'secondary',
        'tertiary',
        'danger',
        'info',
        'success',
        'warning',
        'light',
        'dark',
        'outline-primary',
        'outline-secondary',
        'outline-secondary',
        'outline-danger',
        'outline-info',
        'outline-success',
        'outline-warning',
        'outline-tertiary',
        'outline-dark',
        'outline-light'
      ]
    }
  },
  args: {
    size: 'md',
    variant: 'outline-secondary',
    compactVariant: 'action'
  },
  render(args) {
    return {
      components: { FormActions, ButtonIcon },
      template: `
        <form-actions v-bind="args">
          <button-icon icon-left="x">Cancel</button-icon>
          <button-icon icon-left="arrow-counter-clockwise">Reset</button-icon>
          <button-icon variant="action" icon-right="caret-right">Proceed</button-icon>
        </form-actions>
      `,
      data() {
        return { args }
      }
    }
  }
}

export const Default = {}

export const Compact = {
  args: {
    compact: true
  },
  render(args) {
    return {
      components: { FormActions, ButtonIcon },
      template: `
        <form-actions v-bind="args">
          <template #start>
            <button-icon icon-left="hamburger">Menu</button-icon>
          </template>
          <template #compact>
            <button-icon icon-left="star">Star</button-icon>
          </template>
          <button-icon icon-left="tag">Tag</button-icon>
          <button-icon icon-left="user-gear">Recommend</button-icon>
          <button-icon icon-left="download">Download</button-icon>
        </form-actions>
      `,
      data() {
        return { args }
      }
    }
  }
}

export const CompactAuto = {
  ...Compact,
  args: {
    compactAuto: true
  }
}
