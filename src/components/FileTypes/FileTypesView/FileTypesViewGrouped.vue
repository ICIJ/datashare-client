<script setup>
const modelValue = defineModel({ type: Boolean })

defineProps({
  category: {
    type: String,
    required: true
  },
  fileTypes: {
    type: Array,
    required: false,
    default: () => []
  },
})
</script>

<template>
  <div class="file-types-view-entry">
    <b-form-checkbox v-model="modelValue">
      {{ category }}
    </b-form-checkbox>
    <div
      v-for="fileType in fileTypes"
      :key="fileType"
      class="file-types-view-entry__file-type"
    >
      {{ fileType }}
    </div>
  </div>
</template>
