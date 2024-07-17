import { vueRouter } from 'storybook-vue3-router'

import ProjectLink from '@/components/Project/ProjectLink'

const routes = [
  {
    path: '/project/:name',
    name: 'project.view'
  }
]

export default {
  title: 'Components/Project/ProjectLink',
  decorators: [vueRouter(routes)],
  tags: ['autodocs'],
  component: ProjectLink,
  args: {
    project: {
      name: 'banana-papers',
      label: 'Banana Papers'
    }
  }
}

export const Default = {}
