import { markRaw } from 'vue'
import { sample } from 'lodash'

import { withMurmur } from '~storybook/decorators/murmur'
import DocumentCarouselEntry from '@/components/Document/DocumentCarousel/DocumentCarouselEntry'

export default {
  title: 'Components/Document/DocumentCarousel/DocumentCarouselEntry',
  decorators: [withMurmur({ previewHost: null })],
  component: DocumentCarouselEntry,
  tags: ['autodocs'],
  args: {
    active: false,
    document: {
      get title() {
        return sample([
          'Inter IKEA Investment S.à r.l._cover letter 2010-2011 tax returns.pdf',
          'Notif_C3.059249_Inter IKEA Finance SA_01062010.pdf',
          'Business Plan 2016 for investors Grughtel Corporation SA',
          'Inter Ikea Holding S.A._C4.135848_2011_CIT.MBT.NWT Return_EN.pdf'
        ])
      },
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
      isSupportedImage: true,
      contentType: 'image/jpeg',
      contentTypeIcon: markRaw(PhFilePdf)
    }
  }
}

export const Default = {}
