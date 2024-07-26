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
      { contentType: 'application/pdf', name: 'This is my document', url: '/' },
      { contentType: 'text/html', name: 'This is my document', url: '/' },
      { contentType: 'image/png', name: 'This is my document', url: '/' },
      { contentType: 'application/msword', name: 'This is my document', url: '/' },
      { contentType: 'application/msword', name: 'This is my document', url: '/' },
      { contentType: 'application/vnd.ms-excel', name: 'This is my document', url: '/' }
    ],
    height: '150px'
  }
}

export const Default = {}
