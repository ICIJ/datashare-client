<template>
  <b-card class="document-user-actions-card">
    <div class="d-flex justify-content-between">
      <h3 class="fw-bold text-action-emphasis mb-2">
        <phosphor-icon :name="icon" class="me-2" /><slot name="title">{{ title }}</slot>
      </h3>
      <button-icon
        variant="outline-tertiary"
        icon-left="x"
        hide-label
        square
        :label="closeLabel"
        @close="$emit('close')"
      />
    </div>
    <div class="py-4">
      <slot name="content">
        <template v-if="isSplit">
          <document-user-actions-card-list :title="listNameOthers">
            <slot name="others"></slot>
          </document-user-actions-card-list>
          <document-user-actions-card-list :title="listNameYours">
            <slot name="yours"></slot>
          </document-user-actions-card-list>
        </template>
        <template v-else>
          <slot name="yours"></slot>
        </template>
      </slot>
    </div>
    <footer class="pt-2">
      <p v-if="showWarning" class="text-light-emphasis">
        <phosphor-icon name="info" class="me-1" /><slot name="footer-warning"></slot>
      </p>
      <slot name="footer">ActionFooter</slot>
    </footer>
  </b-card>
</template>
<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import DocumentUserActionsCardList from '@/components/Document/DocumentUserActions/DocumentUserActionsCardList'
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
  listNameOthers: { type: String, required: false, default: 'Others' },
  listNameYours: { type: String, required: false, default: 'Yours' }
})

const { t } = useI18n()
const closeLabel = t('documentUserActionCard.close')
</script>
