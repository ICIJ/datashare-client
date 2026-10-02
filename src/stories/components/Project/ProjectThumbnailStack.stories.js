import ProjectThumbnailStack from '@/components/Project/ProjectThumbnailStack'

export default {
  title: 'Components/Project/ProjectThumbnailStack',
  tags: ['autodocs'],
  component: ProjectThumbnailStack,
  args: {
    projects: [
      { name: 'banana-papers', label: 'Banana Papers' },
      { name: 'lux-leaks', label: 'LuxLeaks' },
      { name: 'citrus-confidential', label: 'Citrus Confidential' }
    ]
  }
}

export const Default = {}

export const SingleProject = {
  args: {
    projects: [{ name: 'banana-papers', label: 'Banana Papers' }]
  }
}

export const WithOverflowBadge = {
  args: {
    projects: [
      { name: 'banana-papers', label: 'Banana Papers' },
      { name: 'lux-leaks', label: 'LuxLeaks' },
      { name: 'citrus-confidential', label: 'Citrus Confidential' },
      { name: 'green-files', label: 'Green Files' }
    ],
    max: 3,
    overflow: true
  }
}
