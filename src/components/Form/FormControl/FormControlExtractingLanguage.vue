<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import { apiInstance as api } from '@/api/apiInstance'
import { useWait } from '@/composables/useWait'
import AppOverlay from '@/components/AppOverlay/AppOverlay'

const modelValue = defineModel({
  type: String,
  default: null
})

const { t } = useI18n()
const wait = useWait()
const textLanguages = ref([])

const nullOption = computed(() => ({
  value: null,
  text: t('formControlExtractingLanguage.nullOption')
}))

const options = computed(() =>
  textLanguages.value.map(language => ({
    value: language.iso6392,
    text: t(`filter.lang.${language.name}`)
  }))
)

const loaderId = computed(() => wait.loaderId)
const isReady = computed(() => !wait.waiting(loaderId.value))
const hasTextLanguages = computed(() => !textLanguages.value.length)

async function loadLanguages() {
  wait.start(loaderId.value)
  try {
    textLanguages.value = await api.textLanguages()
  } catch {
    window.$toast.error(t('formControlExtractingLanguage.failedToRetrieveLanguages'))
  }
  wait.end(loaderId.value)
}

onMounted(loadLanguages)
</script>

<template>
  <app-overlay
    :show="!isReady"
    class="form-control-extracting-language"
    rounded
    spinner-small
  >
    <b-alert
      v-if="isReady && hasTextLanguages"
      model-value
      variant="danger"
      class="form-control-extracting-language--no-language m-0"
    >
      {{ t('formControlExtractingLanguage.failedToRetrieveLanguages') }}
    </b-alert>
    <b-form-group v-else>
      <b-form-select
        v-model="modelValue"
        :options="[nullOption, ...options]"
        class="form-control-extracting-language__ocr-options"
      />
    </b-form-group>
  </app-overlay>
</template>
