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

const { batchSearch } = defineProps({
  batchSearch: {
    type: Object,
    required: true
  }
})

const {
  uuid,
  nbResults,
  nbQueries,
  nbQueriesWithoutResults,
  phraseMatches,
  proximity,
  fuzziness,
  date,
  user,
  projects,
  state,
  visibility,
  uri
} = batchSearch

const { t } = useI18n()
const indices = projects.join(',')

const toAllDocuments = { name: 'task.batch-search-results.list', params: { indices, uuid } }

const downloadDocumentsHref = `/api/batch/search/result/csv/${uuid}`
const downloadQueriesWithoutResultsHref = `/api/batch/search/${uuid}/queries?format=csv&maxResults=0`
const downloadQueriesHref = `/api/batch/search/${uuid}/queries?format=csv`

const hasNoResults = nbResults === 0
const hasNoQueries = nbQueries === 0
const hasNoQueriesWithoutResults = nbQueriesWithoutResults === 0
const hasQueriesWithoutResultsNumber = !isNaN(nbQueriesWithoutResults) && nbQueriesWithoutResults > 0

const noResultsQueries = computed(() => {
  const n = humanNumber(nbQueriesWithoutResults)
  return t('batchSearchCard.noResultsQueries', { n }, nbQueriesWithoutResults)
})
const noResultsQueriesDownload = computed(() => t('batchSearchCard.noResultsQueriesDownload'))
const noResultsQueriesLabel = hasQueriesWithoutResultsNumber ? noResultsQueries : noResultsQueriesDownload

const visibilityIcon = visibility ? PhEye : PhEyeSlash
const visibilityPrivate = computed(() => t('batchSearchCardDetails.visibilityPrivate'))
const visibilityShared = computed(() => t('batchSearchCardDetails.visibilityShared'))
const visibilityValue = visibility ? visibilityShared : visibilityPrivate

const phraseMatchOn = computed(() => t('batchSearchCardDetails.phraseMatchOn'))
const phraseMatchOff = computed(() => t('batchSearchCardDetails.phraseMatchOff'))
const phraseMatchValue = phraseMatches ? phraseMatchOn : phraseMatchOff

const fuzzinessValue = computed(() => t('batchSearchCardDetails.fuzzinessValue', { n: fuzziness }))
const proximityValue = computed(() => t('batchSearchCardDetails.proximityValue', { n: proximity }))

const { parseFiltersEntries } = useSearchBreadcrumb()

const uriFiltersEntries = computed(() => {
  try {
    const path = uri.split('#/?').pop()
    return parseFiltersEntries(parseQuery(path))
  } catch {
    return []
  }
})

const uriWithoutIndices = computed(() => {
  try {
    return stringifyQuery(omit(parseQuery(uri), ['indices']))
  } catch {
    return ''
  }
})

const hasUriWithFilters = computed(() => !!uriFiltersEntries.value.length)

const { show: showBatchSearchErrorModal } = useBatchSearchErrorModal()
const showError = () => showBatchSearchErrorModal(batchSearch)
</script>

<template>
  <div class="batch-search-card-details">
    <ul class="batch-search-card-details__list list-unstyled">
      <li>
        <batch-search-card-details-entry :label="t('batchSearchCardDetails.status')">
          <task-status :status="state" with-label with-click @error="showError" />
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
          :disabled="hasNoResults"
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
              :disabled="hasNoQueriesWithoutResults"
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
              :disabled="hasNoQueries"
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
          <display-user hide-avatar :value="user.id" />
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
  &__list {
    margin: 0;

    li {
      margin: $spacer-md 0;

      &:first-of-type {
        margin-top: 0;
      }
    }
  }
}
</style>
