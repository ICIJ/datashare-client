import PathTreeViewEntryStats from '@/components/PathTree/PathTreeView/PathTreeViewEntryStats'

export default {
  title: 'Components/PathTree/PathTreeView/PathTreeViewEntryStats',
  tags: ['autodocs'],
  component: PathTreeViewEntryStats,
  args: {
    documents: ~~(2e2 * Math.random()),
    directories: ~~(2e2 * Math.random()),
    size: ~~(2e3 * Math.random())
  }
}

export const Default = {}
