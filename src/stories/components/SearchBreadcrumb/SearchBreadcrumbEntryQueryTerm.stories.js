import SearchBreadcrumbEntryQueryTerm from '@/components/SearchBreadcrumb/SearchBreadcrumbEntryQueryTerm'

export default {
  decorators: [],
  title: 'Components/SearchBreadcrumb/SearchBreadcrumbEntryQueryTerm',
  component: { SearchBreadcrumbEntryQueryTerm },
  tags: ['autodocs'],
  args: {
    term: 'Elton John',
    prefix: ''
  },
  render: (args) => ({
    components: {
      SearchBreadcrumbEntryQueryTerm
    },
    setup() {
      return { args }
    },
    template: `
      <search-breadcrumb-entry-query-term v-bind="args" />
    `
  })
}

export const Default = {}

export const WithPrefix = {
  args: {
    term: 'Queen Elisabeth II',
    prefix: '-'
  }
}
