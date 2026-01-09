import { markRaw } from 'vue'
import { sample } from 'lodash'

import { withMurmur } from '~storybook/decorators/murmur'
import DocumentCarousel from '@/components/Document/DocumentCarousel/DocumentCarousel'
import DocumentCarouselEntry from '@/components/Document/DocumentCarousel/DocumentCarouselEntry'

export default {
  title: 'Components/Document/DocumentCarousel/DocumentCarousel',
  decorators: [withMurmur({ previewHost: null })],
  component: DocumentCarousel,
  tags: ['autodocs'],
  args: {
    page: 1,
    perPage: 10,
    totalRows: ~~(Math.random() * 2e4),
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
  },
  render(args) {
    return {
      components: { DocumentCarousel, DocumentCarouselEntry },
      setup() {
        return { args }
      },
      template: `
        <div style="height: 400px">
          <document-carousel v-bind="args">
            <document-carousel-entry :document="args.document" />
            <document-carousel-entry :document="args.document" />
            <document-carousel-entry :document="args.document" active />
            <document-carousel-entry :document="args.document" />
            <document-carousel-entry :document="args.document" />
          </document-carousel>
        </div>
      `
    }
  }
}

export const Default = {}
