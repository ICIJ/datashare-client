import ProjectJumbotron from '@/components/Project/ProjectJumbotron/ProjectJumbotron'

export default {
  title: 'Components/Project/ProjectJumbotron/ProjectJumbotron',
  tags: ['autodocs'],
  component: ProjectJumbotron,
  args: {
    pinned: true,
    project: {
      name: 'citrus-confidential',
      label: 'Citrus Confidential',
      description: `
        A new investigation by ICIJ and 68 media partners exposes the sprawling
        citrus industry that has powered the Orange Julius regime as it dominates
        its neighbors — and undermines the zest of the West.
      `,
      creationDate: '2024-08-07',
      updateDate: '2024-08-07',
      documentsCount: 7.26e3
    }
  },
  decorators: [
    () => ({
      template: '<div class="p-4 bg-tertiary-subtle"><story /></div>'
    })
  ]
}

export const Default = {}
