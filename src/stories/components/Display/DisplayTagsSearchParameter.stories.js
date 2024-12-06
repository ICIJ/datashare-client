import DisplayTagsSearchParameter from '@/components/Display/DisplayTagsSearchParameter'

export default {
  title: 'Components/Display/DisplayTagsSearchParameter',
  tags: ['autodocs'],
  component: DisplayTagsSearchParameter,
  args: {
    value: ['foo', 'bar', 'baz']
  }
}

export const Default = {}
export const NoXIcon = {
  args: {
    noXIcon: true
  }
}
