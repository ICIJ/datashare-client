<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { getCategoryIcon } from '@/utils/entity'
import EntityOccurrences from '@/components/Entity/EntityOccurrences'

const props = defineProps({
  category: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
})

const { t } = useI18n()

const icon = computed(() => {
  return getCategoryIcon(props.category)
})

const title = computed(() => {
  return t(`entitySection.${props.category.toLowerCase()}.title`)
})
</script>

<template>
  <h3 class="fs-6 fw-medium m-0">
    <phosphor-icon
      :name="icon"
      class="mr-2"
      weight="bold"
    />
    {{ title }}
    <entity-occurrences :occurrences="count" />
  </h3>
</template>
