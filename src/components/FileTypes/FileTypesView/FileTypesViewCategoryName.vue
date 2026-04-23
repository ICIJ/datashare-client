<script setup>
const modelValue = defineModel({ type: Boolean, default: false })

defineProps({
  label: {
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
  <div class="file-types-view-category-name">
    <b-form-checkbox v-model="modelValue">
      {{ label }}
    </b-form-checkbox>
    <span
      v-if="count !== null"
      class="file-types-view-category-name__count"
    >
      {{ count }}
    </span>
  </div>
</template>
