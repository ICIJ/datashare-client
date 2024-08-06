import { PhosphorIcon } from '@icij/murmur-next'
import { BButton } from 'bootstrap-vue-next'

import DocumentUserActionsCard from '@/components/Document/DocumentUserActionsCard/DocumentUserActionsCard.vue'
import ButtonIcon from '@/components/Button/ButtonIcon.vue'
import DisplayTags from '@/components/Display/DisplayTags.vue'

export default {
  components: { BButton, DisplayTags, PhosphorIcon, ButtonIcon },
  title: 'Components/Document/DocumentUserActionsCard/DocumentUserActionsCard',
  tags: ['autodocs'],
  component: DocumentUserActionsCard,
  args: {
    icon: '',
    title: 'Generic card title',
    isSplit: false,
    showWarning: false
  },
  render: (args) => ({
    components: {
      DocumentUserActionsCard,
      DisplayTags,
      PhosphorIcon,
      BButton
    },
    setup: () => ({ args }),
    template: `
      <document-user-actions-card v-bind="args">
        <template #others>
          Others content
        </template>
        <template #yours>
          Your content
        </template>
        <template #footer-warning>
          Warning is activated (in general in server mode)
        </template>
        <template #footer>
          <b-button variant="action" class="me-2" >Action</b-button> Action footer
        </template>
      </document-user-actions-card>
    `
  })
}

export const Default = {
  args: {}
}
export const IsServer = {
  args: {
    isSplit: true,
    showWarning: true
  }
}
export const SplitContentExample = {
  args: {
    icon: 'tag',
    title: '27 Tags',
    isSplit: false,
    showWarning: false,
    listNameOthers: 'Added by others',
    listNameYours: 'Added by you'
  },
  render: (args) => ({
    components: {
      DocumentUserActionsCard,
      ButtonIcon,
      DisplayTags,
      PhosphorIcon
    },
    setup: () => ({ args }),
    template: `
      <document-user-actions-card v-bind="args">
        <template #others>
          <display-tags :value="['test']" />
        </template>
        <template #yours>
          <display-tags :value="['test']" />
        </template>
        <template #footer-warning>
          Your tags are public to project members
        </template>
        <template #footer>
          <button-icon icon-left="tag" label="Add a tag" />
        </template>
      </document-user-actions-card>
    `
  })
}
export const DefaultContentSlot = {
  args: {
    icon: 'chats-teardrop',
    title: '27 Comments',
    showWarning: true
  },
  render: (args) => ({
    components: {
      DocumentUserActionsCard,
      ButtonIcon,
      DisplayTags,
      PhosphorIcon
    },
    setup: () => ({ args }),
    template: `
      <document-user-actions-card v-bind="args">
        <template #content>
          Content slot (when split is not needed)
        </template>
        <template #footer-warning>
          Your tags are public to project members
        </template>
        <template #footer>
          <button-icon icon-left="tag" label="Add a tag" />
        </template>
      </document-user-actions-card>
    `
  })
}
