import { ButtonIcon } from '@icij/murmur-next'

import IPhArrowCounterClockwise from '~icons/ph/arrow-counter-clockwise'
import IPhCaretRight from '~icons/ph/caret-right'
import IPhDownload from '~icons/ph/download'
import IPhList from '~icons/ph/list'
import IPhStar from '~icons/ph/star'
import IPhTag from '~icons/ph/tag'
import IPhUserGear from '~icons/ph/user-gear'
import IPhX from '~icons/ph/x'

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
      components: { FormActions, ButtonIcon, IPhX, IPhArrowCounterClockwise, IPhCaretRight },
      template: `
        <form-actions v-bind="args">
          10 items selected
          <button-icon :icon-left="IPhX">Cancel</button-icon>
          <button-icon :icon-left="IPhArrowCounterClockwise">Reset</button-icon>
          <button-icon variant="action" :icon-right="IPhCaretRight">Proceed</button-icon>
        </form-actions>
      `,
      data() {
        return { args, IPhX, IPhArrowCounterClockwise, IPhCaretRight }
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
      components: { FormActions, ButtonIcon, IPhList, IPhStar, IPhTag, IPhUserGear, IPhDownload },
      template: `
        <form-actions v-bind="args">
          <template #start>
            <button-icon :icon-left="IPhList">Menu</button-icon>
          </template>
          <template #compact>
            <button-icon :icon-left="IPhStar">Star</button-icon>
          </template>
          <button-icon :icon-left="IPhTag">Tag</button-icon>
          <button-icon :icon-left="IPhUserGear">Recommend</button-icon>
          <button-icon :icon-left="IPhDownload">Download</button-icon>
        </form-actions>
      `,
      data() {
        return { args, IPhList, IPhStar, IPhTag, IPhUserGear, IPhDownload }
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
