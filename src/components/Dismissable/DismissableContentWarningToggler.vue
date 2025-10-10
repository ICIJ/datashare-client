<script setup>
import { useI18n } from 'vue-i18n'
import { PhosphorIcon, ButtonIcon } from '@icij/murmur-next'

const { t } = useI18n()
const modelValue = defineModel({ type: Boolean, default: true })
const toggle = () => (modelValue.value = !modelValue.value)
</script>

<template>
  <div
    class="dismissable-content-warning-toggler"
  >
    <phosphor-icon
      :name="PhEyeSlash"
      size="2em"
    />
    <h4>{{ t('dismissableContentWarningToggler.title') }}</h4>
    <p class="m-0">
      {{ t('dismissableContentWarningToggler.description') }}
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
