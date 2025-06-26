import { vueRouter } from 'storybook-vue3-router'

import ButtonIcon from '@/components/Button/ButtonIcon'
import NavigationBreadcrumb from '@/components/NavigationBreadcrumb/NavigationBreadcrumb'
import NavigationBreadcrumbEntry from '@/components/NavigationBreadcrumb/NavigationBreadcrumbEntry'

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
                },
                children: [
                  {
                    path: '/tasks/batch-searches/view/queries',
                    name: 'tasks.batch-searches.view.queries',
                    meta: {
                      icon: null
                    },
                    children: [
                      {
                        path: '/tasks/batch-searches/view/queries/foo',
                        name: 'tasks.batch-searches.view.queries.foo',
                        meta: {
                          icon: null
                        },
                        children: [
                          {
                            path: '/tasks/batch-searches/view/queries/foo/results',
                            name: 'tasks.batch-searches.view.queries.foo.results',
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
          }
        ]
      }
    ]
  }
]

export default {
  decorators: [vueRouter(routes)],
  title: 'Components/NavigationBreadcrumb/NavigationBreadcrumb',
  tags: ['autodocs'],
  component: NavigationBreadcrumb,
  args: {
    maxLevel: 5,
    currentRouteName: 'tasks.batch-searches.view'
  }
}

export const Default = {}

export const MaxLevel = {
  args: {
    maxLevel: 3,
    currentRouteName: 'tasks.batch-searches.view.queries.foo.results'
  }
}

export const ActiveSlot = {
  render: () => ({
    components: {
      NavigationBreadcrumb
    },
    template: `
      <navigation-breadcrumb current-route-name="tasks.batch-searches.view">
        <template #active>
          Rich people in EU
        </template>
      </navigation-breadcrumb>
    `
  })
}

export const ButtonAddon = {
  render: () => ({
    components: {
      ButtonIcon,
      NavigationBreadcrumb,
      NavigationBreadcrumbEntry
    },
    template: `
      <navigation-breadcrumb current-route-name="tasks.batch-searches.view">
        <template #addon>
          <navigation-breadcrumb-entry>
            <button-icon variant="outline-secondary" icon-left="download-simple">
              Download 8,506 documents
            </button-icon>
          </navigation-breadcrumb-entry>
        </template>
      </navigation-breadcrumb>
    `
  })
}

export const MultipleAddons = {
  render: () => ({
    components: {
      ButtonIcon,
      NavigationBreadcrumb,
      NavigationBreadcrumbEntry
    },
    template: `
      <navigation-breadcrumb current-route-name="tasks.batch-searches.view">
        <template #addon>
          <navigation-breadcrumb-entry>
            <button-icon variant="outline-secondary" icon-left="download-simple">
              Download 8,506 documents
            </button-icon>
          </navigation-breadcrumb-entry>
          <navigation-breadcrumb-entry class="ms-auto">
            <button-icon
              tooltip-placement="left"
              variant="action"
              pill
              square
              hide-label
              icon-left="plus"
              label="Start a batch search" />
          </navigation-breadcrumb-entry>
          <navigation-breadcrumb-entry class="pe-0">
            <button-icon
              tooltip-placement="left"
              variant="link"
              square
              hide-label
              icon-left="sliders-horizontal"
              label="Configure current view" />
          </navigation-breadcrumb-entry>
        </template>
      </navigation-breadcrumb>
    `
  })
}
