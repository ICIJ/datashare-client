<template>
  <span :class="{ 'fw-bold': fieldChanged }" class="d-flex align-items-top">
    <span class="flex-grow-1 py-1" :title="name">
      {{ formatSettingName(name) }}
    </span>
    <span>
      <button-icon
        v-if="fieldChanged"
        :aria-label="t('settings.generalLabel.restore')"
        icon-left="arrow-counter-clockwise"
        variant="link"
        size="sm"
        hide-label
        @click="restore(name)"
      />
    </span>
  </span>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'
defineProps({
  fieldChanged: {
    type: Boolean,
    required: true
  },
  name: {
    type: String,
    required: true
  }
})

const emits = defineEmits(['restore'])

const { t } = useI18n()

const KNOWN_ACRONYMS = ['URI', 'URL', 'NLP', 'OCR', 'TCP', 'API', 'TTL', 'OAuth', 'CORS']

function capitalizeKnownAcronyms(str) {
  return str
    .split(' ')
    .map((word) => {
      const knownAcronyms = KNOWN_ACRONYMS.map((a) => a.toUpperCase())
      const index = knownAcronyms.indexOf(word.toUpperCase())
      if (index > -1) {
        return KNOWN_ACRONYMS[index]
      }
      return word
    })
    .join(' ')
}

function sentenceCase(str) {
  const result = str.replace(/([A-Z])/g, ' $1')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

function formatSettingName(name) {
  return capitalizeKnownAcronyms(sentenceCase(name))
}
function restore(field) {
  emits('restore', field)
}
</script>
