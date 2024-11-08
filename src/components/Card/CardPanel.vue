<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'
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
  width: {
    type: String
  },
  contentClass: {
    type: String,
    default: 'gap-4'
  }
})

const { t } = useI18n()
const closeLabel = t('documentUserActionsCard.close')
const panelWidth = computed(() => `--card-panel-width : ${props.width}`)

const emit = defineEmits(['close'])

const close = () => {
  modelValue.value = false
  emit('close')
}
</script>

<template>
  <b-card v-if="modelValue" class="card-panel shadow-sm border-0 py-4" :style="panelWidth">
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
        square
        :label="closeLabel"
        @click="close()"
      />
    </b-card-title>
    <b-card-text class="card-panel__content d-flex flex-column" :class="contentClass">
      <slot />
    </b-card-text>
  </b-card>
</template>

<style lang="scss" scoped>
.card-panel {
  width: var(--card-panel-width);
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
