import LinkedDocumentCard from '@/components/LinkedDocument/LinkedDocumentCard'
import LinkedDocumentSection from '@/components/LinkedDocument/LinkedDocumentSection'

const documents = [
  { contentType: 'application/pdf', name: 'This is my document', id: 'doc-id-1', routing: '', index: 'local-datashare' },
  { contentType: 'text/html', name: 'This is my document', id: 'doc-id-2', routing: '', index: 'local-datashare' },
  { contentType: 'image/png', name: 'This is my document', id: 'doc-id-3', routing: '', index: 'local-datashare' },
  { contentType: 'application/msword', name: 'This is my document', id: 'doc-id-4', routing: '', index: 'local-datashare' },
  { contentType: 'application/vnd.ms-excel', name: 'This is my document', id: 'doc-id-5', routing: '', index: 'local-datashare' }
]

export default {
  title: 'Components/LinkedDocument/LinkedDocumentCard',
  tags: ['autodocs'],
  component: LinkedDocumentCard,
  args: {
    modelValue: true
  },
  // `LinkedDocumentCard` is a layout wrapper that renders its content through
  // the `#siblings` and `#children` slots (filled with `LinkedDocumentSection`),
  // so the story composes those slots rather than passing data as props.
  render: args => ({
    components: { LinkedDocumentCard, LinkedDocumentSection },
    setup: () => ({ args, documents, IPhFiles: markRaw(IPhFiles), IPhPaperclip: markRaw(IPhPaperclip) }),
    template: `
      <linked-document-card v-bind="args">
        <template #siblings="{ modelValue, onUpdateModelValue }">
          <linked-document-section
            :model-value="modelValue"
            header-class="rounded-start"
            :icon="IPhFiles"
            title="Documents in the same folder"
            description="Same extraction level as this document"
            :documents="documents"
            @update:model-value="onUpdateModelValue"
          />
        </template>
        <template #children="{ modelValue, onUpdateModelValue }">
          <linked-document-section
            :model-value="modelValue"
            header-class="rounded-end"
            :icon="IPhPaperclip"
            title="Attached documents"
            description="Documents extracted from this document"
            :documents="documents"
            @update:model-value="onUpdateModelValue"
          />
        </template>
      </linked-document-card>
    `
  })
}

export const Default = {}
