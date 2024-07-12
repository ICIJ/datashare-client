import SearchBreadcrumb from '@/components/SearchBreadcrumb/SearchBreadcrumb'
import SearchBreadcrumbEntry from '@/components/SearchBreadcrumb/SearchBreadcrumbEntry'

export default {
  decorators: [],
  title: 'Components/SearchBreadcrumb',
  tags: ['autodocs'],
  render: () => ({
    components: {
      SearchBreadcrumb,
      SearchBreadcrumbEntry
    },
    template: `
      <search-breadcrumb>
        <search-breadcrumb-entry query="London AND Biden AND -JO" :occurrences="987" />
        <search-breadcrumb-entry filter="creationDate" value="16 Nov 2014 - 22 Jan 2016" :occurrences="675" />
        <search-breadcrumb-entry filter="contentType" value="application/pdf" :occurrences="455" />
        <search-breadcrumb-entry filter="namedEntityPerson" value="Anja Doller" :occurrences="342" />
        <search-breadcrumb-entry filter="namedEntityOrganization" value="Gotleg SAS" :occurrences="78" />
        <search-breadcrumb-entry filter="namedEntityLocation" value="Paris" :occurrences="139" />
        <search-breadcrumb-entry filter="path" value="/vault/luxleaks/importantfolder/" :occurrences="32" />
      </search-breadcrumb>
    `
  })
}

export const Default = {}

export const Empty = {
  render: () => ({
    components: {
      SearchBreadcrumb
    },
    template: `
      <search-breadcrumb />
    `
  })
}
