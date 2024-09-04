<template>
  <tabs class="entity-popover-tabs">
    <tabs-entry icon="list-magnifying-glass" :count="props.nbMentions" :title="mentionsLabel">
      <entity-popover-mentions v-bind="mentionsProps" />
    </tabs-entry>
    <tabs-entry icon="info" :title="infoLabel">
      <entity-popover-info v-bind="infoProps" />
    </tabs-entry>
  </tabs>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import EntityPopoverMentions from './EntityPopoverMentions'
import EntityPopoverInfo from './EntityPopoverInfo'
import Tabs from '@/components/NavigationTabs/Tabs'
import TabsEntry from '@/components/NavigationTabs/TabsEntry'
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
const infoLabel = t('entityPopoverTabs.info')
const mentionsLabel = t('entityPopoverTabs.mentions')
</script>
