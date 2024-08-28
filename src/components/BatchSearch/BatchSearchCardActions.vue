<script setup>
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'

defineOptions({ name: 'BatchSearchCardActions' })

const { t } = useI18n()

const actions = {
  relaunchAction: {
    event: 'relaunch',
    label: t('batchSearchCardActions.relaunch'),
    icon: 'arrow-clockwise'
  },
  editAction: {
    event: 'edit',
    label: t('batchSearchCardActions.edit'),
    icon: 'pencil-simple'
  },
  deleteAction: {
    event: 'delete',
    label: t('batchSearchCardActions.delete'),
    icon: 'trash'
  }
}
</script>

<template>
  <div class="batch-search-card-actions flex-wrap d-flex gap-2">
    <button-icon
      v-for="(action, index) in actions"
      :key="index"
      :icon-left="action.icon"
      :label="action.label"
      size="sm"
      variant="outline-secondary"
      class="border-0"
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
