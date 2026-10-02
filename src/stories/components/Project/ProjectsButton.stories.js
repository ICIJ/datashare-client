import ProjectsButton from '@/components/Project/ProjectsButton'

export default {
  title: 'Components/Project/ProjectsButton',
  tags: ['autodocs'],
  component: ProjectsButton,
  args: {
    projects: [
      { name: 'banana-papers', label: 'Banana Papers' },
      { name: 'lux-leaks', label: 'LuxLeaks' }
    ]
  }
}

export const Default = {}

export const SingleProject = {
  args: {
    projects: [{ name: 'banana-papers', label: 'Banana Papers' }]
  }
}

export const ManyProjects = {
  args: {
    projects: [
      'apple-secrets',
      'average-scandal',
      'banana-papers',
      'blue-berries',
      'citrus-confidential',
      'figcen-files',
      'green-files',
      'litchee-secrets',
      'lux-leaks',
      'old-projects',
      'pear-project',
      'strawberry-secrets'
    ]
  }
}
