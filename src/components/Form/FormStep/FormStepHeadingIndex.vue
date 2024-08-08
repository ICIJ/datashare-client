<script setup>
import { computed } from 'vue'

const props = defineProps({
  collapse: {
    type: Boolean
  },
  index: {
    type: [String, Number]
  }
})

const emit = defineEmits(['update:collapse'])
const toggle = () => emit('update:collapse', !props.collapse)
const classList = computed(() => ({
  'form-step-heading-index--collapsed': props.collapse
}))
</script>

<template>
  <div class="form-step-heading-index" :class="classList" @click="toggle">
    {{ index }}
  </div>
</template>


<style lang="scss" scoped>
.form-step-heading-index {
  --form-step-heading-index-size: 2rem;
  --form-step-heading-index-bg: var(--bs-action);
  --form-step-heading-index-color: var(--bs-white);

  @include transition($transition-base);

  width: var(--form-step-heading-index-size);
  height: var(--form-step-heading-index-size);
  line-height: var(--form-step-heading-index-size);
  text-align: center;
  overflow: hidden;
  border-radius: 50%;
  background: var(--form-step-heading-index-bg);
  color: var(--form-step-heading-index-color);
  font-weight: 500;
  flex-shrink: 0;
  cursor: pointer;

  &--collapsed {
    --form-step-heading-index-bg: var(--bs-secondary);
    --form-step-heading-index-color: var(--bs-white);
  }
}

@include color-mode(dark) {
  .form-step-heading-index {
    --form-step-heading-index-bg: var(--bs-white);
    --form-step-heading-index-color: var(--bs-black);
  }

  .form-step-heading-index--collapsed {
    --form-step-heading-index-bg: var(--bs-secondary-border-subtle);
    --form-step-heading-index-color: var(--bs-body-bg);
  }
}
</style>
