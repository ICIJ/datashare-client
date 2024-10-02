<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import TextTruncate from '@/components/Text/TextTruncate'

defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String }
})

const { t } = useI18n()

const homepageLabel = computed(() => t('addonCard.homepage'))
</script>

<template>
  <div class="addon-card__details d-flex flex-column gap-2 flex-grow-1">
    <div class="d-inline-flex align-items-center gap-2">
      <a class="fw-bold h4 text-action-emphasis">{{ title }}</a>
    </div>
    <p>
      <slot><text-truncate :text="description" :truncate-length="250" /></slot>
    </p>
    <span v-if="url" class="text-secondary-emphasis flex-grow-0 gap-2">
      {{ homepageLabel }} <a :href="url">{{ url }}</a>
    </span>
  </div>
</template>
