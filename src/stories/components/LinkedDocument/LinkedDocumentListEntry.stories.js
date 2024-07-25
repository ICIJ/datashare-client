import LinkedDocumentListEntry from '@/components/LinkedDocument/LinkedDocumentListEntry'

export default {
  title: 'Components/LinkedDocument/LinkedDocumentListEntry',
  tags: ['autodocs'],
  component: LinkedDocumentListEntry,
  args: {
    contentType: 'application/pdf',
    name: 'This is my document',
    url: 'toto'
  }
}

export const Default = {}
