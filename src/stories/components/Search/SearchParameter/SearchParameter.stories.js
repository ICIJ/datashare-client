import SearchParameter from '@/components/Search/SearchParameter/SearchParameter'

export default {
  decorators: [],
  title: 'Components/Search/SearchParameter/SearchParameter',
  tags: ['autodocs'],
  component: SearchParameter,
  args: {
    query: 'London'
  }
}

export const Default = {}

export const QueryWithOr = {
  args: {
    query: 'Paulette OR Pierre'
  }
}

export const QueryWithAnd = {
  args: {
    query: 'Paulette AND Pierre'
  }
}

export const QueryWithOpperators = {
  args: {
    query: 'Paulette OR Pierre AND London'
  }
}

export const QueryWithFilter = {
  args: {
    query: 'contentType:"application/pdf"'
  }
}

export const QueryWithError = {
  args: {
    query: 'contentType:application/pdf'
  }
}

export const ContentTypeFilter = {
  args: {
    query: '',
    filter: 'contentType',
    value: 'application/pdf'
  }
}

export const PathFilter = {
  args: {
    query: '',
    filter: 'path',
    value: '/vault/banana-papers'
  }
}

export const FilterWithColor = {
  args: {
    query: '',
    filter: 'namedEntityPerson',
    value: 'Shakira',
    icon: 'music-notes',
    color: '#a50000'
  }
}
