import { uniqueId } from 'lodash'
import { AppIcon } from '@icij/murmur-next'

import IPhArrowSquareOut from '~icons/ph/arrow-square-out'
import DismissableAlert from '@/components/Dismissable/DismissableAlert'
import { variantsPlainArgType } from '~storybook/utils'
import { VARIANT } from '@/enums/variants'

export default {
  title: 'Components/Dismissable/DismissableAlert',
  tags: ['autodocs'],
  component: DismissableAlert,
  argTypes: {
    variant: variantsPlainArgType,
    name: {
      control: { type: 'text' }
    },
    icon: {
      control: { type: 'text' }
    }
  },
  args: {
    variant: VARIANT.PRIMARY,
    name: uniqueId('a-unique-name-'),
    persist: false,
    noIcon: false,
    noButton: false,
    bordered: false,
    default: `A simple alert lorem ipsum dolor sit amet, consectetur adipiscing elit.`
  },
  parameters: {
    slots: {
      default: `Default slot content`
    }
  }
}

export const Default = {
  args: {
    persist: false,
    name: 'a-unique-name'
  }
}

export const CustomSlots = {
  args: {
    variant: VARIANT.INFO,
    icon: 'book'
  },
  render: args => ({
    components: {
      DismissableAlert,
      AppIcon,
      IPhArrowSquareOut
    },
    setup: () => ({ args }),
    template: `
      <dismissable-alert v-bind="args">
        A simple <strong>{{ args.variant }}</strong> alert lorem ipsum dolor sit amet, consectetur adipiscing elit.
        <template #button="{ linkClassList, linkLabel }">
          <a href="/" target="_parent" class="btn d-inline-flex ms-md-3"  :class="linkClassList">
            Read the doc
            <AppIcon weight="bold" class="ms-2"><IPhArrowSquareOut /></AppIcon>
          </a>
        </template>
      </dismissable-alert>
    `
  })
}
