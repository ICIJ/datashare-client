<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DisplayStatus from './DisplayStatus'

const { t } = useI18n()

const props = defineProps({
  value: {
    type: Boolean
  }
})

const icon = computed(() => {
  return props.value ? 'eye' : 'eye-slash'
})

const title = computed(() => {
  return t(props.value ? 'displayVisibility.public' : 'displayVisibility.private')
})

const classList = computed(() => {
  return {
    'display-visibility--public': props.value,
    'display-visibility--private': !props.value
  }
})
</script>

<template>
  <display-status
    class="display-visibility"
    :class="classList"
    :icon="icon"
    :title="title"
  />
</template>

<style lang="scss" scoped>
.display-visibility {
  --display-status-bg: transparent;
  --display-status-color: var(--bs-secondary-text-emphasis);

  &--public {
    --display-status-color: var(--bs-body-color);
  }
}
</style>
