<script setup>
const modelValue = defineModel({ type: Boolean })

defineProps({
  fileType: {
    type: Array,
    required: false,
    default: () => []
  }
})
</script>

<template>
  <div class="file-types-view-entry">
    <b-form-checkbox v-model="modelValue">
      {{ fileType }}
    </b-form-checkbox>
  </div>
</template>
