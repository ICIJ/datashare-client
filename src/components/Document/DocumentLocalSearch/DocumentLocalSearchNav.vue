<script setup>
import DocumentLocalSearchNavItem from './DocumentLocalSearchNavItem'

defineProps({
  disabledPrevious: {
    type: Boolean
  },
  disabledNext: {
    type: Boolean
  }
})
</script>

<template>
  <b-button-group>
    <document-local-search-nav-item
      :disabled="disabledPrevious"
      :icon="PhCaretUp"
      :label="$t('documentLocalSearchNav.previous')"
      @click="$emit('previous')"
    />
    <document-local-search-nav-item
      :disabled="disabledNext"
      :icon="PhCaretDown"
      :label="$t('documentLocalSearchNav.next')"
      @click="$emit('next')"
    />
  </b-button-group>
</template>
