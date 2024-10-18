<script setup>
defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 10
  },
  step: {
    type: Number,
    default: 1
  }
})
</script>

<template>
  <div class="form-control-range d-inline-block">
    <div class="form-control-range__wrapper">
      <form-control-range-slider
        class="mb-3"
        :model-value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        @update:modelValue="$emit('update:modelValue', $event)"
      />
      <form-control-range-ticks
        :model-value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        @update:modelValue="$emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-control-range {
  padding-top: $spacer-xs;
  overflow: hidden;

  &__wrapper {
    margin: 0 -1 * math.div($spacer-xl, 2);
  }
}
</style>
