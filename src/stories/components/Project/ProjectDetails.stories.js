import ProjectDetails from '@/components/Project/ProjectDetails'

export default {
  title: 'Components/Project/ProjectDetails',
  tags: ['autodocs'],
  component: ProjectDetails,
  args: {
    project: {
      name: 'citrus-confidential',
      label: 'Citrus Confidential',
      sourcePath: '/vault/citrus-confidential',
      sourceUrl: 'https://offshoreleaks.icij.org',
      creationDate: '2024-08-07',
      updateDate: '2024-08-07'
    }
  },
  decorators: [
    () => ({
      template: '<div class="p-4"><story /></div>'
    })
  ]
}

export const Default = {}
