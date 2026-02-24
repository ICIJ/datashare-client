<script setup>
import DocumentTranslation from '@/components/Document/DocumentTranslation/DocumentTranslation'
import DocumentThreadEntryHeader from './DocumentThreadEntryHeader'

defineOptions({ name: 'DocumentThreadEntry' })

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
  document: {
    type: Object,
    required: true
  },
  q: {
    type: String,
    default: ''
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  }
})

const emit = defineEmits(['toggle'])
</script>

<template>
  <li
    class="document-thread-entry"
    :class="{ 'document-thread-entry--active': active }"
  >
    <document-thread-entry-header
      :email="email"
      :active="active"
      :expanded="expanded"
      :tooltip-delay="tooltipDelay"
      @toggle="emit('toggle')"
    />
    <document-translation
      v-if="expanded"
      :document="active ? document : email"
      :q="q"
      class="mt-0 m-3"
    />
  </li>
</template>

<style lang="scss" scoped>
.document-thread-entry {
  border: 1px solid var(--bs-border-color);

  &:not(:last-of-type) {
    margin-bottom: -1px;
  }

  &:first-of-type {
    border-top-left-radius: var(--bs-border-radius);
    border-top-right-radius: var(--bs-border-radius);
  }

  &:last-of-type {
    border-bottom-left-radius: var(--bs-border-radius);
    border-bottom-right-radius: var(--bs-border-radius);
  }

  &--active {
    position: relative;
    border-color: var(--bs-primary);
  }
}
</style>
