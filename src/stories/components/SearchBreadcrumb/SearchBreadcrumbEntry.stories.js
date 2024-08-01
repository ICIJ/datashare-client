import SearchBreadcrumbEntry from '@/components/SearchBreadcrumb/SearchBreadcrumbEntry'

export default {
  decorators: [],
  title: 'Components/SearchBreadcrumb/SearchBreadcrumbEntry',
  tags: ['autodocs'],
  component: SearchBreadcrumbEntry,
  args: {
    query: 'London AND Biden AND -JO',
    occurrences: 987
  }
}

export const Default = {}

export const QueryWithOperator = {
  args: {
    query: 'Paulette OR Pierre',
    occurrences: 452645
  }
}

export const QueryWithFilter = {
  args: {
    query: 'contentType:"application/pdf"',
    occurrences: 5687
  }
}

export const QueryWithError = {
  args: {
    query: 'contentType:application/pdf',
    occurrences: 0
  }
}

export const Filter = {
  args: {
    query: '',
    filter: 'contentType',
    value: 'application/pdf',
    occurrences: 5687
  }
}

export const FilterWithColor = {
  args: {
    query: '',
    filter: 'namedEntityPerson',
    value: 'Shakira',
    icon: 'music-notes',
    color: '#a50000',
    occurrences: 5687
  }
}
