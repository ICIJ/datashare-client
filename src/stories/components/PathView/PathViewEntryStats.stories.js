import PathViewEntryStats from '@/components/PathView/PathViewEntryStats'

export default {
  title: 'Components/PathView/PathViewEntryStats',
  tags: ['autodocs'],
  component: PathViewEntryStats,
  args: {
    documents: ~~(2e2 * Math.random()),
    directories: ~~(2e2 * Math.random()),
    size: ~~(2e3 * Math.random())
  }
}

export const Default = {}
