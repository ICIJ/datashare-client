<script setup>
const modelValue = defineModel({ type: Boolean, default: false })

defineProps({
  fileType: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: null
  }
})
</script>

<template>
  <div class="file-types-view-category-entry">
    <b-form-checkbox v-model="modelValue">
      {{ fileType }}
    </b-form-checkbox>
    <span
      v-if="count !== null"
      class="file-types-view-category-entry__count"
    >
      {{ count }}
    </span>
  </div>
</template>
