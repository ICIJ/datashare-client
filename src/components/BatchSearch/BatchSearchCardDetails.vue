<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { capitalize } from 'lodash'

import DisplayStatus from '@/components/Display/DisplayStatus'
import BatchSearchCardDetailsEntry from '@/components/BatchSearch/BatchSearchCardDetailsEntry'
import DisplayDatetime from '@/components/Display/DisplayDatetime'
import DisplayUser from '@/components/Display/DisplayUser'
import ProjectLink from '@/components/Project/ProjectLink'
import ButtonIcon from '@/components/Button/ButtonIcon'
import humanNumber from '@/utils/humanNumber'

defineOptions({ name: 'BatchSearchCardDetails' })

const props = defineProps({
  uuid: { type: String },
  name: { type: String },
  nbResults: { type: Number },
  nbQueriesWithoutResults: { type: Number },
  nbQueries: { type: Number },
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
const emit = defineEmits(['downloadDocuments', 'downloadQueries', 'downloadQueriesWithoutResults'])

const { t } = useI18n()

const statusItem = computed(() => {
  return { label: t('batchSearchCardDetails.status'), value: capitalize(props.status) }
})

const nbDocumentsItem = computed(() => {
  return {
    icon: 'files',
    label: t('batchSearchCard.nbDocuments'),
    value: t('batchSearchCard.nbDocumentsLabel', humanNumber(props.nbResults))
  }
})

const seeAllDocumentsLabel = t('batchSearchCard.seeAllDocuments')
const downloadDocumentsLabel = t('batchSearchCard.downloadResultsLabel', { n: props.nbResults })
const noDocuments = computed(() => {
  return props.nbResults === 0
})

const indices = computed(() => {
  return props.projects.join(',')
})
const to = { name: 'batch-tasks.view.results', params: { indices, uuid: props.uuid } }

const downloadDocuments = () => {
  emit('downloadDocuments')
}

const downloadQueriesWithoutResultsLabel = t('batchSearchCard.downloadQueriesWithoutResultsLabel')
const downloadQueriesWithoutResults = () => {
  emit('downloadQueriesWithoutResults')
}
const nbQueriesWithoutResultsItem = computed(() => {
  return {
    icon: 'empty',
    label: t('batchSearchCard.nbQueriesWithoutResults'),
    value: t('batchSearchCard.nbQueriesWithoutResultsLabel', humanNumber(props.nbQueriesWithoutResults))
  }
})
const noQueriesWithoutResults = computed(() => {
  return props.nbQueriesWithoutResults === 0
})
const nbQueriesItem = computed(() => {
  return {
    icon: 'list-magnifying-glass',
    label: t('batchSearchCard.nbQueries'),
    value: t('batchSearchCard.nbQueriesLabel', humanNumber(props.nbQueries))
  }
})
const downloadQueriesLabel = t('batchSearchCard.downloadQueriesLabel', { n: props.nbQueries })
const downloadQueries = () => {
  emit('downloadQueries')
}
const noQueries = computed(() => {
  return props.nbQueries === 0
})
const dateItem = computed(() => {
  return { icon: 'calendar-blank', label: t('batchSearchCardDetails.date'), value: props.date }
})
const authorItem = computed(() => {
  return { icon: 'user', label: t('batchSearchCardDetails.author'), value: props.author }
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

const phraseMatchIcon = 'quotes'
const phraseMatchValue = computed(() => {
  return props.phraseMatch ? t('batchSearchCardDetails.phraseMatchOn') : t('batchSearchCardDetails.phraseMatchOff')
})
const phraseMatchItem = computed(() => {
  return {
    icon: phraseMatchIcon,
    label: t('batchSearchCardDetails.phraseMatch'),
    value: phraseMatchValue.value
  }
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
</script>

<template>
  <div class="batch-search-card-details">
    <ul class="batch-search-card-details__list list-unstyled">
      <li>
        <batch-search-card-details-entry :label="statusItem.label">
          <display-status class="display-status" size="sm" :value="status" /> {{ statusItem.value }}
        </batch-search-card-details-entry>
      </li>
      <li>
        <batch-search-card-details-entry
          :label="nbDocumentsItem.label"
          :icon="nbDocumentsItem.icon"
          :value="nbDocumentsItem.value"
        />
      </li>
      <li>
        <button-icon
          icon-left="list"
          icon-right="caret-right"
          variant="action"
          class="batch-search-card-actions__see-all flex-shrink-1"
          :to="to"
          >{{ seeAllDocumentsLabel }}</button-icon
        >
      </li>
      <li>
        <button-icon
          :disabled="noDocuments"
          icon-left="download-simple"
          variant="outline-primary"
          class="batch-search-card-actions__download text-nowrap"
          @click="downloadDocuments"
          >{{ downloadDocumentsLabel }}</button-icon
        >
      </li>
      <li class="my-0">
        <batch-search-card-details-entry v-bind="nbQueriesWithoutResultsItem"
          ><template #end>
            <button-icon
              :disabled="noQueriesWithoutResults"
              icon-left="download-simple"
              variant="link"
              square
              hide-label
              :label="downloadQueriesWithoutResultsLabel"
              @click="downloadQueriesWithoutResults" /></template
        ></batch-search-card-details-entry>
      </li>
    </ul>
    <hr class="my-1" />
    <ul class="batch-search-card-details__list list-unstyled">
      <li class="my-0">
        <batch-search-card-details-entry v-bind="nbQueriesItem"
          ><template #end>
            <button-icon
              :disabled="noQueries"
              icon-left="download-simple"
              variant="link"
              square
              hide-label
              :label="downloadQueriesLabel"
              @click="downloadQueries" /></template
        ></batch-search-card-details-entry>
      </li>
      <li class="mt-2">
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
  </div>
</template>

<style scoped lang="scss">
.batch-search-card-details {
  ul {
    margin: 0;
  }
  &__list {
    & li {
      margin: $spacer-md 0;
    }
  }
}
</style>
