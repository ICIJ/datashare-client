<script setup>
import { useI18n } from 'vue-i18n'

import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'

const modelValue = defineModel({ type: String })

defineProps({
  /**
   * Whether to add a shadow to the search box
   */
  shadow: {
    type: Boolean,
    default: true
  }
})

const { t } = useI18n()
</script>

<template>
  <div class="path-tree-view-search">
    <form-control-search
      v-model="modelValue"
      class="path-tree-view-search__control"
      :placeholder="t('pathViewSearch.placeholder')"
      clear-text
      :shadow="shadow"
    />
  </div>
</template>
