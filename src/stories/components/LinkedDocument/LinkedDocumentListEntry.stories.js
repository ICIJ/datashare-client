import { vueRouter } from 'storybook-vue3-router'

import LinkedDocumentListEntry from '@/components/LinkedDocument/LinkedDocumentListEntry'

const routes = [{ path: '/' }]
export default {
  decorators: [vueRouter(routes)],
  title: 'Components/LinkedDocument/LinkedDocumentListEntry',
  tags: ['autodocs'],
  component: LinkedDocumentListEntry,
  args: {
    contentType: 'application/pdf',
    name: 'This is my document',
    id: '',
    routing: '',
    index: ''
  }
}

export const Default = {}
