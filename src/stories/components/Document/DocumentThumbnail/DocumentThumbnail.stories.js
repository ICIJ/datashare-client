import { markRaw } from 'vue'
import { PhFilePdf, PhTextAlignLeft, PhImage } from '@phosphor-icons/vue'

import { withMurmur } from '~storybook/decorators/murmur'
import DocumentThumbnail from '@/components/Document/DocumentThumbnail/DocumentThumbnail'
import { breakpointSizeArgType } from '~storybook/utils'
import { SIZE } from '@/enums/sizes'

export default {
  title: 'Components/Document/DocumentThumbnail/DocumentThumbnail',
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
      contentTypeIcon: [markRaw(PhFilePdf), 'fill']
    }
  }
}

export const Default = {}

export const WithPlaceholderPDF = {
  args: {
    size: SIZE.XS,
    crop: true,
    fit: false,
    hidePlaceholder: false,
    document: {
      extractionLevel: 0,
      inlineFullUrl: null,
      contentLength: 0,
      contentType: 'application/pdf',
      isSupportedImage: true,
      contentTypeIcon: [markRaw(PhFilePdf), 'fill']
    }
  }
}

export const WithPlaceholderText = {
  args: {
    size: SIZE.XS,
    crop: true,
    fit: false,
    hidePlaceholder: false,
    document: {
      extractionLevel: 0,
      inlineFullUrl: null,
      contentLength: 0,
      contentType: 'text/plain',
      isSupportedImage: true,
      contentTypeIcon: markRaw(PhTextAlignLeft)
    }
  }
}

export const WithPlaceholderImage = {
  args: {
    size: SIZE.XS,
    crop: true,
    fit: false,
    hidePlaceholder: false,
    document: {
      extractionLevel: 0,
      inlineFullUrl: null,
      contentLength: 0,
      contentType: 'video/mp4',
      isSupportedImage: true,
      contentTypeIcon: [markRaw(PhImage), 'fill']
    }
  }
}
