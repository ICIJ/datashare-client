import LinkedDocumentSection from '@/components/LinkedDocument/LinkedDocumentSection'

export default {
  title: 'Components/LinkedDocument/LinkedDocumentSection',
  tags: ['autodocs'],
  component: LinkedDocumentSection,
  args: {
    title: 'documents in the same folder',
    icon: markRaw(IPhFiles),
    description: 'Same extraction level as this document',
    documents: [
      { contentType: 'application/pdf', name: 'This is my document', id: 'doc-id-1', routing: '', index: 'local-datashare' },
      { contentType: 'text/html', name: 'This is my document', id: 'doc-id-2', routing: '', index: 'local-datashare' },
      { contentType: 'image/png', name: 'This is my document', id: 'doc-id-3', routing: '', index: 'local-datashare' },
      { contentType: 'application/msword', name: 'This is my document', id: 'doc-id-4', routing: '', index: 'local-datashare' },
      { contentType: 'application/msword', name: 'This is my document', id: 'doc-id-5', routing: '', index: 'local-datashare' },
      { contentType: 'application/vnd.ms-excel', name: 'This is my document', id: 'doc-id-6', routing: '', index: 'local-datashare' }
    ]
  }
}

export const Default = {}
