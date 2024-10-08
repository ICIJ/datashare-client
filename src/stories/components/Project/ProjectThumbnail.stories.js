import ProjectThumbnail from '@/components/Project/ProjectThumbnail'

export default {
  title: 'Components/Project/ProjectThumbnail',
  tags: ['autodocs'],
  component: ProjectThumbnail,
  args: {
    width: '100px',
    checked: false,
    noCaption: false,
    project: {
      name: 'banana-papers',
      label: 'Banana Papers'
    }
  }
}

export const Default = {}

export const OnlyName = {
  args: {
    width: '100px',
    checked: false,
    noCaption: false,
    project: 'figcen-files'
  }
}

export const WithAnImage = {
  args: {
    width: '100px',
    checked: false,
    noCaption: false,
    project: {
      name: 'uber-files',
      label: 'Uber Files',
      logoUrl: 'https://media.icij.org/uploads/2022/07/Uber-Files-Backseat-drivers.jpg'
    }
  }
}
