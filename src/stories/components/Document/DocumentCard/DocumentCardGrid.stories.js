import { markRaw } from 'vue'
import { vueRouter } from 'storybook-vue3-router'

import { withMurmur } from '~storybook/decorators/murmur'
import { withPinia } from '~storybook/decorators/pinia'
import DocumentCardGrid from '@/components/Document/DocumentCard/DocumentCardGrid'

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
  title: 'Components/Document/DocumentCard/DocumentCardGrid',
  decorators: [
    withMurmur({ previewHost: null }),
    withPinia(),
    vueRouter(routes),
    () => ({
      template: '<div style="max-width: 260px"><story /></div>'
    })
  ],
  component: DocumentCardGrid,
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
    properties: ['title', 'thumbnail', 'path', 'creationDate', 'project'],
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
    components: { DocumentCardGrid },
    setup: () => ({ args }),
    template: `<document-card-grid v-bind="args" @update:selected="args.selected = $event" />`
  })
}

export const Default = {}
