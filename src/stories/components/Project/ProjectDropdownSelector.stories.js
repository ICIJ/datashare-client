import ProjectDropdownSelector from '@/components/Project/ProjectDropdownSelector'

export default {
  title: 'Components/Project/ProjectDropdownSelector',
  tags: ['autodocs'],
  component: ProjectDropdownSelector,
  args: {
    modelValue: [
      {
        name: 'banana-papers',
        label: 'Banana Papers'
      }
    ],
    projects: [
      {
        name: 'banana-papers',
        label: 'Banana Papers'
      },
      {
        name: 'citrus-confidential',
        label: 'Citrus Confidential'
      },
      {
        name: 'figcen-file',
        label: 'FigCEN Files'
      }
    ]
  }
}

export const Default = {}
