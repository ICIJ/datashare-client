import types from '@/utils/content-types.json'
import FormControlTag from '@/components/Form/FormControl/FormControlTag/FormControlTag'
import { buttonSizesArgType } from '~storybook/utils'
import { SIZE } from '@/enums/sizes'

export default {
  title: 'Components/Form/FormControl/FormControlTag/FormControlTag',
  tags: ['autodocs'],
  component: FormControlTag,
  argTypes: {
    size: buttonSizesArgType
  },
  args: {
    modelValue: ['Foo', 'Bar'],
    options: ['Foo', 'Bar', 'Baz', 'Qux'],
    noDuplicates: true,
    size: SIZE.MD
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
