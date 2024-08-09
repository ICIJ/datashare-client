<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

import DocumentUserActionsCardList from '@/components/Document/DocumentUserActionsCard/DocumentUserActionsCardList'
import CardPanel from '@/components/Card/CardPanel'
defineOptions({ name: 'DocumentUserActionsCard' })
defineProps({
  title: { type: String, required: true },
  icon: { type: String, required: true },
  isSplit: {
    type: Boolean,
    default: false
  },
  showWarning: {
    type: Boolean,
    default: false
  },
  actionStart: {
    type: Boolean,
    default: false
  },
  actionEnd: {
    type: Boolean,
    default: false
  },
  listNameOthers: { type: String, required: false, default: 'Others' },
  listNameYours: { type: String, required: false, default: 'Yours' }
})
</script>

<template>
  <card-panel :title="title" :icon="icon">
    <header v-if="actionStart">
      <p v-if="showWarning" class="text-light-emphasis">
        <phosphor-icon name="info" class="me-1" /><slot name="action-warning"></slot>
      </p>
      <slot name="action"></slot>
    </header>
    <section class="d-flex flex-column gap-4">
      <slot name="content">
        <template v-if="isSplit">
          <document-user-actions-card-list :title="listNameYours">
            <slot name="yours"></slot>
          </document-user-actions-card-list>
          <document-user-actions-card-list :title="listNameOthers">
            <slot name="others"></slot>
          </document-user-actions-card-list>
        </template>
        <template v-else>
          <slot name="yours"></slot>
        </template>
      </slot>
    </section>
    <footer v-if="actionEnd" class="d-flex flex-column">
      <p v-if="showWarning" class="text-light-emphasis">
        <phosphor-icon name="info" class="me-1" /><slot name="action-warning"></slot>
      </p>
      <slot name="action"></slot>
    </footer>
  </card-panel>
</template>
