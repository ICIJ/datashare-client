import SearchBreadcrumbEntryFilter from '@/components/SearchBreadcrumb/SearchBreadcrumbEntryFilter'

export default {
  decorators: [],
  title: 'Components/SearchBreadcrumb/SearchBreadcrumbEntryFilter',
  component: { SearchBreadcrumbEntryFilter },
  tags: ['autodocs'],
  args: {
    name: 'path',
    value: '/vault/luxleaks/importantfolder/',
    icon: 'tree-structure',
    color: null
  },
  render: (args) => ({
    components: {
      SearchBreadcrumbEntryFilter
    },
    setup() {
      return { args }
    },
    template: `
      <search-breadcrumb-entry-filter v-bind="args" />
    `
  })
}

export const Default = {}

export const UnknownFilter = {
  args: {
    name: 'hipsDontLie',
    value: 'Shakira',
    icon: 'music-notes',
    color: '#a50000'
  }
}
