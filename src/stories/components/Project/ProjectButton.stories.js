import { vueRouter } from 'storybook-vue3-router'

import ProjectButton from '@/components/Project/ProjectButton'

const routes = [
  {
    path: '/project/:name',
    name: 'project.view'
  }
]

export default {
  title: 'Components/Project/ProjectButton',
  decorators: [vueRouter(routes)],
  tags: ['autodocs'],
  component: ProjectButton,
  args: {
    project: {
      name: 'banana-papers',
      label: 'Banana Papers'
    }
  }
}

export const Default = {}
