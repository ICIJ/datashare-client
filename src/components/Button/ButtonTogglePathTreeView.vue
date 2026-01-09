<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhRows from '~icons/ph/rows'
import IPhTreeView from '~icons/ph/tree-view'

import ButtonSubtleAction from '@/components/Button/ButtonSubtleAction'

const active = defineModel('active', { type: Boolean })

const { t } = useI18n()

const toggle = () => {
  active.value = !active.value
}

const title = computed(() => {
  return active.value ? t('buttonTogglePathTreeView.list') : t('buttonTogglePathTreeView.tree')
})

const icon = computed(() => {
  return active.value ? IPhRows : IPhTreeView
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
