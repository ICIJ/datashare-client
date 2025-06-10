<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { stringifyQuery, parseQuery } from 'vue-router'
import { omit } from 'lodash'

import BatchSearchCardDetailsEntry from '@/components/BatchSearch/BatchSeachCard/BatchSearchCardDetailsEntry'
import DisplayDatetime from '@/components/Display/DisplayDatetime'
import DisplayUser from '@/components/Display/DisplayUser'
import ProjectButton from '@/components/Project/ProjectButton'
import ButtonIcon from '@/components/Button/ButtonIcon'
import SearchBreadcrumbUri from '@/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri'
import humanNumber from '@/utils/humanNumber'
import TaskStatus from '@/views/Task/TaskStatus.vue'
import { useBatchSearchErrorModal } from '@/composables/useBatchSearchErrorModal.js'
import { useSearchBreadcrumb } from '@/composables/useSearchBreadcrumb'

defineOptions({ name: 'BatchSearchCardDetails' })

const props = defineProps({
  uuid: { type: String },
  name: { type: String },
  nbResults: { type: Number },
  nbQueriesWithoutResults: { type: Number },
  nbQueries: { type: Number },
  state: { type: String },
  date: { type: [Date, String] },
  author: { type: String },
  visibility: { type: Boolean },
  phraseMatch: { type: Boolean },
  proximity: { type: Number },
  fuzziness: { type: Number },
  projects: { type: Array },
  description: { type: String },
  uri: { type: String },
  errorMessage: { type: String },
  errorQuery: { type: String }
})

const { t } = useI18n()

const toAllDocuments = computed(() => {
  const indices = props.projects.join(',')

  return {
    name: 'task.batch-search-results.list',
    params: { indices, uuid: props.uuid }
  }
})

const downloadDocumentsHref = computed(() => `/api/batch/search/result/csv/${props.uuid}`)
const downloadQueriesWithoutResultsHref = computed(
  () => `/api/batch/search/${props.uuid}/queries?format=csv&maxResults=0`
)
const downloadQueriesHref = computed(() => `/api/batch/search/${props.uuid}/queries?format=csv`)

const noDocuments = computed(() => props.nbResults === 0)
const noQueries = computed(() => props.nbQueries === 0)
const noQueriesWithoutResults = computed(() => props.nbQueriesWithoutResults === 0)

const noResultsQueries = computed(() => {
  const n = humanNumber(props.nbQueriesWithoutResults)
  return t('batchSearchCard.noResultsQueries', { n }, props.nbQueriesWithoutResults)
})
const noResultsQueriesDownload = computed(() => t('batchSearchCard.noResultsQueriesDownload'))
const noResultsQueriesLabel = computed(() => {
  return isNaN(props.nbQueriesWithoutResults) || props.nbQueriesWithoutResults < 0
    ? noResultsQueriesDownload.value
    : noResultsQueries.value
})

const visibilityIcon = computed(() => (props.visibility ? PhEye : PhEyeSlash))
const visibilityPrivate = computed(() => t('batchSearchCardDetails.visibilityPrivate'))
const visibilityShared = computed(() => t('batchSearchCardDetails.visibilityShared'))
const visibilityValue = computed(() => (props.visibility ? visibilityShared.value : visibilityPrivate.value))

const phraseMatchOn = computed(() => t('batchSearchCardDetails.phraseMatchOn'))
const phraseMatchOff = computed(() => t('batchSearchCardDetails.phraseMatchOff'))
const phraseMatchValue = computed(() => (props.phraseMatch ? phraseMatchOn.value : phraseMatchOff.value))

const fuzzinessValue = computed(() => t('batchSearchCardDetails.fuzzinessValue', { n: props.fuzziness }))
const proximityValue = computed(() => t('batchSearchCardDetails.proximityValue', { n: props.proximity }))

const { parseFiltersEntries } = useSearchBreadcrumb()

const uriFiltersEntries = computed(() => {
  try {
    const uri = props.uri.split('#/?').pop()
    return parseFiltersEntries(parseQuery(uri))
  } catch {
    return []
  }
})

const uriWithoutIndices = computed(() => {
  try {
    return stringifyQuery(omit(parseQuery(props.uri), ['indices']))
  } catch {
    return ''
  }
})

const hasUriWithFilters = computed(() => !!uriFiltersEntries.value.length)

const { show: showBatchSearchErrorModal } = useBatchSearchErrorModal()

