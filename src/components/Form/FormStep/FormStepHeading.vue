<script setup>
import FormStepHeadingIndex from './FormStepHeadingIndex'
import FormStepHeadingTitle from './FormStepHeadingTitle'
import FormStepHeadingToggler from './FormStepHeadingToggler'

defineProps({
  title: {
    type: String,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  collapse: {
    type: Boolean
  }
})
</script>

<template>
  <div class="form-step-heading d-flex align-items-center gap-3" @click="$emit('update:collapse', !collapse)">
    <form-step-heading-index :index="index" :collapse="collapse" />
    <form-step-heading-title :title="title">
      <slot name="title" />
    </form-step-heading-title>
    <form-step-heading-toggler :collapse="collapse" class="ms-auto" />
  </div>
</template>
