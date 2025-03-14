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
import { toRef } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import { onRouteUpdateNotMatch } from '@/composables/url-params'
import PageSettingsHide from '@/components/PageSettings/PageSettingsHide'
import PageSettingsTitle from '@/components/PageSettings/PageSettingsTitle'

const props = defineProps({
  title: {
    type: String,
    required: true
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

const emit = defineEmits(['hide'])
const hide = () => emit('hide')

onRouteUpdateNotMatch(toRef(props, 'route'), hide)
onBeforeRouteLeave(hide)
</script>
