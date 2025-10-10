<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PhosphorIcon, ButtonIcon } from '@icij/murmur-next'

import AppOverlay from '@/components/AppOverlay/AppOverlay'

const show = defineModel('show', { type: Boolean, default: true })
const toggle = () => (show.value = !show.value)
const { t } = useI18n()
const classList = computed(() => {
  return {
    'dismissable-content-warning--blurred': show.value
  }
})
</script>

<template>
  <app-overlay
    :show="show"
    :class="classList"
    class="dismissable-content-warning"
  >
    <div class="dismissable-content-warning__content">
      <slot />
    </div>
    <template #overlay>
      <div class="text-center d-flex flex-column gap-3 m-3 align-items-center">
        <phosphor-icon
          :name="PhEyeSlash"
          size="2em"
        />
        <h4>{{ t('dismissableContentWarning.title') }}</h4>
        <p class="m-0">
          {{ t('dismissableContentWarning.description') }}
        </p>
        <button-icon
          variant="outline-primary"
          :label="t('dismissableContentWarning.toggle')"
          @click="toggle()"
        />
      </div>
    </template>
  </app-overlay>
</template>

<style lang="scss" scoped>
.dismissable-content-warning {
  --dismissable-content-warning-overflow: visible;
  --dismissable-content-warning-content-filter: none;
  --dismissable-content-warning-content-overflow: visible;

  overflow: var(--dismissable-content-warning-overflow);
  display: inline-block;

  &--blurred {
    --dismissable-content-warning-overflow: hidden;
    --dismissable-content-warning-content-filter: blur(0.75rem) grayscale(1);
    --dismissable-content-warning-content-overflow: hidden;
  }

  &__content {
    overflow: var(--dismissable-content-warning-content-overflow);
    filter: var(--dismissable-content-warning-content-filter);
    transition: filter 0.3s ease;
  }
}
</style>
