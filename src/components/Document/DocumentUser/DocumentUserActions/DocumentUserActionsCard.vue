<script setup>
import DocumentUserActionsCardInfo from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsCardInfo'
import DocumentUserActionsCardList from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsCardList'
import CardPanel from '@/components/CardPanel/CardPanel'
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
  listBodyClassOthers: {
    type: [String, Array, Object]
  },
  listNameYours: {
    type: String,
    required: false,
    default: 'Yours'
  },
  listBodyClassYours: {
    type: [String, Array, Object]
  }
})
</script>

<template>
  <card-panel
    v-model="modelValue"
    :title="title"
    :icon="icon"
    :icon-weight="iconWeight"
    class="document-user-actions-card"
  >
    <header v-if="actionStart">
      <document-user-actions-card-info v-if="showWarning">
        <slot name="action-warning" />
      </document-user-actions-card-info>
      <slot name="action" />
    </header>
    <section class="d-flex flex-column gap-3">
      <slot>
        <template v-if="isSplit">
          <document-user-actions-card-list :title="listNameYours" :body-class="listBodyClassYours">
            <slot name="yours" />
          </document-user-actions-card-list>
          <document-user-actions-card-list :title="listNameOthers" :body-class="listBodyClassOthers">
            <slot name="others" />
          </document-user-actions-card-list>
        </template>
        <template v-else>
          <document-user-actions-card-list :body-class="listBodyClassYours">
            <slot name="yours" />
          </document-user-actions-card-list>
        </template>
      </slot>
    </section>
    <footer v-if="actionEnd" class="d-flex flex-column">
      <document-user-actions-card-info v-if="showWarning" class="text-light-emphasis">
        <slot name="action-warning" />
      </document-user-actions-card-info>
      <slot name="action" />
    </footer>
  </card-panel>
</template>
