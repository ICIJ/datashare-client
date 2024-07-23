import { markRaw } from 'vue'
import { PhFilePdf } from '@phosphor-icons/vue'
import { vueRouter } from 'storybook-vue3-router'

import { withMurmur } from '~storybook/decorators/murmur'
import DocumentCard from '@/components/Document/DocumentCard/DocumentCard'

const routes = [
  {
    path: '/',
    name: 'document'
  },
  {
    path: '/project/:name',
    name: 'project.view'
  }
]

export default {
  title: 'Components/Document/DocumentCard',
  decorators: [withMurmur({ previewHost: null }), vueRouter(routes)],
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
  }
}

export const Default = {}