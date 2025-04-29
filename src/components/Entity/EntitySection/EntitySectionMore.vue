<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

defineProps({
  category: {
    type: String,
    required: true
  }
})
</script>

<template>
  <button-icon
    class="entity-section-actions-entry-more"
    variant="outline-primary"
    :icon-right="PhCaretRight"
    icon-right-variant="secondary"
  >
    <i18n-t keypath="entitySectionMore.label">
      <template #category>
        {{ $t(`entitySectionMore.category.${category.toLowerCase()}`) }}
      </template>
    </i18n-t>
  </button-icon>
</template>
