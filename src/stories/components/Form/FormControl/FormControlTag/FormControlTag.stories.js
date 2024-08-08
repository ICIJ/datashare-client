import types from '@/utils/types'
import FormControlTag from '@/components/Form/FormControl/FormControlTag/FormControlTag'

export default {
  title: 'Components/Form/FormControl/FormControlTag/FormControlTag',
  tags: ['autodocs'],
  component: FormControlTag,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    }
  },
  args: {
    modelValue: ['Foo', 'Bar'],
    options: ['Foo', 'Bar', 'Baz', 'Qux'],
    noDuplicates: true,
    size: 'md'
  },
  decorators: [
    () => ({
      template: '<div style="padding-bottom: 15vh;"><story /></div>'
    })
  ]
}

export const Default = {}

export const WithManyValues = {
  args: {
    options: Object.values(types),
    trackBy: 'label',
    searchKeys: ['label'],
    placeholder: 'Search file type',
    noDuplicates: true,
    noCreate: true,
    modelValue: []
  }
}

export const WithoutTags = {
  args: {
    modelValue: ['Foo', 'Bar'],
    options: ['Foo', 'Bar', 'Baz', 'Qux'],
    noDuplicates: true,
    noTags: true,
    noClear: true,
    addButtonText: 'Create',
    addButtonSize: 'sm',
    size: 'md'
  }
}
