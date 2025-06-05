<script setup>
import { useI18n } from 'vue-i18n'

import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'

const modelValue = defineModel({ type: String, default: '' })
const { t } = useI18n()

defineProps({
  placeholder: {
    type: String,
    default: null
  }
})
</script>

<template>
  <form-control-search
    v-model="modelValue"
    :placeholder="placeholder ?? t('filtersPanelSearch.placeholder')"
    shadow
    clear-text
    class="filters-panel-search"
  />
</template>
