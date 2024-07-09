import SearchFormControl from '@/components/SearchFormControl'

export default {
  title: 'Layout/SearchFormControl',
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: {
        type: 'string'
      }
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg']
    },
    noIcon: {
      control: {
        type: 'boolean'
      }
    },
    iconName: {
      control: {
        type: 'string'
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
    size: 'md',
    clearText: true,
    rounded: false
  }
}
export const Large = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    size: 'lg',
    clearText: true,
    rounded: false
  }
}

export const Small = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    size: 'sm',
    clearText: true,
    rounded: false
  }
}

export const FilterIcon = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: 'test',
    noIcon: false,
    iconName: 'funnel'
  }
}
export const NoIcon = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: 'test',
    noIcon: true
  }
}

export const NoClearTextIcon = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    clearText: false
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
