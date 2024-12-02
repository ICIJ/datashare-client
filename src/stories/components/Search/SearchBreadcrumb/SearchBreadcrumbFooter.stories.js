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
    hideClearQuery: {
      control: {
        type: 'boolean'
      }
    },
    hideClearFiltersAndQuery: {
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
    hideClearQuery: false,
    hideClearFiltersAndQuery: false,
    hideSaveSearch: false,
    hideCreateAlert: false
  }
}

export const Default = {}
