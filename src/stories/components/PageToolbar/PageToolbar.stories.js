import { vueRouter } from 'storybook-vue3-router'

import PageToolbar from '@/components/PageToolbar/PageToolbar'

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
  title: 'Components/PageHeader/PageToolbar',
  tags: ['autodocs'],
  decorators: [vueRouter(routes, { initialRoute: '/tasks/batch-searches' })],
  component: PageToolbar,
  args: {
    searchable: true,
    filterable: true,
    paginable: true,
    totalRows: 100,
    pageRow: false,
    page: 1
  }
}

export const Default = {}
