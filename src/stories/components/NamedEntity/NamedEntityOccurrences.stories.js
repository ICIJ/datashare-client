import NamedEntityOccurrences from '@/components/NamedEntity/NamedEntityOccurrences'

export default {
  title: 'Components/NamedEntity/NamedEntityOccurrences',
  tags: ['autodocs'],
  component: NamedEntityOccurrences,
  args: {
    occurrences: parseInt(Math.random() * 1e4)
  }
}

export const Default = {}
