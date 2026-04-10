<script setup>
import { useI18n } from 'vue-i18n'
import { AppIcon, ButtonIcon } from '@icij/murmur-next'
import { computed } from 'vue'
import IPhEyeSlash from '~icons/ph/eye-slash'

const { t } = useI18n()
const modelValue = defineModel({ type: Boolean, default: true })
const props = defineProps({
  description: { type: String }
})
const descriptionValue = computed(() => props.description ?? t('dismissableContentWarningToggler.description'))

const toggle = () => (modelValue.value = !modelValue.value)
</script>

<template>
  <div
    class="dismissable-content-warning-toggler"
  >
    <app-icon
      :name="IPhEyeSlash"
      size="2em"
    />
    <div class="dismissable-content-warning-toggler__title h4 m-0">
      <slot name="title">
        {{ t('dismissableContentWarningToggler.title') }}
      </slot>
    </div>
    <p class="dismissable-content-warning-toggler__description m-0">
      <slot name="description">
        {{ descriptionValue }}
      </slot>
    </p>
    <button-icon
      variant="outline-primary"
      :label="t('dismissableContentWarningToggler.toggle')"
      @click="toggle()"
    />
  </div>
</template>

<style lang="scss" scoped>
.dismissable-content-warning-toggler {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: $spacer;
  padding: $spacer;
  box-sizing: border-box;
}
</style>
