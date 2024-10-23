<script setup>
import { computed, ref } from 'vue'

import DocumentCard from '@/components/Document/DocumentCard/DocumentCard'
import SeparatorLine from '@/components/SeparatorLine/SeparatorLine'

const props = defineProps({
  entries: {
    type: Array
  },
  minWidth: {
    type: Number,
    default: 400
  },
  selectMode: {
    type: Boolean,
    default: false
  },
  properties: {
    type: Array,
    default: () => ['title', 'thumbnail']
  }
})

const separatorLineLeft = ref(450)

const separatorLineStyle = computed(() => {
  return {
    left: `${separatorLineLeft.value}px`
  }
})

const listStyle = computed(() => {
  return {
    maxWidth: `${separatorLineLeft.value}px`,
    flex: `${separatorLineLeft.value}px 0 0`
  }
})

const reachedMinWidth = computed(() => separatorLineLeft.value <= props.minWidth)
</script>

<template>
  <div class="document-entries-list">
    <div class="document-entries-list__start" :style="listStyle">
      <div class="document-entries-list__start__header">
        <slot name="header" />
      </div>
      <div class="document-entries-list__start__list">
        <document-card
          v-for="entry in entries"
          :key="entry.id"
          :document="entry"
          :select-mode="selectMode"
          :properties="properties"
        />
      </div>
    </div>
    <separator-line
      :style="separatorLineStyle"
      :reduce-disabled="reachedMinWidth"
      :min="minWidth"
      @drag="separatorLineLeft = $event"
      @reduce="separatorLineLeft = minWidth"
      @expand="separatorLineLeft = $event"
    />
    <div class="document-entries-list__end">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.document-entries-list {
  position: relative;
  display: flex;

  &__separator-line {
    transform: translateX(-50%);
  }

  &__start {
    margin-right: $spacer;
    min-height: 50vh;
    max-height: 100vh;
    display: flex;
    flex-direction: column;

    &__header {
      background: var(--bs-body-bg);
      position: sticky;
      top: 0;
      z-index: 10;
      min-width: 0;
      max-width: 100%;
      width: 100%;
    }

    &__list {
      overflow: auto;
      position: relative;
      z-index: 0;
    }
  }

  &__end {
    width: 100%;
    padding-left: $spacer;
  }
}
</style>
