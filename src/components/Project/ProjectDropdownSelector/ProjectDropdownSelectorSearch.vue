<script setup>
import { useI18n } from 'vue-i18n'

import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'

defineProps({
  query: {
    type: String,
    default: ''
  },
  hasMatches: {
    type: Boolean,
    default: true
  },
  autofocus: {
    type: Boolean
  }
})
const { t } = useI18n()
const emit = defineEmits(['update:model-value', 'blur', 'up', 'down', 'enter'])
</script>

<template>
  <li class="project-dropdown-selector-search">
    <div class="b-dropdown-form pt-1 mb-3">
      <form-control-search
        ref="input"
        :model-value="query"
        :autofocus="autofocus"
        shadow
        :placeholder="t('projectDropdownSelectorSearch.placeholder')"
        @update:model-value="emit('update:model-value', $event)"
        @blur="emit('blur', $event)"
        @up="emit('up', $event)"
        @down="emit('down', $event)"
        @enter="emit('enter', $event)"
      />
    </div>
    <div v-if="!hasMatches" class="text-center small text-muted pb-2">
      {{ t('projectDropdownSelectorSearch.noMatches') }}
    </div>
  </li>
</template>
