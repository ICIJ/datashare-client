import SearchBreadcrumbForm from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbForm'
import SearchBreadcrumbFormEntry from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormEntry'

export default {
  decorators: [],
  title: 'Components/Search/SearchBreadcrumbForm',
  tags: ['autodocs'],
  component: SearchBreadcrumbForm,
  render: () => ({
    components: {
      SearchBreadcrumbForm,
      SearchBreadcrumbFormEntry
    },
    template: `
      <search-breadcrumb-form visible>
        <search-breadcrumb-form-entry query="London AND Biden AND -JO" :occurrences="987" />
        <search-breadcrumb-form-entry filter="creationDate" value="16 Nov 2014 - 22 Jan 2016" :occurrences="675" />
        <search-breadcrumb-form-entry filter="contentType" value="application/pdf" :occurrences="455" />
        <search-breadcrumb-form-entry filter="namedEntityPerson" value="Anja Doller" :occurrences="342" />
        <search-breadcrumb-form-entry filter="namedEntityOrganization" value="Gotleg SAS" :occurrences="78" />
        <search-breadcrumb-form-entry filter="namedEntityLocation" value="Paris" :occurrences="139" />
        <search-breadcrumb-form-entry filter="path" value="/vault/luxleaks/importantfolder/" :occurrences="32" />
      </search-breadcrumb-form>
    `
  })
}

export const Default = {}

export const Empty = {
  render: () => ({
    components: {
      SearchBreadcrumbForm
    },
    template: `
      <search-breadcrumb-form />
    `
  })
}
