import IconButton from '@/components/IconButton'
import DocumentActionsGroup from '@/components/Document/DocumentActionsGroup/DocumentActionsGroup'

export default {
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
      </document-actions-group>
    `
  })
}

export const Default = {
  args: {
    document: {
      id: 'test'
    },
    vertical: false,
    tooltipPlacement: 'top',
    isStarred: false,
    isDownloadAllowed: false,
    selectMode: true,
    selected: false
  }
}
