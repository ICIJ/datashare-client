<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'

defineOptions({ name: 'CardPanel' })
defineProps({
  title: { type: String, required: true },
  icon: { type: String, required: true },
  noXIcon: { type: Boolean, default: false }
})

const { t } = useI18n()
const closeLabel = t('documentUserActionsCard.close')
</script>

<template>
  <b-card class="card-panel shadow border-0 px-2">
    <b-card-title class="card-panel__title d-flex justify-content-between align-items-center fw-bold my-2">
      <span>
        <phosphor-icon :name="icon" class="me-2" /><slot name="title">{{ title }}</slot>
      </span>
      <button-icon
        v-if="!noXIcon"
        variant="outline-tertiary"
        class="card-panel__close"
        icon-left="x"
        hide-label
        square
        :label="closeLabel"
        @close="$emit('close')"
    /></b-card-title>
    <b-card-text class="card-panel__content d-flex flex-column gap-4">
      <slot></slot>
    </b-card-text>
  </b-card>
</template>

<style lang="scss">
.card-panel {
  .card-body {
    display: flex;
    flex-direction: column;
    gap: $spacer-lg;
  }
}
</style>
