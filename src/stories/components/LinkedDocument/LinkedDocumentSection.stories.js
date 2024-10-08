import LinkedDocumentSection from '@/components/LinkedDocument/LinkedDocumentSection'

export default {
  title: 'Components/LinkedDocument/LinkedDocumentSection',
  tags: ['autodocs'],
  component: LinkedDocumentSection,
  args: {
    title: 'documents in the same folder',
    icon: 'files',
    description: 'Same extraction level as this document',
    documents: [
      { contentType: 'application/pdf', name: 'This is my document', url: 'toto' },
      { contentType: 'text/html', name: 'This is my document', url: 'toto' },
      { contentType: 'image/png', name: 'This is my document', url: 'toto' },
      { contentType: 'application/msword', name: 'This is my document', url: 'toto' },
      { contentType: 'application/msword', name: 'This is my document', url: 'toto' },
      { contentType: 'application/vnd.ms-excel', name: 'This is my document', url: 'toto' }
    ]
  }
}

export const Default = {}
