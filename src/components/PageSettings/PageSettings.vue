<template>
  <div class="page-settings">
    <div class="d-flex justify-content-between align-items-center pb-4">
      <page-settings-title :title="title" />
      <page-settings-hide :hide="hide" />
    </div>
    <slot v-bind="{ title, hide, placement, visible }" />
  </div>
</template>

<script setup>
import { toRef, computed } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { onRouteUpdateNotMatch } from '@/composables/onRouteUpdateNotMatch'
import PageSettingsHide from '@/components/PageSettings/PageSettingsHide'
import PageSettingsTitle from '@/components/PageSettings/PageSettingsTitle'

const props = defineProps({
  title: {
    type: String
  },
  visible: {
    type: Boolean
  },
  placement: {
    type: String
  },
  route: {
    type: String,
    default: null
  }
})
const { t } = useI18n()
const emit = defineEmits(['hide'])
const hide = () => emit('hide')
const title = computed(() => {
  return props.title ?? t('pageSettings.title')
})
onRouteUpdateNotMatch(toRef(props, 'route'), hide)
onBeforeRouteLeave(hide)
</script>
