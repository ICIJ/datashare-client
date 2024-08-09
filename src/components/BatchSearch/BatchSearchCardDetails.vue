<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { capitalize } from 'lodash'

import DisplayStatus from '@/components/Display/DisplayStatus'
import BatchSearchCardDetailsEntry from '@/components/BatchSearch/BatchSearchCardDetailsEntry'
import DisplayDatetime from '@/components/Display/DisplayDatetime'
import DisplayUser from '@/components/Display/DisplayUser'
import ProjectLink from '@/components/Project/ProjectLink'
import LineActionButton from '@/components/Button/LineActionButton'
defineOptions({ name: 'BatchSearchCardDetails' })
const props = defineProps({
  name: { type: String },
  status: { type: String },
  date: { type: Date },
  author: { type: String },
  visibility: { type: Boolean },
  phraseMatch: { type: Boolean },
  proximity: { type: Number },
  fuzziness: { type: Number },
  projects: { type: Array },
  description: { type: String }
})

const { t } = useI18n()

const statusItem = computed(() => {
  return { label: t('batchSearchCardDetails.status'), value: capitalize(props.status) }
})
const dateItem = computed(() => {
  return { icon: 'calendar-blank', label: t('batchSearchCardDetails.date'), value: props.date }
})
const authorItem = computed(() => {
  return { icon: 'user-gear', label: t('batchSearchCardDetails.author'), value: props.author }
})
const visibilityPrivate = 'eye-slash'
const visibilityPublic = 'eye'
const PRIVATE = false
const visibilityIcon = computed(() => {
  return props.visibility === PRIVATE ? visibilityPrivate : visibilityPublic
})
const visibilityValue = computed(() => {
  return props.visibility === PRIVATE
    ? t('batchSearchCardDetails.visibilityPrivate')
    : t('batchSearchCardDetails.visibilityShared')
})
const visibilityItem = computed(() => {
  return { icon: visibilityIcon.value, label: t('batchSearchCardDetails.visibility'), value: visibilityValue.value }
})

const phraseMatchOff = 'toggle-left'
const phraseMatchOn = 'toggle-right'
const phraseMatchIcon = computed(() => {
  return props.phraseMatch ? phraseMatchOn : phraseMatchOff
})
const phraseMatchValue = computed(() => {
  return props.phraseMatch ? t('batchSearchCardDetails.phraseMatchOn') : t('batchSearchCardDetails.phraseMatchOff')
})
const phraseMatchItem = computed(() => {
  return { icon: phraseMatchIcon.value, label: t('batchSearchCardDetails.phraseMatch'), value: phraseMatchValue.value }
})

const fuzzinessValue = computed(() => {
  return t('batchSearchCardDetails.fuzzinessValue', { n: props.fuzziness })
})
const fuzzinnessItem = computed(() => {
  return {
    icon: 'arrows-out-line-horizontal',
    label: t('batchSearchCardDetails.fuzziness'),
    value: fuzzinessValue.value
  }
})
const proximityValue = computed(() => {
  return t('batchSearchCardDetails.proximityValue', { n: props.proximity })
})
const proximityItem = computed(() => {
  return {
    icon: 'arrows-out-line-horizontal',
    label: t('batchSearchCardDetails.proximity'),
    value: proximityValue.value
  }
})
const variationItem = computed(() => {
  return props.phraseMatch ? proximityItem.value : fuzzinnessItem.value
})

const projectsItem = computed(() => {
  return { icon: 'circles-three-plus', label: t('batchSearchCardDetails.projects'), value: props.projects }
})

const descriptionLabel = t('batchSearchCardDetails.description')
const descriptionEdit = t('batchSearchCardDetails.descriptionEdit')
</script>

<template>
  <div class="batch-search-card-details">
    <ul class="batch-search-card-details__list list-unstyled">
      <li>
        <batch-search-card-details-entry :label="statusItem.label">
          <display-status class="display-status-sm" :value="status" /> {{ statusItem.value }}
        </batch-search-card-details-entry>
      </li>
      <li>
        <batch-search-card-details-entry :label="dateItem.label" :icon="dateItem.icon">
          <display-datetime :value="dateItem.value" />
        </batch-search-card-details-entry>
      </li>
      <li>
        <batch-search-card-details-entry :label="authorItem.label" :icon="authorItem.icon">
          <display-user :value="authorItem.value" />
        </batch-search-card-details-entry>
      </li>
      <li>
        <batch-search-card-details-entry v-bind="visibilityItem" />
      </li>
      <li>
        <batch-search-card-details-entry v-bind="phraseMatchItem" />
      </li>
      <li>
        <batch-search-card-details-entry v-bind="variationItem" />
      </li>
      <li>
        <batch-search-card-details-entry :label="projectsItem.label" :icon="projectsItem.icon">
          <project-link v-for="(project, index) in projectsItem.value" :key="index" :project="project" />
        </batch-search-card-details-entry>
      </li>
    </ul>
    <div
      class="batch-search-card-details__description d-flex justify-content-between text-tertiary-emphasis align-items-center mb-2"
    >
      <span class="text-secondary-emphasis">{{ descriptionLabel }}</span
      ><line-action-button icon="pencil-simple">{{ descriptionEdit }}</line-action-button>
    </div>
    <p>
      {{ description }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.batch-search-card-details {
  &__list {
    & li {
      margin: $spacer-xs 0;
    }
  }
}
</style>
