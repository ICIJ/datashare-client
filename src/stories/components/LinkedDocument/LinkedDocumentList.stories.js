import { vueRouter } from 'storybook-vue3-router'

import LinkedDocumentList from '@/components/LinkedDocument/LinkedDocumentList'
const routes = [{ path: '/' }]

export default {
  decorators: [vueRouter(routes)],
  title: 'Components/LinkedDocument/LinkedDocumentList',
  tags: ['autodocs'],
  component: LinkedDocumentList,
  args: {
    documents: [
      { contentType: 'application/pdf', name: 'This is my document', id: '', routing: '', index: '' },
      { contentType: 'text/html', name: 'This is my document', id: '', routing: '', index: '' },
      { contentType: 'image/png', name: 'This is my document', id: '', routing: '', index: '' },
      { contentType: 'application/msword', name: 'This is my document', id: '', routing: '', index: '' },
      { contentType: 'application/msword', name: 'This is my document', id: '', routing: '', index: '' },
      { contentType: 'application/vnd.ms-excel', name: 'This is my document', id: '', routing: '', index: '' }
    ],
    height: '150px'
  }
}

export const Default = {}
