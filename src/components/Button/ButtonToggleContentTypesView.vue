<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhListDashes from '~icons/ph/list-dashes'
import IPhRows from '~icons/ph/rows'

import ButtonSubtleAction from '@/components/Button/ButtonSubtleAction'

const grouped = defineModel('grouped', { type: Boolean })

const { t } = useI18n()

const toggle = () => {
  grouped.value = !grouped.value
}

const title = computed(() => {
  return grouped.value ? t('buttonToggleContentTypesView.flat') : t('buttonToggleContentTypesView.grouped')
})

const icon = computed(() => {
  return grouped.value ? IPhListDashes : IPhRows
})
</script>

<template>
  <button-subtle-action
    :icon-left="icon"
    :label="title"
    @click="toggle"
  >
    {{ title }}
  </button-subtle-action>
</template>
