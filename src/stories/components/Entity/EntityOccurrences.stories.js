import EntityOccurrences from '@/components/Entity/EntityOccurrences'

export default {
  title: 'Components/Entity/EntityOccurrences',
  tags: ['autodocs'],
  component: EntityOccurrences,
  args: {
    occurrences: parseInt(Math.random() * 1e4)
  }
}

export const Default = {}
