<script setup>
import { matchesProperty, property } from 'lodash'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const modelValue = defineModel({
  type: Array,
  default: () => []
})

const { options } = defineProps({
  options: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()

const indeterminate = computed(() => !!modelValue.value.length && modelValue.value.length < options.length)

const all = computed({
  get() {
    return modelValue.value.length === options.length
  },
  set(checked) {
    const values = options.map(property('value'))
    const disabledValues = options.filter(matchesProperty('disabled', true)).map(property('value'))
    modelValue.value = checked ? values : disabledValues
  }
})
</script>

<template>
  <b-form-checkbox v-model="all" :indeterminate="indeterminate">
    {{ t('pageSettingsSectionGroupAll.label') }}
  </b-form-checkbox>
</template>
