import { vueRouter } from 'storybook-vue3-router'

import NavigationBreadcrumbLink from '@/components/NavigationBreadcrumb/NavigationBreadcrumbLink'

const routes = [
  {
    path: '/projects',
    name: 'projects'
  }
]

export default {
  decorators: [vueRouter(routes)],
  title: 'Components/NavigationBreadcrumb/Link',
  tags: ['autodocs'],
  component: NavigationBreadcrumbLink,
  argTypes: {
    routeName: {
      control: { type: 'string' }
    },
    currentRouteName: {
      control: { type: 'string' }
    },
    noCaret: {
      control: { type: 'boolean' }
    },
    active: {
      control: { type: 'boolean' }
    },
    icon: {
      control: { type: 'string' }
    },
    title: {
      control: { type: 'string' }
    }
  },
  args: {
    routeName: 'projects',
    icon: 'dots-nine',
    title: 'All projects',
    noCaret: true,
    active: true
  },
  render: (args) => ({
    setup() {
      return { args }
    },
    components: {
      NavigationBreadcrumbLink
    },
    template: `
      <navigation-breadcrumb-link v-bind="args" />
    `
  })
}

export const Default = {}
