import IconButton from '@/components/IconButton'
import { vueRouter } from 'storybook-vue3-router'
import DocumentActionsGroup from '@/components/DocumentActionsGroup'
const routes = [{  name: 'document-modal',path: '/document-modal' }]

export default {
  decorators: [vueRouter(routes)],
  components: { DocumentActionsGroup },
  title: 'Components/DocumentActionsGroup',
  component: IconButton,
  tags: ['autodocs'],
  render: (args) => ({
    components: {
      DocumentActionsGroup
    },
    setup() {
      return {
        args 
      }
    },
    template: `
      <document-actions-group v-bind="args" />
    `
  })
}

export const Default = {
  args: {
    document: {
      id:"test"
    },
    vertical: false,
    tooltipPlacement: 'top',
    isStarred: false,
    isDownloadAllowed: false
  }
}
