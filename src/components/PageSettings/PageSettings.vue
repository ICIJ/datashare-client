<script setup>
import { toRef, computed } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { onRouteUpdateNotMatch } from '@/composables/onRouteUpdateNotMatch'
import PageSettingsHide from '@/components/PageSettings/PageSettingsHide'
import PageSettingsTitle from '@/components/PageSettings/PageSettingsTitle'
import ButtonReset from '@/components/Button/ButtonReset'

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
const emit = defineEmits(['hide', 'reset'])
const hide = () => emit('hide')
const onReset = () => emit('reset')
const title = computed(() => {
  return props.title ?? t('pageSettings.title')
})

onRouteUpdateNotMatch(toRef(props, 'route'), hide)
onBeforeRouteLeave(hide)
</script>

<template>
  <div class="page-settings d-flex flex-auto flex-column h-100">
    <div class="d-flex justify-content-between align-items-center pb-4">
      <page-settings-title :title="title" />
      <page-settings-hide :hide="hide" />
    </div>
    <div class="flex-grow-1">
      <slot v-bind="{ title, hide, placement, visible }" />
    </div>
    <div class="page-settings__footer py-3 position-sticky bottom-0 bg-body">
      <button-reset
        label-key="pageSettings.reset"
        @click="onReset"
      />
    </div>
  </div>
</template>
