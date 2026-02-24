<script setup>
import IPhCaretDown from '~icons/ph/caret-down'
import IPhCaretUp from '~icons/ph/caret-up'

defineOptions({ name: 'DocumentThreadEntryHeaderToggler' })

defineProps({
  expanded: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <component
    :is="expanded ? IPhCaretUp : IPhCaretDown"
    class="document-thread-entry-header-toggler flex-shrink-0"
  />
</template>

<style lang="scss" scoped>
.document-thread-entry-header-toggler {
  color: var(--bs-secondary-color);
}
</style>
