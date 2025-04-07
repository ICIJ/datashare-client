<script setup>
import { property } from 'lodash'
import { useI18n } from 'vue-i18n'
import { useRouter, stringifyQuery } from 'vue-router'
import { computed, ref, toValue } from 'vue'

import FormCreation from '@/components/Form/FormCreation'
import TaskBatchSearchFormDetails from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormDetails'
import TaskBatchSearchFormQueries from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormQueries'
import TaskBatchSearchFormOperators from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormOperators'
import TaskBatchSearchFormFilters from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormFilters'
import TaskBatchSearchFormOverview from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormOverview'
import { useCore } from '@/composables/useCore'
import { useSearchStore } from '@/store/modules/search'

const { core, toast } = useCore()
const { t } = useI18n()
const router = useRouter()

// The store created with disposable will be automatically disposed when the component is unmounted.
// Additionaly, the id of the store is provided with `searchStoreSuffix` key so children
// components can access it.
const formSearchStore = useSearchStore.disposable('searchStoreSuffix')
// Use all the available projects as indices
formSearchStore.setIndices(core.projectIds)

const selectedProjects = computed({
  get: () => formSearchStore.indices.map((name) => ({ name })),
  set: (projects) => formSearchStore.setIndices(projects.map(property('name')))
})

const initialValues = {
  name: '',
  projects: toValue(selectedProjects),
  description: '',
  visibility: false,
  csvFile: null,
  phraseMatch: false,
  phraseChanges: 0,
  spellingChanges: 0
}

const name = ref(initialValues.name)
const description = ref(initialValues.description)
const visibility = ref(initialValues.visibility)
const csvFile = ref(initialValues.csvFile)
const phraseMatch = ref(initialValues.phraseMatch)
const phraseChanges = ref(initialValues.phraseChanges)
const spellingChanges = ref(initialValues.spellingChanges)

function reset() {
  name.value = initialValues.name
  selectedProjects.value = initialValues.projects
  description.value = initialValues.description
  visibility.value = initialValues.visibility
  csvFile.value = initialValues.csvFile
  phraseMatch.value = initialValues.phraseMatch
  phraseChanges.value = initialValues.phraseChanges
  spellingChanges.value = initialValues.spellingChanges
  formSearchStore.resetFilterValues()
}

const queryTemplate = computed(() => {
  const { instantiatedFilters } = formSearchStore
  const { query } = core.api.elasticsearch.rootSearch(instantiatedFilters, '<query>').build()
  return JSON.stringify(query)
})

const uri = computed(() => `/?${stringifyQuery(formSearchStore.toBaseRouteQuery)}`)

const isValid = computed(() => name.value.trim(' ').length > 0 && csvFile.value !== null)

function createBatchSearch() {
  return core.api.batchSearch(
    name.value,
    csvFile.value,
    description.value,
    formSearchStore.indices.join(','),
    phraseMatch.value,
    phraseMatch.value ? +phraseChanges.value : +spellingChanges.value,
    visibility.value,
    queryTemplate.value,
    uri.value
  )
}

async function submit() {
  if (!isValid.value) {
    return
  }

  try {
    await createBatchSearch()
    await router.push({ name: 'task.batch-search.list' })
    toast.success(t('task.batch-search.form.submitSuccess'))
  } catch (error) {
    toast.error(t('task.batch-search.form.submitError'))
  }
}
</script>

<template>
  <form-creation
    class="task-batch-search-form d-flex flex-column gap-4"
    content-class-list="d-flex flex-column gap-3"
    :valid="isValid"
    :submit-label="$t('task.batch-search.form.submit')"
    :submit-icon="PhRocketLaunch"
    @reset="reset"
    @submit="submit"
  >
    <task-batch-search-form-details
      v-model:name="name"
      v-model:description="description"
      v-model:visibility="visibility"
      v-model:selectedProjects="selectedProjects"
    />
    <task-batch-search-form-queries v-model:csvFile="csvFile" />
    <task-batch-search-form-operators
      v-model:phraseMatch="phraseMatch"
      v-model:phraseChanges="phraseChanges"
      v-model:spellingChanges="spellingChanges"
    />
    <task-batch-search-form-filters />
    <task-batch-search-form-overview :uri="uri" />
  </form-creation>
</template>
