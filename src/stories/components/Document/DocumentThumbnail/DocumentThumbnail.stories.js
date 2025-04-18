import { withMurmur } from '~storybook/decorators/murmur'
import DocumentThumbnail from '@/components/Document/DocumentThumbnail/DocumentThumbnail'
import { breakpointSizeArgType } from '~storybook/utils'
import { SIZE } from '@/enums/sizes'

export default {
  title: 'Components/Document/DocumentThumbnail/DocumentThumbnail',
  component: DocumentThumbnail,
  tags: ['autodocs'],
  decorators: [
    withMurmur({ previewHost: null }),
    () => ({
      template: `
        <div class="bg-tertiary-subtle p-5">
          <story class="mx-auto" />
        </div>
      `
    })
  ],
  argTypes: {
    size: breakpointSizeArgType
  },
  args: {
    size: SIZE.SM,
    crop: true,
    hover: false,
    clickable: true,
    hidePlaceholder: false,
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

export const Uncropped = {
  args: {
    size: SIZE.SM,
    crop: false,
    document: {
      extractionLevel: 0,
      inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
      contentLength: 0,
      contentType: 'image/jpeg',
      isSupportedImage: true
    }
  }
}

export const Fit = {
  args: {
    size: SIZE.SM,
    crop: true,
    fit: true,
    document: {
      extractionLevel: 0,
      inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
      contentLength: 0,
      contentType: 'image/jpeg',
      isSupportedImage: true
    }
  }
}

export const FitErrored = {
  args: {
    size: SIZE.SM,
    crop: true,
    fit: true,
    document: {
      extractionLevel: 0,
      inlineFullUrl: 'https://datashare.icij.org/errored.jpeg',
      contentLength: 0,
      contentType: 'image/jpeg',
      isSupportedImage: true
    }
  }
}

export const SizeExtraSmall = {
  args: {
    size: SIZE.XS,
    crop: true,
    document: {
      extractionLevel: 0,
      inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
      contentLength: 0,
      contentType: 'image/jpeg',
      isSupportedImage: true
    }
  }
}

export const SizeMedium = {
  args: {
    size: SIZE.MD,
    crop: true,
    document: {
      extractionLevel: 0,
      inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
      contentLength: 0,
      contentType: 'image/jpeg',
      isSupportedImage: true
    }
  }
}

export const SizeLarge = {
  args: {
    size: SIZE.LG,
    crop: true,
    document: {
      extractionLevel: 0,
      inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
      contentLength: 0,
      contentType: 'image/jpeg',
      isSupportedImage: true
    }
  }
}

export const WithPlaceholderDefault = {
  args: {
    size: SIZE.XS,
    crop: true,
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
    hidePlaceholder: false,
    document: {
      extractionLevel: 0,
      inlineFullUrl: null,
      contentLength: 0,
      contentType: 'application/vnd.ms-outlook'
    }
  }
}
