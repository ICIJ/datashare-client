import { markRaw } from 'vue'

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
      isSupportedImage: true
    }
  }
}

export const Default = {}

export const WithPlaceholderDefault = {
  args: {
    size: SIZE.XS,
    crop: true,
    fit: false,
    hidePlaceholder: false,
    document: {
      extractionLevel: 0,
      inlineFullUrl: null,
      contentLength: 0,
      contentType: 'application/unknown'
    }
  }
}

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
      contentType: 'application/pdf'
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
      contentType: 'text/plain'
    }
  }
}

export const WithPlaceholderVideo = {
  args: {
    size: SIZE.XS,
    crop: true,
    fit: false,
    hidePlaceholder: false,
    document: {
      extractionLevel: 0,
      inlineFullUrl: null,
      contentLength: 0,
      contentType: 'application/mp4'
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
      contentType: 'image/jpeg'
    }
  }
}

export const WithPlaceholderEmail = {
  args: {
    size: SIZE.XS,
    crop: true,
    fit: false,
    hidePlaceholder: false,
    document: {
      extractionLevel: 0,
      inlineFullUrl: null,
      contentLength: 0,
      contentType: 'application/vnd.ms-outlook'
    }
  }
}
