<script setup>
import { computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { PhosphorIcon, ButtonIcon } from '@icij/murmur-next'
import { useElementBounding } from '@vueuse/core'

import AppOverlay from '@/components/AppOverlay/AppOverlay'

const show = defineModel('show', { type: Boolean, default: true })

const props = defineProps({
  bgColor: {
    type: String,
    default: 'var(--bs-body-bg)'
  },
  noBlur: {
    type: Boolean,
    default: false
  },
  contentClass: {
    type: [String, Object, Array]
  }
})

const overlay = useTemplateRef('overlay')
const { height: overlayHeight } = useElementBounding(overlay)
const toggle = () => (show.value = !show.value)
const { t } = useI18n()

const classList = computed(() => {
  return {
    'dismissable-content-warning--blurred': !props.noBlur && show.value
  }
})

const style = computed(() => {
  return {
    '--dismissable-content-warning-min-height': `${overlayHeight.value}px`
  }
})
</script>

<template>
  <app-overlay
    :show="show"
    :style="style"
    :class="classList"
    :bg-color="bgColor"
    class="dismissable-content-warning"
  >
    <div class="dismissable-content-warning__content" :class="contentClass">
      <slot />
    </div>
    <template #overlay>
      <div
        ref="overlay"
        class="dismissable-content-warning__overlay"
      >
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
  --dismissable-content-warning-min-height: 3rem;
  --dismissable-content-warning-overflow: visible;
  --dismissable-content-warning-content-filter: none;
  --dismissable-content-warning-content-overflow: visible;

  overflow: var(--dismissable-content-warning-overflow);
  display: block;
  min-height: var(--dismissable-content-warning-min-height);
  width: 100%;

  &--blurred {
    --dismissable-content-warning-overflow: hidden;
    --dismissable-content-warning-content-filter: blur(1rem) grayscale(1);
    --dismissable-content-warning-content-overflow: hidden;
  }

  &__content {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto;
    filter: var(--dismissable-content-warning-content-filter);
    overflow: var(--dismissable-content-warning-content-overflow);
    transition: filter 0.3s ease;
  }

  &__overlay {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: $spacer;
    padding: $spacer;
    box-sizing: border-box;
  }
}
</style>
