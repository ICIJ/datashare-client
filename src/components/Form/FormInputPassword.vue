<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { AppIcon } from '@icij/murmur'

import IPhEye from '~icons/ph/eye'
import IPhEyeSlash from '~icons/ph/eye-slash'

defineOptions({
  name: 'FormInputPassword',
  inheritAttrs: false
})

defineProps({
  // Disables both the input and its visibility toggle
  disabled: {
    type: Boolean
  }
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()

const visible = ref(false)
const type = computed(() => (visible.value ? 'text' : 'password'))
const icon = computed(() => (visible.value ? IPhEyeSlash : IPhEye))
const toggleLabel = computed(() => (visible.value ? t('formInputPassword.hide') : t('formInputPassword.show')))

function toggleVisibility() {
  visible.value = !visible.value
}
</script>

<template>
  <!-- Styled after @icij/murmur's FormControlSecret (left link toggler on the disabled-input
       background), which can't be reused directly since its input is hard-coded readonly. -->
  <b-input-group class="form-input-password flex-nowrap">
    <b-button
      variant="link"
      class="form-input-password__toggle"
      :aria-label="toggleLabel"
      :title="toggleLabel"
      :disabled="disabled"
      @click="toggleVisibility"
    >
      <app-icon><component :is="icon" /></app-icon>
    </b-button>
    <b-form-input
      v-bind="$attrs"
      :disabled="disabled"
      :type="type"
      class="form-input-password__input"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </b-input-group>
</template>

<style lang="scss" scoped>
.form-input-password__toggle {
  background: $input-disabled-bg;
  border: $input-border-width solid $input-border-color;
  border-right: 0;
}
</style>
