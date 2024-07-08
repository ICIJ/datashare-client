import SearchFormControl from '@/components/SearchFormControl'

export default {
  title: 'Components/SearchBar/SearchFormControl',
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: {
        type: 'string'
      }
    },
    noIcon: {
      control: {
        type: 'boolean'
      }
    },
    autofocus: {
      control: {
        type: 'boolean'
      }
    },
    rounded: {
      control: {
        type: 'boolean'
      }
    },
    loading: {
      control: {
        type: 'boolean'
      }
    },
    small: {
      control: {
        type: 'boolean'
      }
    }
  },
  render: (args) => ({
    components: {
      SearchFormControl
    },
    setup: () => ({ args }),
    template: `
      <search-form-control v-bind="args">
      </search-form-control>
    `
  })
}

export const Default = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    small: false
  }
}
export const NoIcon = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: 'test',
    noIcon: true,
    false: true
  }
}

export const Small = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    small: true
  }
}

export const clearTextIcon = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    clearTextIcon: true
  }
}

export const Rounded = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    small: false,
    rounded: true
  }
}
