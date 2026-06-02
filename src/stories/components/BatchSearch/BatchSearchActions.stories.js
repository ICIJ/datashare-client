import BatchSearchActions from '@/components/BatchSearch/BatchSearchActions/BatchSearchActions'

export default {
  title: 'Components/BatchSearch/BatchSearchActions',
  component: BatchSearchActions,
  tags: ['autodocs'],
  args: {
    batchSearch: {
      uuid: 'batch-uuid-1',
      name: 'Richest people in the EU',
      state: 'SUCCESS',
      projects: ['banana-papers'],
      date: new Date(),
      user: { id: 'jsmith' },
      nbResults: 7,
      nbQueries: 6,
      published: true,
      description: ''
    }
  }
}
export const Default = {}
