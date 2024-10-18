<script setup>
defineProps({
  noToggler: {
    type: Boolean,
    default: false
  },
  noSearch: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
</script>

<template>
  <div class="filters-panel">
    <filters-panel-toggler v-if="!noToggler" @close="emit('close')" />
    <filters-panel-search v-if="!noSearch" />
    <slot />
  </div>
</template>

<style scoped lang="scss">
.filters-panel {
  padding: $spacer;
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: $spacer-xl;
  background: var(--bs-tertiary-bg-subtle);
  max-width: 320px;
  width: 100%;
  min-height: 100vh;
}
</style>
