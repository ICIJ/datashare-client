<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import { useLanguagesStore } from '@/store/modules/languages'
import AppOverlay from '@/components/AppOverlay/AppOverlay'

const modelValue = defineModel({
  type: String,
  default: null
})

const { t } = useI18n()
const languagesStore = useLanguagesStore()

const nullOption = computed(() => ({
  value: null,
  text: t('formControlExtractingLanguage.nullOption')
}))

const options = computed(() =>
  languagesStore.textLanguages.map(language => ({
    value: language.iso6392,
    text: t(`filter.lang.${language.name}`)
  }))
)

onMounted(languagesStore.fetch)
</script>

<template>
  <app-overlay
    :show="languagesStore.isLoading"
    class="form-control-extracting-language"
    rounded
    spinner-small
  >
    <b-alert
      v-if="languagesStore.missingTextLanguages"
      model-value
      variant="danger"
      class="form-control-extracting-language__no-language m-0"
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
