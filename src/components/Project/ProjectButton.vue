<script setup>
import { computed } from 'vue'

import ProjectLabel from './ProjectLabel'

const props = defineProps({
  /**
   * The project to use to generate the thumbnail. Can contain `name`, `label` and `logoUrl` which
   * will be used to generate the thumbnail consistently. If passed as a string, the project will be
   * retreived from the config.
   */
  project: {
    type: [Object, String],
    required: true
  },
  /**
   * Remove the link (make it not clickable)
   */
  noLink: {
    type: Boolean
  },
  /**
   * Disable the button
   */
  disabled: {
    type: Boolean
  },
  /**
   * Hide the project thumbail.
   */
  hideThumbnail: {
    type: Boolean
  }
})

const to = computed(() => {
  const name = props.project.name ?? props.project
  return props.noLink ? undefined : { name: 'project.view', params: { name } }
})
</script>

<template>
  <b-button :to="to" class="project-button" variant="outline-lighter" :disabled="disabled">
    <project-label :project="project" :hide-thumbnail="hideThumbnail">
      <slot />
    </project-label>
  </b-button>
</template>

<style lang="scss">
.project-button {
  --bs-btn-color: var(--bs-body-color);
  --bs-btn-bg: var(--bs-body-bg);
  --bs-btn-hover-bg: var(--bs-btn-bg);
  --bs-btn-hover-color: var(--bs-btn-color);
  --bs-btn-hover-border-color: var(--bs-secondary);
  --bs-btn-disabled-bg: var(--bs-btn-bg);
  --bs-btn-disabled-color: var(--bs-btn-color);
  --bs-btn-disabled-border-color: var(--bs-btn-border-color);

  display: inline-flex;
  justify-content: center;
  white-space: nowrap;
  flex-wrap: nowrap;

  &.btn.disabled,
  fieldset:disabled &.btn,
  &.btn {
    opacity: 1;
  }

  &[href] {
    cursor: pointer;
  }
}
</style>
