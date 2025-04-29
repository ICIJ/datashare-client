import { vueRouter } from 'storybook-vue3-router'

import PageHeaderNav from '@/components/PageHeader/PageHeaderNav'

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
  title: 'Components/PageHeader/PageHeaderNav',
  tags: ['autodocs'],
  decorators: [vueRouter(routes, { initialRoute: '/tasks/batch-searches' })],
  component: PageHeaderNav,
  args: {
    noBreadcrumb: false,
    noToggleSidebar: false,
    noToggleSettings: false
  }
}

export const Default = {}
