import { markRaw } from 'vue'
import { PhFile, PhFilePdf } from '@phosphor-icons/vue'

import DocumentDownloadPopover from '@/components/Document/DocumentDownloadPopover/DocumentDownloadPopover'
import types from '@/utils/types.json'

export default {
  component: DocumentDownloadPopover,
  title: 'Components/Document/DocumentDownloadPopover/DocumentDownloadPopover',
  tags: ['autodocs'],
  args: {
    document: {
      id: 'foo',
      title: 'tax_returns.pdf',
      standardExtension: 'pdf',
      hasStandardExtension: true,
      contentType: 'application/pdf',
      contentTypeDescription: types['application/pdf'].description,
      contentTypeIcon: markRaw(PhFilePdf)
    }
  },
  render: (args) => ({
    components: {
      DocumentDownloadPopover
    },
    setup: () => ({ args }),
    computed: {
      trigger() {
        return `btn-${this.$.uid}`
      },
      title() {
        return args.document.title
      }
    },
    template: `
      <div class="p-sm-5 p-3 text-center">
        <button type="button" class="btn btn-outline-primary" :id="trigger">
          Download <var class="text-decoration-underline">{{ title }}</var>
        </button>
        <document-download-popover v-bind="args" :target="trigger" />
      </div>
    `
  })
}

export const Default = {}

export const WithWarning = {
  args: {
    document: {
      id: 'bar',
      title: 'webpage.txt',
      contentType: 'text/html',
      standardExtension: 'html',
      hasStandardExtension: false,
      contentTypeDescription: types['text/html'].description,
      contentTypeWarning: types['text/html'].warning,
      contentTypeIcon: markRaw(PhFile)
    }
  }
}

export const WithRoot = {
  args: {
    document: {
      id: 'bar',
      title: 'attachment.pdf',
      contentType: 'application/pdf',
      standardExtension: 'pdf',
      hasStandardExtension: true,
      contentTypeDescription: types['application/pdf'].description,
      contentTypeWarning: types['application/pdf'].warning,
      contentTypeIcon: markRaw(PhFilePdf),
      root: {
        id: 'fiz',
        title: 'email-with-subject.eml',
        contentLength: 1e2
      }
    }
  }
}

export const WithHugeRoot = {
  args: {
    document: {
      id: 'bar',
      title: 'photo.jpg',
      contentType: 'image/jpeg',
      standardExtension: 'jpg',
      hasStandardExtension: true,
      contentTypeDescription: types['image/jpeg'].description,
      contentTypeWarning: types['image/jpeg'].warning,
      contentTypeIcon: markRaw(PhFile),
      root: {
        id: 'fiz',
        title: 'inbox.pst',
        contentLength: 1e24
      }
    }
  }
}

export const WithEverything = {
  args: {
    document: {
      id: 'bar',
      title: 'installer.jpg',
      contentType: 'application/x-msdownload',
      standardExtension: 'exe',
      hasStandardExtension: false,
      contentTypeDescription: types['application/x-msdownload'].description,
      contentTypeWarning: types['application/x-msdownload'].warning,
      contentTypeIcon: markRaw(PhFile),
      root: {
        id: 'fiz',
        title: 'email-with-subject.eml',
        contentLength: 1e24
      }
    }
  }
}
