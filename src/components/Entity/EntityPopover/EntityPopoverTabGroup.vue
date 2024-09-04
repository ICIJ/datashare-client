<template>
  <tab-group class="entity-popover-tab-group">
    <tab-group-entry icon="list-magnifying-glass" :count="props.nbMentions" :title="mentionsLabel">
      <entity-popover-mentions v-bind="mentionsProps" />
    </tab-group-entry>
    <tab-group-entry icon="info" :title="infoLabel">
      <entity-popover-info v-bind="infoProps" />
    </tab-group-entry>
  </tab-group>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import EntityPopoverMentions from './EntityPopoverMentions'
import EntityPopoverInfo from './EntityPopoverInfo'
import TabGroup from '@/components/TabGroup/TabGroup'
import TabGroupEntry from '@/components/TabGroup/TabGroupEntry'
const props = defineProps({
  mention: { type: String },
  excerpt: { type: String },
  projects: { type: Array, default: () => [] },
  nbMentions: { type: Number },
  language: { type: String },
  model: { type: String }
})

const mentionsProps = computed(() => {
  return {
    mention: props.mention,
    excerpt: props.excerpt,
    projects: props.projects,
    nbMentions: props.nbMentions
  }
})
const infoProps = computed(() => {
  return {
    language: props.language,
    model: props.model
  }
})
const { t } = useI18n()
const infoLabel = t('entityPopoverTabGroup.info')
const mentionsLabel = t('entityPopoverTabGroup.mentions')
</script>
