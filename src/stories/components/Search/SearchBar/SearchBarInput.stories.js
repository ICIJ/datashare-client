import SearchBarInput from '@/components/Search/SearchBar/SearchBarInput'
import { buttonSizesArgType } from '~storybook/utils'
import { SIZE } from '@/enums/sizes'

export default {
  title: 'Components/Search/SearchBar/SearchBarInput',
  tags: ['autodocs'],
  component: SearchBarInput,
  argTypes: {
    placeholder: {
      control: {
        type: 'string'
      }
    },
    modelValue: {
      control: {
        type: 'string'
      }
    },
    size: buttonSizesArgType,
    disableSubmit: {
      control: {
        type: 'boolean'
      }
    },
    showSubmit: {
      control: {
        type: 'boolean'
      }
    },
    hideTips: {
      control: {
        type: 'boolean'
      }
    }
  }
}

export const Default = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    size: SIZE.LG,
    disableSubmit: false,
    hideTips: true,
    showSubmit: false
  }
}

export const ShowTips = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    size: SIZE.MD,
    disableSubmit: false,
    hideTips: false,
    showSubmit: false
  }
}

export const ShowSubmit = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    size: SIZE.MD,
    disableSubmit: false,
    hideTips: false,
    showSubmit: true
  }
}
export const AddonSlot = {
  render: args => ({
    components: {
      SearchBarInput
    },
    setup: () => ({ args }),
    template: `
      <search-bar-input v-bind="args">
        <template #addons>
          <span class="ms-2">Addon goes here</span>
        </template>
      </search-bar-input>
    `
  }),
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    size: SIZE.MD,
    disableSubmit: false,
    hideTips: false,
    showSubmit: true
  }
}
