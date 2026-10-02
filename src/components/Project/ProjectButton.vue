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
   * Hide the project thumbnail.
   */
  hideThumbnail: {
    type: Boolean
  },
  /**
   * Remove the project caption on the thumbnail.
   */
  noCaption: {
    type: Boolean
  },
  /**
   * Route to link to instead of the project's insights page.
   */
  to: {
    type: [Object, String],
    default: null
  }
})

const linkTo = computed(() => {
  if (props.noLink) return undefined
  const name = props.project.name ?? props.project
  return props.to ?? { name: 'project.view.overview.insights', params: { name } }
})
</script>

<template>
  <b-button
    :to="linkTo"
    class="project-button"
    :class="{ 'project-button--no-link': noLink }"
    variant="outline-secondary"
    :disabled="disabled"
  >
    <project-label
      :project="project"
      :hide-thumbnail="hideThumbnail"
      :no-caption="noCaption"
    >
      <template
        v-if="$slots.thumbnail"
        #thumbnail
      >
        <slot name="thumbnail" />
      </template>
      <slot />
    </project-label>
  </b-button>
</template>

<style lang="scss">
.project-button {
  --bs-btn-color: var(--bs-body-color);
  --bs-btn-border-color: var(--bs-light);
  --bs-btn-bg: var(--bs-body-bg);
  --bs-btn-hover-bg: var(--bs-btn-bg);
  --bs-btn-hover-color: var(--bs-btn-color);
  --bs-btn-hover-border-color: var(--bs-primary);
  --bs-btn-disabled-bg: var(--bs-btn-bg);
  --bs-btn-disabled-color: var(--bs-btn-color);
  --bs-btn-disabled-border-color: var(--bs-btn-border-color);
  --bs-btn-active-color: var(--bs-btn-color);
  --bs-btn-active-bg: rgba(var(--bs-body-color-rgb), 0.2);
  --bs-btn-active-border-color: var(--bs-primary);

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

  // Doubled up on .btn to outrank reboot's `[type="button"]:not(:disabled) { cursor: pointer }`.
  &.btn.project-button--no-link {
    --bs-btn-hover-border-color: var(--bs-btn-border-color);
    --bs-btn-active-border-color: var(--bs-btn-border-color);
    --bs-btn-active-bg: var(--bs-btn-bg);

    cursor: default;
  }
}
</style>
