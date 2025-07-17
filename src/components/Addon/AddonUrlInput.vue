<script setup>
import { PhosphorIcon, ButtonIcon } from '@icij/murmur-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { isUrl } from '@/utils/strings'

const url = defineModel({ type: String })

defineProps({
  loading: { type: Boolean, default: false }
})
const { t } = useI18n()

const emit = defineEmits(['install'])

const isFormValid = computed(() => (url.value?.length ? isUrl(url.value) : null))

function installPluginFromUrl() {
  emit('install', url.value)
}
</script>

<template>
  <div role="group" class="input-group mb-3">
    <span class="input-group-text">
      <phosphor-icon :name="PhLink" />
    </span>
    <b-form-input
      :model-value="url"
      :state="isFormValid"
      class="b-form-control"
      :placeholder="t('addonUrlInput.installFromUrl')"
      :disabled="loading"
      type="url"
      @update:model-value="(newValue) => (url = newValue)"
    />
    <button-icon
      variant="tertiary"
      :icon-left="PhCloudArrowDown"
      class="ms-2 text-nowrap rounded-1"
      :disabled="!isFormValid || loading"
      :loading="loading"
      @click="installPluginFromUrl"
    >
      {{ t('addonUrlInput.install') }}
    </button-icon>
    <b-form-invalid-feedback class="text-primary" :state="isFormValid">
      {{ t('addonUrlInput.enterCorrectUrl') }}
    </b-form-invalid-feedback>
  </div>
</template>
