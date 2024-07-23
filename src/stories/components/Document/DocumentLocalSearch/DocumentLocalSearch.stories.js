import DocumentLocalSearch from '@/components/Document/DocumentLocalSearch/DocumentLocalSearch'

export default {
  title: 'Components/Document/DocumentLocalSearch/DocumentLocalSearch',
  component: DocumentLocalSearch,
  tags: ['autodocs'],
  args: {
    modelValue: '',
    activeIndex: 0,
    occurrences: 1478
  },
  render: (args) => ({
    components: {
      DocumentLocalSearch,
    },
    setup: () => ({ args }),
    template: `
      <document-local-search
        v-bind="args"
        @update:activeIndex="($event) => args.activeIndex = $event"
      />
    `
  })
}

export const Default = {}
