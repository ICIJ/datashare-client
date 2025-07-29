import { markRaw } from 'vue'
import { PhFilePdf } from '@phosphor-icons/vue'
import { vueRouter } from 'storybook-vue3-router'

import { withMurmur } from '~storybook/decorators/murmur'
import { withPinia } from '~storybook/decorators/pinia'
import DocumentCard from '@/components/Document/DocumentCard/DocumentCard'

const routes = [
  {
    path: '/',
    name: 'document'
  },
  {
    path: '/ds',
    name: 'document-standalone'
  },
  {
    path: '/project/:name',
    name: 'project.view'
  }
]

export default {
  title: 'Components/Document/DocumentCard/DocumentCard',
  decorators: [withMurmur({ previewHost: null }), vueRouter(routes), withPinia()],
  component: DocumentCard,
  tags: ['autodocs'],
  argTypes: {
    properties: {
      control: 'check',
      options: [
        'title',
        'thumbnail',
        'path',
        'author',
        'highlights',
        'creationDate',
        'contentLength',
        'contentTextLength',
        'contentType',
        'language',
        'extractionLevel',
        'tags',
        'project'
      ]
    }
  },
  args: {
    active: false,
    selected: false,
    selectMode: false,
    isDownloadAllowed: true,
    to: { name: 'document' },
    properties: [
      'title',
      'thumbnail',
      'path',
      'author',
      'highlights',
      'creationDate',
      'contentLength',
      'contentTextLength',
      'contentType',
      'language',
      'extractionLevel',
      'tags',
      'project'
    ],
    document: {
      title: 'Inter IKEA Investment S.à r.l._cover letter 2010-2011 tax returns.pdf',
      extractionLevel: 0,
      author: 'Pierre Romera Zhang <hello@pirhoo.com>',
      project: 'banana-papers',
      creationDate: new Date(),
      inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
      path: '/vault/ns9ThQx.jpeg',
      tags: ['foo', 'bar', 'baz'],
      language: 'ENGLISH',
      contentLength: 23e4,
      contentTextLength: 14e3,
      contentType: 'image/jpeg',
      isSupportedImage: true,
      highlights: [
        'Lorem ispum dolor sit <mark>IKEA</mark> amet.',
        'Consectetur <mark>IKEA</mark> adipiscing elit.',
        'Sed do eiusmod tempor incididunt ut labore et <mark>IKEA</mark> dolore magna aliqua.'
      ],
      contentTypeIcon: markRaw(PhFilePdf)
    }
  },
  render: args => ({
    components: { DocumentCard },
    setup: () => ({ args }),
    template: `<document-card v-bind="args" @update:selected="args.selected = $event" />`
  })
}

export const Default = {}
