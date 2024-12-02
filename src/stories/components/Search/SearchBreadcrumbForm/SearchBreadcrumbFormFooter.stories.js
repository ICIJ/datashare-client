import SearchBreadcrumbFormFooter from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormFooter'

export default {
  decorators: [],
  title: 'Components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormFooter',
  component: SearchBreadcrumbFormFooter,
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
