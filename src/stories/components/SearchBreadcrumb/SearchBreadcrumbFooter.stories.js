import SearchBreadcrumbFooter from '@/components/SearchBreadcrumb/SearchBreadcrumbFooter'

export default {
  decorators: [],
  title: 'Components/SearchBreadcrumb/SearchBreadcrumbFooter',
  component: SearchBreadcrumbFooter,
  tags: ['autodocs'],
  argTypes: {
    hideClearFilters: {
      control: {
        type: 'boolean'
      }
    },
    hideClearQueries: {
      control: {
        type: 'boolean'
      }
    },
    hideClearFiltersAndQueries: {
      control: {
        type: 'boolean'
      }
    },
    hideSaveSearch: {
      control: {
        type: 'boolean'
      }
    },
    hideCreateAlert: {
      control: {
        type: 'boolean'
      }
    }
  },
  args: {
    hideClearFilters: false,
    hideClearQueries: false,
    hideClearFiltersAndQueries: false,
    hideSaveSearch: false,
    hideCreateAlert: false
  },
  render: (args) => ({
    components: {
      SearchBreadcrumbFooter
    },
    setup() {
      return { args }
    },
    template: `
      <search-breadcrumb-footer v-bind="args" />
    `
  })
}

export const Default = {}
