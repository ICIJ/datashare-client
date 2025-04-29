import { vueRouter } from 'storybook-vue3-router'

import LinkedDocumentCard from '@/components/LinkedDocument/LinkedDocumentCard'
const routes = [{ path: '/' }]
export default {
  decorators: [vueRouter(routes)],
  title: 'Components/LinkedDocument/LinkedDocumentCard',
  tags: ['autodocs'],
  component: LinkedDocumentCard,
  args: {
    title: 'documents in the same folder',
    icon: 'files',
    description: 'Same extraction level as this document',
    modelValue: true,
    siblings: [
      { contentType: 'application/pdf', name: 'This is my document', url: '/' },
      { contentType: 'text/html', name: 'This is my document', url: '/' },
      { contentType: 'image/png', name: 'This is my document', url: '/' },
      { contentType: 'application/msword', name: 'This is my document', url: '/' },
      { contentType: 'application/msword', name: 'This is my document', url: '/' },
      { contentType: 'application/vnd.ms-excel', name: 'This is my document', url: '/' }
    ],
    children: [
      { contentType: 'application/pdf', name: 'This is my document', url: '/' },
      { contentType: 'text/html', name: 'This is my document', url: '/' },
      { contentType: 'image/png', name: 'This is my document', url: '/' },
      { contentType: 'application/msword', name: 'This is my document', url: '/' },
      { contentType: 'application/msword', name: 'This is my document', url: '/' },
      { contentType: 'application/vnd.ms-excel', name: 'This is my document', url: '/' }
    ]
  }
}

export const Default = {}
