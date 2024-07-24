import IconButton from '@/components/IconButton'
import { vueRouter } from 'storybook-vue3-router'
import DocumentActionsGroup from '@/components/Document/DocumentActionsGroup/DocumentActionsGroup'
const routes = [{  name: 'document-modal',path: '/document-modal' }]

export default {
  decorators: [vueRouter(routes)],
  components: { DocumentActionsGroup },
  title: 'Components/Document/DocumentActionsGroup',
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
      <document-actions-group v-bind="args" >
      <template #selection>
      <b-checkbox/>
      </template>
      </document-actions-group>
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
