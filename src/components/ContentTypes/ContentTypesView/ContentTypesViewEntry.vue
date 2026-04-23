<script setup>
const modelValue = defineModel({ type: Boolean, default: false })

defineProps({
  contentType: {
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
  <div class="content-types-view-entry">
    <b-form-checkbox v-model="modelValue">
      {{ contentType }}
    </b-form-checkbox>
    <span
      v-if="count !== null"
      class="content-types-view-entry__count"
    >
      {{ count }}
    </span>
  </div>
</template>
