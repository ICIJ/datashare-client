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
      title: 'Inter IKEA Investment S.à r.l._cover letter 2010-2011 tax returns.pdf',
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
      }
    },
    template: `
      <div class="p-sm-5 p-3 text-center">
        <button type="button" class="btn btn-outline-secondary" :id="trigger">
          Hover me
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
      title: 'Inter IKEA Investment S.à r.l._cover letter 2010-2011 tax returns.txt',
      contentType: 'text/html',
      standardExtension: 'html',
      hasStandardExtension: false,
      contentTypeDescription: types['text/html'].description,
      contentTypeWarning: types['text/html'].warning,
      contentTypeIcon: markRaw(PhFile)
    }
  }
}
