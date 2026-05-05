<template>
  <p class="search-advanced-modal__example">
    <template
      v-for="(item, index) in labelled"
      :key="index"
    >
      <span
        v-if="index > 0"
        class="search-advanced-modal__example__break"
      />
      <span class="search-advanced-modal__example__prefix">
        {{ item.prefix }}
      </span>
      <span class="search-advanced-modal__example__value">
        {{ item.value }}
      </span>
    </template>
  </p>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  examples: {
    type: Array,
    required: true
  }
})

const { t } = useI18n()

// First entry is prefixed with "e.g.", the rest with "or" — encoded as
// data here so the template stays a flat list with no inline conditionals.
const labelled = computed(() =>
  props.examples.map((value, index) => ({
    value,
    prefix: index === 0 ? t('searchAdvancedModal.eg') : t('searchAdvancedModal.or')
  }))
)
</script>
