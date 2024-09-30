<template>
  <div role="group" class="input-group mb-3">
    <span class="input-group-text">
      <phosphor-icon name="link" />
    </span>
    <b-form-input
      :model-value="url"
      :state="isFormValid"
      class="b-form-control"
      :placeholder="installFromUrlLabel"
      :disabled="loading"
      type="url"
      @update:model-value="(newValue) => (url = newValue)"
    /><button-icon
      variant="tertiary"
      icon-left="cloud-arrow-down"
      class="ms-2 text-nowrap rounded-1"
      :disabled="!isFormValid || loading"
      :loading="loading"
      @click="installPluginFromUrl"
    >
      {{ installLabel }}
    </button-icon>
    <b-form-invalid-feedback class="text-primary" :state="isFormValid">
      {{ enterCorrectUrlLabel }}
    </b-form-invalid-feedback>
  </div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'
import { PhosphorIcon } from '@icij/murmur-next'
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'
import { isUrl } from '@/utils/strings'
const url = defineModel({ type: String })
defineProps({
  loading: { type: Boolean, default: false }
})
const emit = defineEmits(['install'])

const { t } = useI18n()
const installLabel = computed(() => t('plugins.install'))
const enterCorrectUrlLabel = computed(() => t('global.enterCorrectUrl'))
const installFromUrlLabel = computed(() => t('plugins.installFromUrl'))

const isFormValid = computed(() => {
  return url.value?.length ? isUrl(url.value) : null
})
function installPluginFromUrl() {
  emit('install', url.value)
}
</script>
