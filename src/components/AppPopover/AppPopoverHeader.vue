<script setup>
import { computed, useSlots } from 'vue'
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'

defineOptions({ name: 'AppPopoverTitle' })

const props = defineProps({
  title: {
    type: String
  },
  tag: {
    type: String,
    default: 'h3'
  }
})
const { t } = useI18n()

const emit = defineEmits(['hide'])
const slots = useSlots()
const showHeader = computed(() => props.title || slots.title || slots.close)
</script>

<template>
  <div v-if="showHeader" class="app-popover-header d-flex align-items-start">
    <component :is="tag" class="app-popover-header__title flex-grow-1">
      <slot name="title">
        {{ title }}
      </slot>
    </component>
    <slot name="close">
      <button-icon
        icon-left="x"
        hide-label
        hide-tooltip
        variant="outline-secondary"
        class="app-popover-header__close ms-auto p-0"
        :label="t('appPopoverHeader.close')"
        @click="emit('hide')"
      />
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.app-popover-header {
  &__title {
    font-size: 1rem;
    font-style: normal;
    font-weight: 500;
    line-height: 1.5rem;
    margin: 0;
    padding: 0;
  }
}
</style>
