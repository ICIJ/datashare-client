<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import IPhSidebarSimple from '~icons/ph/sidebar-simple'
import IPhSidebarSimpleFill from '~icons/ph/sidebar-simple-fill'

const active = defineModel('active', { type: Boolean })

const { t } = useI18n()

const toggle = () => {
  active.value = !active.value
}

const title = computed(() => {
  return active.value ? t('buttonToggleSidebar.expand') : t('buttonToggleSidebar.reduce')
})

const icon = computed(() => {
  return active.value ? IPhSidebarSimple : IPhSidebarSimpleFill
})
</script>

<template>
  <button-icon
    tooltip-placement="right"
    :icon-left="icon"
    icon-left-size="1.2rem"
    square
    hide-label
    variant="primary"
    class="button-toggler-sidebar text-white flex-shrink-0"
    :label="title"
    @click="toggle"
  >
    {{ title }}
  </button-icon>
</template>
