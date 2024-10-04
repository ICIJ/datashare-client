import { vueRouter } from 'storybook-vue3-router'

import WidgetFieldFacetsEntry from '@/components/Widget/WidgetFieldFacetsEntry'

export default {
  title: 'Components/Widget/WidgetFieldFacetsEntry',
  decorators: [vueRouter([{ name: 'search' }])],
  component: WidgetFieldFacetsEntry,
  tags: ['autodocs'],
  args: {
    label: 'English',
    count: 6781,
    total: 1e4,
    to: { name: 'search' }
  }
}

export const Default = {}
