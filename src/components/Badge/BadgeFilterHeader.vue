<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import filters from '@/store/filters'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})
const { t } = useI18n()

const filter = computed(() => {
  return filters.find((filter) => filter.options.name === props.name)
})

const icon = computed(() => {
  return filter.value.options.icon
})
</script>

<template>
  <span class="badge-filter-header text-secondary d-flex gap-1 align-items-center">
    <phosphor-icon size="1em" :name="icon" />
    {{ t(`filter.${name}`) }}
  </span>
</template>
