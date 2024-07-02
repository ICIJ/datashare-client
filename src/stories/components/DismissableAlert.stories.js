import { uniqueId } from 'lodash'

import DismissableAlert from '@/components/DismissableAlert'
import PhosphorIcon from '@/components/PhosphorIcon'

export default {
  title: 'Components/DismissableAlert',
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark']
    },
    name: {
      control: { type: 'text' }
    },
    icon: {
      control: { type: 'text' }
    }
  },
  args: {
    variant: 'primary',
    name: uniqueId('a-unique-name-'),
    persist: false,
    noIcon: false,
    noButton: false
  },
  render: (args) => ({
    components: {
      DismissableAlert
    },
    setup: () => ({ args }),
    template: `
      <dismissable-alert v-bind="args">
        A simple <strong>{{ args.variant }}</strong> alert lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </dismissable-alert>
    `
  })
}

export const Default = {
  args: {
    persist: false,
    name: 'a-unique-name'
  }
}

export const CustomSlots = {
  args: {
    variant: 'info',
    icon: 'book'
  },
  render: (args) => ({
    components: {
      DismissableAlert,
      PhosphorIcon
    },
    setup: () => ({ args }),
    template: `
      <dismissable-alert v-bind="args">
        A simple <strong>{{ args.variant }}</strong> alert lorem ipsum dolor sit amet, consectetur adipiscing elit.
        <template #button="{ linkClassList, linkLabel }">
          <a href="/" target="_parent" class="btn d-inline-flex"  :class="linkClassList">
            Read the doc
            <phosphor-icon name="arrow-square-out" size="16px" class="ms-2" />
          </a>
          <a class="btn btn-link d-inline-flex" :title="linkLabel" v-b-tooltip>
            <phosphor-icon name="x" size="20px" />
          </a>
        </template>
      </dismissable-alert>
    `
  })
}
