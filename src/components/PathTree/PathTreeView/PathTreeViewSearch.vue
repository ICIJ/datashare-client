<script setup>
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'

const modelValue = defineModel({ type: String })

defineProps({
  shadow: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <div class="path-tree-view-search">
    <form-control-search
      v-model="modelValue"
      class="path-tree-view-search__control"
      :placeholder="$t('pathViewSearch.placeholder')"
      clear-text
      :shadow="shadow"
    />
  </div>
</template>
