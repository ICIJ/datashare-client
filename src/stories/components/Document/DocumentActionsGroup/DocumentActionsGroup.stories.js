import { markRaw } from 'vue'
import { PhFilePdf } from '@phosphor-icons/vue'

import types from '@/utils/types.json'
import DocumentActionsGroup from '@/components/Document/DocumentActionsGroup/DocumentActionsGroup'
import { PLACEMENT } from '@/enums/placements'

export default {
  components: { DocumentActionsGroup },
  title: 'Components/Document/DocumentActionsGroup',
  component: DocumentActionsGroup,
  tags: ['autodocs'],
  args: {
    document: {
      id: '5f5b3b3b-7b3b-4b3b-8b3b-3b3b3b3b3b3b',
      title: 'Inter IKEA Investment S.à r.l._cover letter 2010-2011 tax returns.pdf',
      extractionLevel: 0,
      project: 'banana-papers',
      creationDate: new Date(),
      inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
      path: '/vault/ns9ThQx.jpeg',
      tags: ['foo', 'bar', 'baz'],
      language: 'ENGLISH',
      contentLength: 23e4,
      contentTextLength: 14e3,
      isSupportedImage: true,
      highlights: [
        'Lorem ispum dolor sit <mark>IKEA</mark> amet.',
        'Consectetur <mark>IKEA</mark> adipiscing elit.',
        'Sed do eiusmod tempor incididunt ut labore et <mark>IKEA</mark> dolore magna aliqua.'
      ],
      contentType: 'application/pdf',
      contentTypeDescription: types['application/pdf'].description,
      contentTypeIcon: markRaw(PhFilePdf)
    },
    vertical: false,
    tooltipPlacement: PLACEMENT.BOTTOM,
    selectMode: true,
    selected: false
  }
}

export const Default = {}
