<script setup>
import { useI18n } from 'vue-i18n'

import TextTruncate from '@/components/Text/TextTruncate'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true }
})
const { t } = useI18n()

const homepageLabel = t('addonCard.homepage')
</script>

<template>
  <div class="addon-card__details d-flex flex-column gap-2">
    <div class="d-inline-flex align-items-center gap-2">
      <a class="fw-bold h4 text-action-emphasis">{{ title }}</a>
    </div>
    <p>
      <slot><text-truncate :text="description" truncate-length="250" /></slot>
    </p>
    <span class="text-secondary-emphasis flex-grow-0 gap-2">
      {{ homepageLabel }} <a :href="url">{{ url }}</a>
    </span>
  </div>
</template>
