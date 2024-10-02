import ProjectJumbotron from '@/components/Project/ProjectJumbotron/ProjectJumbotronPin'

export default {
  title: 'Components/Project/ProjectJumbotron/ProjectJumbotronPin',
  tags: ['autodocs'],
  component: ProjectJumbotron,
  args: {
    pinned: true
  },
  decorators: [
    () => ({
      template: '<div class="p-4 bg-tertiary-subtle"><story /></div>'
    })
  ]
}

export const Default = {}
