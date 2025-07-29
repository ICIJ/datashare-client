<script setup>
import { has } from 'lodash'
import { computed, ref } from 'vue'

import FormStepGroupToggler from '@/components/Form/FormStepGroup/FormStepGroupToggler'

const collapsedSteps = ref({})

const collapseAll = computed({
  get() {
    return Object.values(collapsedSteps.value).every(Boolean)
  },
  set(value) {
    Object.keys(collapsedSteps.value).forEach((index) => {
      collapsedSteps.value[index] = value
    })
  }
})

const toggle = (index, collapse = null) => {
  collapsedSteps.value[index] = collapse ?? !collapsedSteps.value[index]
}

const isCollapsed = (index, initial = true) => {
  if (!has(collapsedSteps.value, index)) {
    collapsedSteps.value[index] = initial
  }

  return collapsedSteps.value[index]
}
</script>

<template>
  <div class="form-step-group d-flex flex-column gap-3">
    <form-step-group-toggler
      :collapse="collapseAll"
      class="align-self-end"
      @update:collapse="collapseAll = $event"
    />
    <slot v-bind="{ toggle, isCollapsed }" />
  </div>
</template>
