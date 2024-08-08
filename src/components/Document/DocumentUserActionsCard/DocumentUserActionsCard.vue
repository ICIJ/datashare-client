<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import DocumentUserActionsCardList from '@/components/Document/DocumentUserActionsCard/DocumentUserActionsCardList'
import ButtonIcon from '@/components/Button/ButtonIcon'
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

const { t } = useI18n()
const closeLabel = t('documentUserActionsCard.close')
</script>

<template>
  <b-card class="document-user-actions-card shadow border-0">
    <b-card-title class="d-flex justify-content-between align-items-center">
      <h4 class="fw-bold my-2">
        <phosphor-icon :name="icon" class="me-2" /><slot name="title">{{ title }}</slot>
      </h4>
      <button-icon
        variant="outline-tertiary"
        icon-left="x"
        hide-label
        square
        :label="closeLabel"
        @close="$emit('close')"
    /></b-card-title>
    <b-card-text class="d-flex flex-column gap-4">
      <header v-if="actionStart">
        <p v-if="showWarning" class="text-light-emphasis">
          <phosphor-icon name="info" class="me-1" /><slot name="action-warning"></slot>
        </p>
        <slot name="action"></slot>
      </header>
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
      <header v-if="actionEnd">
        <p v-if="showWarning" class="text-light-emphasis">
          <phosphor-icon name="info" class="me-1" /><slot name="action-warning"></slot>
        </p>
        <slot name="action"></slot>
      </header>
    </b-card-text>
  </b-card>
</template>

<style scoped lang="scss">
.card-body {
  display: flex;
  flex-direction: column;
  gap: 2em;
}
</style>
