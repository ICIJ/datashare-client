import SearchBarInput from '@/components/SearchBarInput'

export default {
  title: 'Components/SearchBar/SearchBarInput',
  tags: ['autodocs'],
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
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg']
    },
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
  },
  render: (args) => ({
    components: {
      SearchBarInput
    },
    setup: () => ({ args }),
    template: `
      <search-bar-input v-bind="args">
      </search-bar-input>
    `
  })
}

export const Default = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    size: 'lg',
    disableSubmit: false,
    hideTips: true,
    showSubmit: false
  }
}

export const ShowTips = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    size: 'md',
    disableSubmit: false,
    hideTips: true,
    showSubmit: false
  }
}

export const ShowSubmit = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    size: 'md',
    disableSubmit: false,
    hideTips: true,
    showSubmit: true
  }
}
