import LinkedDocumentList from '@/components/LinkedDocument/LinkedDocumentList'

export default {
  title: 'Components/LinkedDocument/LinkedDocumentList',
  tags: ['autodocs'],
  component: LinkedDocumentList,
  args: {
    documents: [
      { contentType: 'application/pdf', name: 'This is my document', id: 'doc-id-1', routing: '', index: 'local-datashare' },
      { contentType: 'text/html', name: 'This is my document', id: 'doc-id-2', routing: '', index: 'local-datashare' },
      { contentType: 'image/png', name: 'This is my document', id: 'doc-id-3', routing: '', index: 'local-datashare' },
      { contentType: 'application/msword', name: 'This is my document', id: 'doc-id-4', routing: '', index: 'local-datashare' },
      { contentType: 'application/msword', name: 'This is my document', id: 'doc-id-5', routing: '', index: 'local-datashare' },
      { contentType: 'application/vnd.ms-excel', name: 'This is my document', id: 'doc-id-6', routing: '', index: 'local-datashare' }
    ],
    height: '150px'
  }
}

export const Default = {}
