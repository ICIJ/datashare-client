import { vueRouter } from 'storybook-vue3-router'

import PageHeaderToolbar from '@/components/PageHeader/PageHeaderToolbar'

const routes = [
  {
    path: '/',
    children: [
      {
        path: '/tasks',
        name: 'tasks',
        meta: {
          icon: markRaw(IPhRocketLaunch)
        },
        children: [
          {
            path: '/tasks/batch-searches',
            name: 'tasks.batch-searches',
            meta: {
              icon: markRaw(IPhListMagnifyingGlass)
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
  title: 'Components/PageHeader/PageHeaderToolbar',
  tags: ['autodocs'],
  decorators: [vueRouter(routes, { initialRoute: '/tasks/batch-searches' })],
  component: PageHeaderToolbar,
  args: {
    searchable: true,
    filterable: true,
    paginable: true,
    totalRows: 100,
    page: 1
  }
}

export const Default = {}
