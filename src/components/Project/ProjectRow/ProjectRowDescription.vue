<script setup>
import Hook from '@/components/Hook/Hook'

defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <td class="project-row-description">
    <hook
      name="project-row-description:before"
      :bind="{ project }"
    />
    <slot>{{ project.description }}</slot>
    <hook
      name="project-row-description:after"
      :bind="{ project }"
    />
  </td>
</template>
