import LinkedDocumentList from '@/components/LinkedDocument/LinkedDocumentList'

export default {
  title: 'Components/LinkedDocument/LinkedDocumentList',
  tags: ['autodocs'],
  component: LinkedDocumentList,
  args: {
    documents: [
      { contentType: 'application/pdf', name: 'This is my document', url: 'toto' },
      { contentType: 'text/html', name: 'This is my document', url: 'toto' },
      { contentType: 'image/png', name: 'This is my document', url: 'toto' },
      { contentType: 'application/msword', name: 'This is my document', url: 'toto' },
      { contentType: 'application/msword', name: 'This is my document', url: 'toto' },
      { contentType: 'application/vnd.ms-excel', name: 'This is my document', url: 'toto' }
    ],
    height: '150px'
  }
}

export const Default = {}
