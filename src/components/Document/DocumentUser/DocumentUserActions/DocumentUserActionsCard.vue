<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

import DocumentUserActionsCardList from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsCardList'
import CardPanel from '@/components/Card/CardPanel'
import { ICON_WEIGHTS } from '@/enums/iconWeights'

defineOptions({ name: 'DocumentUserActionsCard' })

const modelValue = defineModel({ type: Boolean, default: true })

defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: [String, Array, Object]
  },
  iconWeight: {
    type: String,
    default: ICON_WEIGHTS.REGULAR
  },
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
  listNameOthers: {
    type: String,
    required: false,
    default: 'Others'
  },
  listNameYours: {
    type: String,
    required: false,
    default: 'Yours'
  }
})
</script>

<template>
  <card-panel v-model="modelValue" :title="title" :icon="icon" :icon-weight="iconWeight">
    <header v-if="actionStart">
      <p v-if="showWarning" class="text-light-emphasis d-flex flex-wrap">
        <phosphor-icon name="info" class="me-1" />
        <slot name="action-warning" />
      </p>
      <slot name="action" />
    </header>
    <section class="d-flex flex-column gap-4">
      <slot>
        <template v-if="isSplit">
          <document-user-actions-card-list :title="listNameYours">
            <slot name="yours" />
          </document-user-actions-card-list>
          <document-user-actions-card-list :title="listNameOthers">
            <slot name="others" />
          </document-user-actions-card-list>
        </template>
        <template v-else>
          <slot name="yours" />
        </template>
      </slot>
    </section>
    <footer v-if="actionEnd" class="d-flex flex-column">
      <p v-if="showWarning" class="text-light-emphasis">
        <phosphor-icon name="info" class="me-1" /><slot name="action-warning" />
      </p>
      <slot name="action" />
    </footer>
  </card-panel>
</template>
