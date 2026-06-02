import LinkedDocumentListEntry from '@/components/LinkedDocument/LinkedDocumentListEntry'

export default {
  title: 'Components/LinkedDocument/LinkedDocumentListEntry',
  tags: ['autodocs'],
  component: LinkedDocumentListEntry,
  args: {
    contentType: 'application/pdf',
    name: 'This is my document',
    id: 'doc-id-1',
    routing: '',
    index: 'local-datashare'
  }
}

export const Default = {}
