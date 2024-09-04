<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  language: { type: String },
  model: { type: String }
})
const { t } = useI18n()
const content = t('entityPopoverInfo.content')
const propertyHtml = (property) => {
  return `<span class="font-monospace border border-tertiary rounded-1 p-1 cursor-pointer">${property}</span>`
}
const modelLabel = t('entityPopoverInfo.model', { model: propertyHtml(props.model) })
const languageLabel = t('entityPopoverInfo.language', { language: propertyHtml(props.language) })
const sentence = `${modelLabel} ${languageLabel}`
</script>

<template>
  <div class="entity-popover-info">
    <p class="text-secondary-emphasis">
      {{ content }}
    </p>

    <span v-html="sentence" />
  </div>
</template>

<style scoped lang="scss">
.entity-popover-info {
  &__property {
    font-family: $font-family-monospace;
  }
}
</style>
