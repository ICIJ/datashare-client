import SearchResultsActions from '@/components/Search/SearchResults/SearchResultsActions/SearchResultsActions'

export default {
  decorators: [],
  title: 'Components/Search/SearchResults/SearchResultsActions',
  tags: ['autodocs'],
  component: SearchResultsActions,
  args: {
    selected: false,
    indeterminate: false,
    count: 100
  },
  render: (args) => ({
    components: {
      SearchResultsActions
    },
    setup: () => ({ args }),
    template: `
      <search-results-actions
        v-bind="args"
        @update:selected="args.selected = $event"
        @update:indeterminate="args.indeterminate = $event"
      />
    `
  })
}

export const Default = {}
