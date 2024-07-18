import { vueRouter } from 'storybook-vue3-router'

import IconButton from '@/components/IconButton'
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
  decorators: [vueRouter(routes)],
  title: 'Components/NavigationBreadcrumb',
  tags: ['autodocs'],
  render: () => ({
    components: {
      NavigationBreadcrumb
    },
    template: `
      <navigation-breadcrumb current-route-name="tasks.batch-searches.view" />
    `
  })
}

export const Default = {}

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
      IconButton,
      NavigationBreadcrumb,
      NavigationBreadcrumbEntry
    },
    template: `
      <navigation-breadcrumb current-route-name="tasks.batch-searches.view">
        <template #addon>
          <navigation-breadcrumb-entry>
            <icon-button variant="outline-secondary" icon-left="download-simple">
              Download 8,506 documents
            </icon-button>
          </navigation-breadcrumb-entry>
        </template>
      </navigation-breadcrumb>
    `
  })
}

export const MultipleAddons = {
  render: () => ({
    components: {
      IconButton,
      NavigationBreadcrumb,
      NavigationBreadcrumbEntry
    },
    template: `
      <navigation-breadcrumb current-route-name="tasks.batch-searches.view">
        <template #addon>
          <navigation-breadcrumb-entry>
            <icon-button variant="outline-secondary" icon-left="download-simple">
              Download 8,506 documents
            </icon-button>
          </navigation-breadcrumb-entry>
          <navigation-breadcrumb-entry class="ms-auto">
            <icon-button
              tooltip-placement="left"
              variant="primary"
              pill
              square
              hide-label
              icon-left="plus"
              label="Start a batch search" />
          </navigation-breadcrumb-entry>
          <navigation-breadcrumb-entry class="pe-0">
            <icon-button
              tooltip-placement="left"
              variant="link"
              square
              hide-label
              icon-left="sliders-horizontal"
              class="text-primary-emphasis"
              label="Configure current view" />
          </navigation-breadcrumb-entry>
        </template>
      </navigation-breadcrumb>
    `
  })
}
