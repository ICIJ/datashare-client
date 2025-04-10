<script setup>
import { computed } from 'vue'

import FormStepHeading from '@/components/Form/FormStep/FormStepHeading'
import FormStepContent from '@/components/Form/FormStep/FormStepContent'

const collapse = defineModel('collapse', { type: Boolean, default: false })

defineProps({
  title: {
    type: String,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  contentClass: {
    type: String
  }
})

const classList = computed(() => ({
  'form-step--collapsed': collapse.value === true
}))
</script>

<template>
  <div class="form-step bg-tertiary-subtle p-3 rounded-4" :class="classList">
    <form-step-heading v-model:collapse="collapse" :title="title" :index="index">
      <template #title>
        <slot name="title" />
      </template>
    </form-step-heading>
    <form-step-content :collapse="collapse" class="ms-md-5" :content-class="contentClass">
      <slot />
    </form-step-content>
  </div>
</template>

<style lang="scss" scoped>
.form-step {
  box-shadow: 0 0 0 1px transparent inset;
  @include transition($transition-base);
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
