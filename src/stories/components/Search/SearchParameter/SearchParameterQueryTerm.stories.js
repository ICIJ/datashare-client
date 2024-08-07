import SearchParameterQueryTerm from '@/components/Search/SearchParameter/SearchParameterQueryTerm'

export default {
  decorators: [],
  title: 'Components/Search/SearchParameter/SearchParameterQueryTerm',
  component: SearchParameterQueryTerm,
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
