<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import DisplayDatetimeShort from '@/components/Display/DisplayDatetimeShort'

defineProps({
  project: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
</script>

<template>
  <div
    v-if="project.updateDate"
    class="project-card-update-date text-secondary-emphasis d-inline-flex gap-1 align-items-center flex-wrap"
  >
    <slot>
      <phosphor-icon :name="PhCalendarBlank" />
      {{ t('projectCardUpdateDate.label') }}
      <display-datetime-short :value="project.updateDate" />
    </slot>
  </div>
</template>
