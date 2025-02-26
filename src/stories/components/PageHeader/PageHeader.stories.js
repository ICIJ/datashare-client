import { vueRouter } from 'storybook-vue3-router'

import PageHeader from '@/components/PageHeader/PageHeader'

const routes = [
  {
    path: '/',
    children: [
      {
        path: '/tasks',
        name: 'tasks',
        meta: {
          icon: 'rocket-launch'
        },
        children: [
          {
            path: '/tasks/batch-searches',
            name: 'tasks.batch-searches',
            meta: {
              icon: 'list-magnifying-glass'
            },
            children: [
              {
                path: '/tasks/batch-searches/view',
                name: 'tasks.batch-searches.view',
                meta: {
                  icon: null
                }
              }
            ]
          }
        ]
      }
    ]
  }
]

export default {
  title: 'Components/PageHeader/PageHeader',
  tags: ['autodocs'],
  decorators: [vueRouter(routes, { initialRoute: '/tasks/batch-searches' })],
  component: PageHeader,
  args: {
    noBreadcrumb: false,
    noToggleSidebar: false,
    noToggleSettings: false
  }
}

export const Default = {}
