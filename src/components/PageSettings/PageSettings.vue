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
import { noop, ary } from 'lodash'
import { onBeforeRouteLeave } from 'vue-router'

import { onRouteUpdateNotMatch } from '@/composables/url-params'
import PageSettingsHide from '@/components/PageSettings/PageSettingsHide'
import PageSettingsTitle from '@/components/PageSettings/PageSettingsTitle'

const { hide, route } = defineProps({
  title: {
    type: String,
    required: true
  },
  hide: {
    type: Function,
    default: noop
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

onRouteUpdateNotMatch(route, ary(hide, 0))
onBeforeRouteLeave(ary(hide, 0))
</script>
