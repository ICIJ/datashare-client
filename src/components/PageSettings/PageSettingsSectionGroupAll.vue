<script setup>
import { property } from 'lodash'
import { computed } from 'vue'

const { options } = defineProps({
  options: {
    type: Object,
    required: true
  }
})

const modelValue = defineModel({
  type: Array,
  default: () => []
})

const indeterminate = computed(() => modelValue.value.length && modelValue.value.length < options.length)

const all = computed({
  get() {
    return modelValue.value.length === options.length
  },
  set(checked) {
    const values = options.map(property('value'))
    modelValue.value = checked ? values : []
  }
})
</script>

<template>
  <b-form-checkbox v-model="all" :indeterminate="indeterminate">
    {{ $t('pageSettingsSectionGroupAll.label') }}
  </b-form-checkbox>
</template>
