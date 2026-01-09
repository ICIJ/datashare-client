import { markRaw } from 'vue'
import { vueRouter } from 'storybook-vue3-router'

import { withMurmur } from '~storybook/decorators/murmur'
import { withPinia } from '~storybook/decorators/pinia'
import PageTable from '@/components/PageTable/PageTable'
import DocumentRow from '@/components/Document/DocumentRow/DocumentRow'

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
  title: 'Components/Document/DocumentRow/DocumentRow',
  decorators: [
    withPinia(),
    withMurmur({ previewHost: null }),
    vueRouter(routes),
    () => ({
      components: { PageTable },
      template: `
        <page-table>
          <story />
        </page-table>
      `
    })
  ],
  component: DocumentRow,
  tags: ['autodocs'],
  argTypes: {
    properties: {
      control: 'check',
      options: [
        'thumbnail',
        'title',
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
    selected: false,
    selectMode: false,
    isDownloadAllowed: true,
    to: { name: 'document' },
    properties: ['title', 'contentLength', 'contentType', 'project'],
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
