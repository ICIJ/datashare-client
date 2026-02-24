<script setup>
import DocumentThreadEntryHeaderToggler from './DocumentThreadEntryHeaderToggler'
import DocumentThreadEntryHeaderFrom from './DocumentThreadEntryHeaderFrom'
import DocumentThreadEntryHeaderTo from './DocumentThreadEntryHeaderTo'
import DocumentThreadEntryHeaderCreationDate from './DocumentThreadEntryHeaderCreationDate'
import DocumentThreadEntryExcerpt from './DocumentThreadEntryExcerpt'

defineOptions({ name: 'DocumentThreadEntryHeader' })

const props = defineProps({
  email: {
    type: Object,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  },
  expanded: {
    type: Boolean,
    default: false
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  }
})

const emit = defineEmits(['toggle'])
</script>

<template>
  <div
    class="document-thread-entry-header p-3 d-block"
    role="button"
    @click="emit('toggle')"
  >
    <div class="d-flex text-nowrap gap-2 align-items-center">
      <document-thread-entry-header-toggler
        v-if="!active"
        :expanded="expanded"
      />
      <document-thread-entry-header-from :email="email" />
      <document-thread-entry-header-creation-date
        :email="email"
        :tooltip-delay="tooltipDelay"
      />
    </div>
    <div class="d-flex gap-3">
      <document-thread-entry-header-to
        v-if="expanded && email.messageTo"
        :email="email"
      />
      <document-thread-entry-excerpt
        v-else-if="!expanded"
        :email="email"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.document-thread-entry-header {
  color: var(--bs-secondary-color);
  cursor: pointer;
}
</style>
