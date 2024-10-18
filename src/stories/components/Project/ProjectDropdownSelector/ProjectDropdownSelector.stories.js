import ProjectDropdownSelector from '@/components/Project/ProjectDropdownSelector/ProjectDropdownSelector'

export default {
  title: 'Components/Project/ProjectDropdownSelector/ProjectDropdownSelector',
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
      },
      {
        name: 'lychee-secrets',
        label: 'Lychee Secrets'
      }
    ]
  }
}

export const Default = {}
export const SingleSelection = {
  args: {
    modelValue: {
      name: 'banana-papers',
      label: 'Banana Papers'
    }
  }
}
