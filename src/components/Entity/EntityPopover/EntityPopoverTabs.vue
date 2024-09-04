<template>
  <b-tabs
    class="entity-popover-tabs"
    active-nav-item-class="border-bottom border-primary "
    nav-item-class="text-action-emphasis d-inline-flex align-items-center gap-2 bg-action-subtle"
    active-tab-class="my-4"
  >
    <b-tab>
      <template #title
        ><phosphor-icon name="list-magnifying-glass" />{{ mentionsLabel }}
        <b-badge pill variant="tertiary">{{ props.nbMentions }}</b-badge>
      </template>
      <entity-popover-mentions v-bind="mentionsProps" />
    </b-tab>
    <b-tab>
      <template #title><phosphor-icon name="info" /> {{ infoLabel }}</template>
      <entity-popover-info v-bind="infoProps" />
    </b-tab>
  </b-tabs>
</template>

<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import EntityPopoverMentions from './EntityPopoverMentions'
import EntityPopoverInfo from './EntityPopoverInfo'

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
