import DocumentLocalSearch from '@/components/Document/DocumentLocalSearch/DocumentLocalSearch'

export default {
  title: 'Components/Document/DocumentLocalSearch/DocumentLocalSearchOccurences',
  component: DocumentLocalSearch,
  tags: ['autodocs'],
  args: {
    modelValue: '',
    activeIndex: 0
  },
  render: args => ({
    components: {
      DocumentLocalSearch
    },
    setup: () => ({ args }),
    template: `
      <document-local-search
        v-bind="args"
        :occurrences="occurrences"
        @update:activeIndex="($event) => args.activeIndex = $event"
      />
    `,
    computed: {
      occurrences() {
        return Math.max(0, 16e4 - String(this.args.modelValue).length * 1e4)
      }
    }
  })
}

export const Default = {}
