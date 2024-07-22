import IconButton from '@/components/IconButton'
import DocumentActionsGroup from '@/components/DocumentActionsGroup.vue'

export default {
  components: { DocumentActionsGroup },
  title: 'Components/DocumentActions',
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
      routerParams: {},
      contentType: '',
      contentTypeLabel: '',
      fullUrl: '',
      fullRootUrl: '',
      title: '',
      content: '',
      root: { contentType: '' }
    },
    vertical: false,
    tooltipsPlacement: 'top',
    displayDownloadOptions: false,
    isDownloadAllowed: false,
    starBtnClass: 'btn-link btn-sm',
    starredBtnClass: 'starred',
    downloadBtnClass: 'btn-link btn-sm',
    downloadBtnGroupClass: '',
    popupBtnClass: 'btn-link btn-sm',
    starBtnLabel: false,
    downloadBtnLabel: false,
    popupBtnLabel: false,
    noBtnGroup: false,
    isStarred: false
  }
}
