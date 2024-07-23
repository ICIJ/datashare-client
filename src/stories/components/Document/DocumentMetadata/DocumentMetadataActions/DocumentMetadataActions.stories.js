import DocumentMetadataActions from '@/components/Document/DocumentMetadata/DocumentMetadataActions/DocumentMetadataActions'

export default {
  title: 'Components/Document/DocumentMetadata/DocumentMetadataActions/DocumentMetadataActions',
  component: DocumentMetadataActions,
  tags: ['autodocs'],
  args: {
    pinned: false
  },
  render: (args) => ({
    components: {
      DocumentMetadataActions
    },
    setup: () => ({ args }),
    template: `
      <document-metadata-actions v-bind="args" @update:pinned="args.pinned = $event" />
    `
  })
}

export const Default = {}
