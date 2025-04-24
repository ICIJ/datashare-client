<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'
import { ICON_WEIGHTS } from '@/enums/iconWeights'

defineOptions({ name: 'CardPanel' })

const modelValue = defineModel({ type: Boolean, default: true })

const props = defineProps({
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
  noXIcon: {
    type: Boolean,
    default: false
  },
  contentClass: {
    type: [String, Object, Array],
    default: 'gap-3'
  },
  border: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const classList = computed(() => ({ 'card-panel--borderless': !props.border }))

const close = () => {
  modelValue.value = false
  emit('close')
}
</script>

<template>
  <b-card v-if="modelValue" class="card-panel shadow-sm py-4" :class="classList">
    <b-card-title class="card-panel__title d-flex justify-content-between align-items-center fw-bold">
      <span>
        <phosphor-icon v-if="icon" :name="icon" :weight="iconWeight" class="me-2" />
        <slot name="title">{{ title }}</slot>
      </span>
      <button-icon
        v-if="!noXIcon"
        variant="outline-tertiary"
        class="card-panel__close"
        icon-left="x"
        hide-label
        hide-tooltip
        square
        :label="$t('documentUserActionsCard.close')"
        @click="close()"
      />
    </b-card-title>
    <b-card-text class="card-panel__content d-flex flex-column" :class="contentClass" tag="div">
      <slot />
    </b-card-text>
  </b-card>
</template>

<style lang="scss" scoped>
.card-panel {
  &--borderless {
    border: 0;
  }

  &__title {
    font-size: $font-size-lg;
    margin: 0;
  }

  &__close {
    --button-icon-square-size: 44px;
  }

  &:deep(.card-body) {
    display: flex;
    flex-direction: column;
    gap: $spacer-xl;
    padding: $spacer-sm $spacer-xl;
  }
}
</style>
