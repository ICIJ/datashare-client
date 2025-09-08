<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const modelValue = defineModel({ type: Boolean, default: false })

const ocrOptions = computed(() => [
  { text: t('task.documents.form.extractOcr.options.yes'), value: true },
  { text: t('task.documents.form.extractOcr.options.no'), value: false }
])

const disabled = ref(false)
</script>

<template>
  <b-form-radio-group
    v-model="modelValue"
    name="extract-ocr"
    :disabled="disabled"
    :options="ocrOptions"
    stacked
  />
</template>