function showError() {
  showBatchSearchErrorModal(props.errorMessage, props.errorQuery)
}
</script>

<template>
  <div class="batch-search-card-details">
    <ul class="batch-search-card-details__list list-unstyled">
      <li>
        <batch-search-card-details-entry :label="t('batchSearchCardDetails.status')">
          <task-status :status="state" with-label @error="showError" />
        </batch-search-card-details-entry>
      </li>
      <li>
        <batch-search-card-details-entry
          :icon="PhFiles"
          :label="t('batchSearchCard.nbDocuments')"
          :value="t('batchSearchCard.nbDocumentsLabel', { n: humanNumber(nbResults) }, nbResults)"
        />
      </li>
      <li>
        <button-icon
          :label="t('batchSearchCard.seeAllDocuments')"
          :to="toAllDocuments"
          class="batch-search-card-actions__see-all flex-shrink-1"
          icon-left="list"
          icon-right="caret-right"
          variant="action"
        />
      </li>
      <li>
        <button-icon
          :disabled="noDocuments"
          :href="downloadDocumentsHref"
          :label="t('batchSearchCard.downloadResultsLabel')"
          class="batch-search-card-actions__download text-nowrap"
          icon-left="download-simple"
          variant="outline-primary"
        />
      </li>
      <li class="my-0">
        <batch-search-card-details-entry
          :icon="PhEmpty"
          :label="t('batchSearchCard.noResultsQueriesLabel')"
          :value="noResultsQueriesLabel"
        >
          <template #end>
            <button-icon
              :disabled="noQueriesWithoutResults"
              icon-left="download-simple"
              variant="link"
              square
              hide-label
              :href="downloadQueriesWithoutResultsHref"
              :label="t('batchSearchCard.noResultsQueriesDownload')"
            />
          </template>
        </batch-search-card-details-entry>
      </li>
    </ul>
    <hr class="my-1" />
    <ul class="batch-search-card-details__list list-unstyled">
      <li class="my-0">
        <batch-search-card-details-entry
          :icon="PhListMagnifyingGlass"
          :label="t('batchSearchCard.nbQueries')"
          :value="t('batchSearchCard.nbQueriesLabel', { n: humanNumber(nbQueries) }, nbQueries)"
        >
          <template #end>
            <button-icon
              :disabled="noQueries"
              icon-left="download-simple"
              variant="link"
              square
              hide-label
              :label="t('batchSearchCard.downloadQueriesLabel')"
              :href="downloadQueriesHref"
            />
          </template>
        </batch-search-card-details-entry>
      </li>
      <li class="mt-2">
        <batch-search-card-details-entry :label="t('batchSearchCardDetails.date')" :icon="PhCalendarBlank">
          <display-datetime :value="date" />
        </batch-search-card-details-entry>
      </li>
      <li>
        <batch-search-card-details-entry :label="t('batchSearchCardDetails.author')" :icon="PhUser">
          <display-user hide-avatar :value="author" />
        </batch-search-card-details-entry>
      </li>
      <li>
        <batch-search-card-details-entry
          :label="t('batchSearchCardDetails.visibility')"
          :icon="visibilityIcon"
          :value="visibilityValue"
        />
      </li>
      <li>
        <batch-search-card-details-entry
          :label="t('batchSearchCardDetails.phraseMatch')"
          :icon="PhQuotes"
          :value="phraseMatchValue"
        />
      </li>
      <li v-if="phraseMatch">
        <batch-search-card-details-entry
          :label="t('batchSearchCardDetails.proximity')"
          :icon="PhArrowsOutLineHorizontal"
          :value="proximityValue"
        />
      </li>
      <li v-else>
        <batch-search-card-details-entry
          :label="t('batchSearchCardDetails.fuzziness')"
          :icon="PhArrowsOutLineHorizontal"
          :value="fuzzinessValue"
        />
      </li>
      <li>
        <batch-search-card-details-entry
          :label="t('batchSearchCardDetails.projects')"
          :icon="PhCirclesThreePlus"
          buttons
        >
          <div class="d-flex flex-wrap gap-2">
            <project-button v-for="(project, index) in projects" :key="index" :project="project" />
          </div>
        </batch-search-card-details-entry>
      </li>
      <li v-if="hasUriWithFilters">
        <batch-search-card-details-entry :label="t('batchSearchCardDetails.filters')" :icon="PhFunnel" buttons>
          <search-breadcrumb-uri :uri="uriWithoutIndices" no-label />
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
