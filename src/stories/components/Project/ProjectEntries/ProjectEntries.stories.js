import { vueRouter } from 'storybook-vue3-router'

import { layoutArgType } from '~storybook/utils'
import ProjectEntries from '@/components/Project/ProjectEntries/ProjectEntries'

const routes = [
  {
    path: '/project/:name',
    name: 'project.view.insights'
  },
  {
    path: '/project/:name/edit',
    name: 'project.view.edit'
  },
  {
    path: '/project/:name/delete',
    name: 'project.view.delete'
  },
  {
    path: '/search',
    name: 'search'
  }
]

export default {
  title: 'Components/Project/ProjectEntries/ProjectEntries',
  decorators: [vueRouter(routes)],
  component: ProjectEntries,
  argTypes: {
    projects: {
      type: Array
    },
    layout: layoutArgType
  },
  args: {
    projects: [
      {
        name: 'banana-papers',
        label: 'Banana Papers',
        logoUrl: 'https://media.icij.org/uploads/2018/04/Banana-Getty-PanamaPapers.jpg',
        description: 'A shoking exposé about bananas involved in a world-wide tax evasion scheme.',
        updateDate: '2024-08-07',
        documentsCount: 8.2e6
      },
      {
        name: 'citrus-confidential',
        label: 'Citrus Confidential',
        description: `
          A new investigation by ICIJ and 68 media partners exposes the sprawling
          citrus industry that has powered the Orange Julius regime as it dominates
          its neighbors — and undermines the zest of the West.
        `,
        updateDate: '2024-08-07',
        documentsCount: 7.26e3
      }
    ]
  }
}

export const Default = {}
