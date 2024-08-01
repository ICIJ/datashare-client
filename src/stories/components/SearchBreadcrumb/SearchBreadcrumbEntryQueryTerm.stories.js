import SearchBreadcrumbEntryQueryTerm from '@/components/SearchBreadcrumb/SearchBreadcrumbEntryQueryTerm'

export default {
  decorators: [],
  title: 'Components/SearchBreadcrumb/SearchBreadcrumbEntryQueryTerm',
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
