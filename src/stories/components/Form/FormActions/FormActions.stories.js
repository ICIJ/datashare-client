import { ButtonIcon } from '@icij/murmur-next'

import FormActions from '@/components/Form/FormActions/FormActions'
import { VARIANT } from '@/enums/variants'
import { buttonSizesArgType, variantsArgType } from '~storybook/utils'
import { SIZE } from '@/enums/sizes'

export default {
  title: 'Components/Form/FormActions/FormActions',
  tags: ['autodocs'],
  component: FormActions,
  argTypes: {
    compact: {
      control: 'boolean'
    },
    size: buttonSizesArgType,
    variant: variantsArgType,
    compactVariant: variantsArgType
  },
  args: {
    size: SIZE.MD,
    end: true,
    variant: VARIANT.OUTLINE_SECONDARY,
    compactVariant: VARIANT.ACTION
  },
  render(args) {
    return {
      components: { FormActions, ButtonIcon },
      template: `
        <form-actions v-bind="args">
          10 items selected
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
