import ContentTypesAll from '@/components/ContentTypes/ContentTypesAll'

export default {
  tags: ['autodocs'],
  title: 'Components/ContentTypes/ContentTypesAll',
  component: ContentTypesAll,
  args: {
    count: 2344,
    modelValue: true
  }
}

export const Default = {}

export const SomeFilterApplied = {
  args: {
    modelValue: false
  }
}
