<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DisplayLanguage from '@/components/Display/DisplayLanguage'

defineProps({
  language: {
    type: String
  },
  extractor: {
    type: String
  }
})

const { t } = useI18n()

const content = computed(() => t('entityPopoverInfo.content'))
</script>

<template>
  <div class="entity-popover-info">
    <p class="text-secondary-emphasis mb-2">
      {{ content }}
    </p>
    <i18n-t
      keypath="entityPopoverInfo.label"
      tag="p"
    >
      <template #extractor>
        <span class="font-monospace border border-tertiary rounded-1 p-1 cursor-pointer">{{ extractor }}</span>
      </template>
      <template #language>
        <display-language
          class="font-monospace border border-tertiary rounded-1 p-1 cursor-pointer"
          :value="language"
        />
      </template>
    </i18n-t>
  </div>
</template>

<style scoped lang="scss">
.entity-popover-info {
  &__property {
    font-family: $font-family-monospace;
  }
}
</style>
