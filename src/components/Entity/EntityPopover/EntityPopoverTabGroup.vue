<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { pick } from 'lodash'

import EntityPopoverMentions from './EntityPopoverMentions'
import EntityPopoverInfo from './EntityPopoverInfo'

import TabGroup from '@/components/TabGroup/TabGroup'
import TabGroupEntry from '@/components/TabGroup/TabGroupEntry'

const props = defineProps({
  mention: {
    type: String
  },
  excerpt: {
    type: String
  },
  noExcerpt: {
    type: Boolean
  },
  projects: {
    type: Array,
    default: () => []
  },
  offsets: {
    type: Number
  },
  language: {
    type: String
  },
  extractor: {
    type: String
  }
})

const offset = defineModel('offset', { type: Number, default: 0 })
const tabIndex = ref(props.noExcerpt ? 1 : 0)

const mentionsBinding = computed(() => {
  return pick(props, ['mention', 'excerpt', 'noExcerpt', 'projects', 'offsets', 'language', 'extractor'])
})

const infoBinding = computed(() => {
  return pick(props, ['language', 'extractor'])
})

const { t } = useI18n()
const infoLabel = computed(() => t('entityPopoverTabGroup.info'))
const mentionsLabel = computed(() => t('entityPopoverTabGroup.mentions'))
</script>

<template>
  <tab-group v-model="tabIndex" class="entity-popover-tab-group">
    <tab-group-entry :icon="PhListMagnifyingGlass" :count="props.offsets" :title="mentionsLabel">
      <entity-popover-mentions v-bind="mentionsBinding" v-model:offset="offset" />
    </tab-group-entry>
    <tab-group-entry :icon="PhInfo" :title="infoLabel">
      <entity-popover-info v-bind="infoBinding" />
    </tab-group-entry>
  </tab-group>
</template>

<style scoped lang="scss">
.entity-popover-tab-group {
  width: 310px;
}
</style>
