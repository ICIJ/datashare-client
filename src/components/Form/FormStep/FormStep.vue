<script setup>
import { computed } from 'vue'

import FormStepHeading from '@/components/Form/FormStep/FormStepHeading'
import FormStepContent from '@/components/Form/FormStep/FormStepContent'

const props = defineProps({
  collapse: {
    type: Boolean
  },
  title: {
    type: String,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const classList = computed(() => ({
  'form-step--collapsed': props.collapse
}))
</script>

<template>
  <div class="form-step bg-tertiary-subtle p-3 rounded-4" :class="classList">
    <form-step-heading
      :title="title"
      :index="index"
      :collapse="collapse"
      @update:collapse="$emit('update:collapse', $event)"
    >
      <template #title>
        <slot name="title" />
      </template>
    </form-step-heading>
    <form-step-content :collapse="collapse" class="ms-md-5">
      <slot />
    </form-step-content>
  </div>
</template>

<style lang="scss" scoped>
.form-step {
  @include transition($transition-base);
  box-shadow: 0 0 0 1px transparent inset;
}

.form-step:not(.form-step--collapsed) {
  box-shadow: 0 0 0 1px var(--bs-action) inset;
}

@include color-mode(dark) {
  .form-step:not(.form-step--collapsed) {
    box-shadow: 0 0 0 1px var(--bs-white) inset;
  }
}
</style>
