import SearchBreadcrumbFooter from '@/components/Search/SearchBreadcrumb/SearchBreadcrumbFooter'

export default {
  decorators: [],
  title: 'Components/Search/SearchBreadcrumb/SearchBreadcrumbFooter',
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
  }
}

export const Default = {}
