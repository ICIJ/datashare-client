import SearchBreadcrumbEntryQueryTerm from '@/components/Search/SearchBreadcrumb/SearchBreadcrumbEntryQueryTerm'

export default {
  decorators: [],
  title: 'Components/Search/SearchBreadcrumb/SearchBreadcrumbEntryQueryTerm',
  component: SearchBreadcrumbEntryQueryTerm,
  tags: ['autodocs'],
  args: {
    term: 'Elton John',
    prefix: ''
  }
}

export const Default = {}

export const WithPrefix = {
  args: {
    term: 'Queen Elisabeth II',
    prefix: '-'
  }
}
