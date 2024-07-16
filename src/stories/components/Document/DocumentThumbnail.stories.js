import { markRaw } from 'vue'
import { PhFilePdf } from '@phosphor-icons/vue'

import { withMurmur } from '~storybook/decorators/murmur'
import DocumentThumbnail from '@/components/Document/DocumentThumbnail'

export default {
  title: 'Components/Document/DocumentThumbnail',
  decorators: [withMurmur({ previewHost: null })],
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
    }
  },
  args: {
    size: 'xs',
    crop: true,
    hover: false,
    clickable: true,
    fit: false,
    document: {
      extractionLevel: 0,
      inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
      contentLength: 0,
      contentType: 'image/jpeg',
      isSupportedImage: true,
      contentTypeIcon: markRaw(PhFilePdf)
    }
  },
  render: (args) => ({
    components: {
      DocumentThumbnail
    },
    setup: () => ({ args }),
    template: `
      <div style="background-color: var(--bs-light-bg-subtle);" class="p-3">
        <document-thumbnail v-bind="args" />
      </div>
    `
  })
}

export const Default = {}

export const WithPlaceholder = {
  args: {
    size: 'xs',
    crop: true,
    fit: false,
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
