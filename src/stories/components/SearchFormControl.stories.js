import SearchFormControl from '@/components/SearchFormControl'

export default {
  title: 'Components/SearchBar/SearchFormControl',
  tags: ['autodocs'],
  component: SearchFormControl,
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
    },
    shadow: {
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
    rounded: false,
    shadow: false
  }
}
export const LargeShadow = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    size: 'lg',
    clearText: true,
    rounded: false,
    shadow: true
  }
}
export const Small = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    size: 'sm',
    clearText: true,
    rounded: false,
    shadow: false
  }
}

export const FilterIcon = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: 'test',
    noIcon: false,
    iconName: 'funnel',
    shadow: false
  }
}
export const NoIcon = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: 'test',
    noIcon: true,
    shadow: false
  }
}

export const NoClearTextIcon = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    clearText: false,
    shadow: false
  }
}

export const Rounded = {
  args: {
    placeholder: 'Type queries, use operators or type regex...',
    modelValue: '',
    small: false,
    rounded: true,
    shadow: false
  }
}
