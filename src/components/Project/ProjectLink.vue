<template>
  <component :is="is" :to="to" class="project-link">
    <slot>
      <project-label :project="project" :hide-thumbnail="hideThumbnail" />
    </slot>
  </component>
</template>

<script setup>
import { computed } from 'vue'

import ProjectLabel from './ProjectLabel'

const props = defineProps({
  project: {
    type: [Object, String],
    required: true
  },
  hideThumbnail: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const is = computed(() => {
  return props.disabled ? 'span' : 'router-link'
})

const to = computed(() => {
  const name = props.project.name ?? props.project
  return { name: 'project.view.overview.insights', params: { name } }
})
</script>

<style lang="scss" scoped>
.project-link {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  vertical-align: top;
}
</style>
