<script setup>
import { computed } from 'vue'
import { isNumber } from 'lodash'
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import DisplayNumber from '@/components/Display/DisplayNumber.vue'

const { project } = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
const hasDocuments = computed(() => isNumber(project.documentsCount) && project.documentsCount > 0)
</script>

<template>
  <div class="project-card-documents-count text-secondary-emphasis d-inline-flex gap-1 align-items-center flex-wrap">
    <slot>
      <phosphor-icon :name="PhFiles" />
      <display-number v-if="hasDocuments" :value="project.documentsCount" />
      <span v-else>{{ t('projectCardDocumentsCount.noDocuments') }}</span>
    </slot>
  </div>
</template>
