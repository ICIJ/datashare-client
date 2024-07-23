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
      icon="caret-up"
      label="Find the previous occurrence"
      @click="$emit('previous')"
    />
    <document-local-search-nav-item
      :disabled="disabledNext"
      icon="caret-down"
      label="Find the next occurrence"
      @click="$emit('next')"
    />
  </b-button-group>
</template>
