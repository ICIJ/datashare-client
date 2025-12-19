<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import { useBreakpoints } from '@/composables/useBreakpoints'
import { breakpointSizeValidator, SIZE } from '@/enums/sizes'

const props = defineProps({
  saved: {
    type: Boolean
  },
  loading: {
    type: Boolean
  },
  compactBreakpoint: {
    type: String,
    default: SIZE.MD,
    validator: breakpointSizeValidator
  }
})

const iconLeft = computed(() => {
  return props.saved ? PhCheck : PhFloppyDiskBack
})

const { breakpointDown } = useBreakpoints()

const compact = computed(() => {
  return breakpointDown.value[props.compactBreakpoint]
})

const { t } = useI18n()

const label = computed(() => {
  if (props.loading) {
    return t('buttonSaveSearch.labelSaving')
  }

  if (props.saved) {
    return t('buttonSaveSearch.labelSaved')
  }

  return t('buttonSaveSearch.label')
})
</script>

<template>
  <button-icon
    class="button-save-search"
    variant="outline-dark"
    :label="label"
    :loading="loading"
    :icon-left="iconLeft"
    :hide-label="compact"
    :square="compact"
  />
</template>
