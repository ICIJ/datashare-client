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
  title: 'Components/NavigationBreadcrumb/NavigationBreadcrumbLink',
  tags: ['autodocs'],
  component: NavigationBreadcrumbLink,
  argTypes: {
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
    to: { name: 'projects' },
    icon: 'dots-nine',
    title: 'All projects',
    noCaret: true,
    active: true
  }
}

export const Default = {}
