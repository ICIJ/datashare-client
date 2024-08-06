<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'

const props = defineProps({
  category: {
    type: String,
    required: true
  }
})

const { t } = useI18n()

const label = computed(() => {
  const category = t(`namedEntitySectionMore.category.${props.category}`)
  return t(`namedEntitySectionMore.label`, { category })
})
</script>

<template>
  <button-icon class="named-entity-section-actions-entry-more" variant="outline-primary" icon-right="caret-right" icon-right-variant="secondary">
    {{ label }}
  </button-icon>
</template>
