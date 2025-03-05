<script setup>
import { useI18n } from 'vue-i18n'

import ButtonRowAction from '@/components/Button/ButtonRowAction'

defineOptions({ name: 'BatchSearchCardActions' })
const { t } = useI18n()

const actions = {
  relaunchAction: {
    event: 'relaunch',
    label: 'batchSearchCardActions.relaunch',
    icon: 'arrow-clockwise'
  },
  editAction: {
    event: 'edit',
    label: 'batchSearchCardActions.edit',
    icon: 'pencil-simple'
  },
  deleteAction: {
    event: 'delete',
    label: 'batchSearchCardActions.delete',
    icon: 'trash'
  }
}
</script>

<template>
  <div class="batch-search-card-actions flex-wrap d-flex gap-2">
    <button-row-action
      v-for="(action, index) in actions"
      :key="index"
      :icon="action.icon"
      :label="t(action.label)"
      @click="$emit(action.event, { uuid })"
    />
  </div>
</template>
<style lang="scss">
.batch-search-card-actions {
  &__see-all {
    justify-content: space-between;
  }
  &__download {
    justify-content: center;
  }
}
</style>
