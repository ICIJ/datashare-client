import { markRaw } from 'vue'
import { PhFilePdf } from '@phosphor-icons/vue'

import { withMurmur } from '~storybook/decorators/murmur'
import DocumentThumbnail from '@/components/Document/DocumentThumbnail'
import { breakpointSizeArgType } from '~storybook/utils'
import { SIZE } from '@/enums/sizes'

export default {
  title: 'Components/Document/DocumentThumbnail',
  decorators: [withMurmur({ previewHost: null })],
  component: DocumentThumbnail,
  tags: ['autodocs'],
  argTypes: {
    size: breakpointSizeArgType
  },
  args: {
    size: SIZE.XS,
    crop: true,
    hover: false,
    clickable: true,
    hidePlaceholder: false,
    fit: false,
    document: {
      extractionLevel: 0,
      inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
      contentLength: 0,
      contentType: 'image/jpeg',
      isSupportedImage: true,
      contentTypeIcon: markRaw(PhFilePdf)
    }
  }
}

export const Default = {}

export const WithPlaceholder = {
  args: {
    size: SIZE.XS,
    crop: true,
    fit: false,
    hidePlaceholder: false,
    document: {
      extractionLevel: 0,
      inlineFullUrl: null,
      contentLength: 0,
      contentType: 'image/jpeg',
      isSupportedImage: true,
      contentTypeIcon: markRaw(PhFilePdf)
    }
  }
}
