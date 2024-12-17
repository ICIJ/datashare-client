import DocumentTranslationAlert from '@/components/Document/DocumentTranslation/DocumentTranslationAlert/DocumentTranslationAlert'

export default {
  title: 'Components/Document/DocumentTranslation/DocumentTranslationAlert/DocumentTranslationAlert',
  component: DocumentTranslationAlert,
  tags: ['autodocs'],
  args: {
    active: true,
    detectedLanguage: 'FRENCH',
    sourceLanguage: 'FRENCH',
    targetLanguage: 'ENGLISH'
  },
  render: (args) => ({
    setup: () => ({ args }),
    components: {
      DocumentTranslationAlert
    },
    template: '<document-translation-alert v-bind="args" @update:active="args.active = $event" />'
  })
}

export const Default = {}
