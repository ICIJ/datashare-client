<script setup>
import { ref, computed, onMounted, watch, toRef } from 'vue'
import { filter, orderBy, values } from 'lodash'
import { useI18n } from 'vue-i18n'
import includes from 'lodash/includes'

import AppWait from '@/components/AppWait/AppWait'
import FormCreation from '@/components/Form/FormCreation'
import FormFieldsetI18n from '@/components/Form/FormFieldset/FormFieldsetI18n'
import SearchBarInputDropdownForProjects from '@/components/Search/SearchBar/SearchBarInputDropdownForProjects'
import { useCore } from '@/composables/useCore'
import { useToast } from '@/composables/useToast'
import { useWait } from '@/composables/useWait'

const props = defineProps({
  /**
   * Project name to select in the input instead of default project
   */
  project: {
    type: String,
    default: null
  }
})

const core = useCore()
const { toastedPromise } = useToast()

const { t } = useI18n()
const { waitFor, waiting } = useWait()
const defaultProject = core.getDefaultProject()
const defaultPipeline = 'CORENLP'
const emailPipeline = 'EMAIL'
const loaderPipelineId = 'load ner pipelines'
const EMAILS = 'emails'
const NAMED_ENTITIES = 'named-entities'
const initialFormValues = computed(() => ({
  findEntities: NAMED_ENTITIES,
  pipeline: defaultPipeline,
  pipelines: {},
  offline: false,
  project: props.project ?? defaultProject
}))

watch(toRef(props, 'project'), reset)
const selectedProject = ref({ name: initialFormValues.value.project })
const pipeline = ref(initialFormValues.value.pipeline)
const pipelines = ref(initialFormValues.value.pipelines)
const offline = ref(initialFormValues.value.offline)
const error = ref(null)
const findEntities = ref(initialFormValues.value.findEntities)

const getNerPipelines = () => core.api.getNerPipelines()
const fetchPipelines = waitFor(loaderPipelineId, getNerPipelines)

onMounted(async () => {
  try {
    pipelines.value = await fetchPipelines()
  }
  catch (e) {
    error.value = e
  }
})

watch(
  () => findEntities.value,
  (entityType) => {
    pipeline.value = entityType === EMAILS ? emailPipeline : defaultPipeline
  }
)
const pipelinesNamedEntities = computed(() => filter(values(pipelines.value), p => p !== emailPipeline))
const hasPipelinesNamedEntities = computed(() => pipelinesNamedEntities.value.length > 0)
const hasPipelineEmail = computed(() => includes(values(pipelines.value), emailPipeline))

const isPipelineNamedEntities = computed(() => findEntities.value === NAMED_ENTITIES)

const findEntitiesOptions = computed(() => {
  const options = []
  if (hasPipelinesNamedEntities.value) {
    options.push({ text: t('task.entities.form.findEntities.options.named-entities'), value: NAMED_ENTITIES })
  }
  if (hasPipelineEmail.value) {
    options.push({ text: t('task.entities.form.findEntities.options.emails'), value: EMAILS })
  }
  return options
})

const offlineOptions = computed(() => [
  { text: t('task.entities.form.offline.options.yes'), value: true },
  { text: t('task.entities.form.offline.options.no'), value: false }
])

const pipelineOptions = computed(() => {
  return orderBy(
    pipelinesNamedEntities.value.map((pip) => {
      const text = t(`task.entities.form.pipelineOptions.${pip.toLowerCase()}`)
      const value = pip.toUpperCase()
      if (pip === defaultPipeline) {
        const defaultLabel = t('task.entities.form.defaultPipeline')
        const html = `${text} <span class="font-italic small">- ${defaultLabel}</span>`
        return { text: html, value, isDefault: true }
      }
      return { text, value, isDefault: false }
    }),
    ['isDefault'],
    ['desc']
  )
})

const submitLabel = computed(() => t(`task.entities.form.submit`))
const successMessage = computed(() => t('task.entities.form.success'))
const errorMessage = error => t(`task.entities.form.error`, { error })

const valid = computed(() => {
  return !waiting(loaderPipelineId) && !waiting(loaderLaunchTask) && !error.value
})

function reset() {
  selectedProject.value = { name: initialFormValues.value.project }
  pipeline.value = initialFormValues.value.pipeline
  offline.value = initialFormValues.value.offline
  findEntities.value = initialFormValues.value.findEntities
}

function findNamedEntities() {
  const options = { syncModels: !offline.value, defaultProject: selectedProject.value.name }
  return core.api.findNames(pipeline.value, options)
}

const loaderLaunchTask = 'launch task'
const launchTask = waitFor(loaderLaunchTask, findNamedEntities)

async function submit() {
  await toastedPromise(launchTask(), { successMessage, errorMessage })
  await core.router.push({ name: 'task.entities.list' })
}
</script>

<template>
  <app-wait :for="loaderPipelineId">
    <form-creation
      class="task-entities-form"
      :submit-label="submitLabel"
      :valid="valid"
      @reset="reset"
      @submit="submit"
    >
      <form-fieldset-i18n
        name="project-selector"
        translation-key="task.entities.form.projectSelector"
      >
        <search-bar-input-dropdown-for-projects v-model="selectedProject" />
      </form-fieldset-i18n>
      <form-fieldset-i18n
        name="findEntities"
        translation-key="task.entities.form.findEntities"
        with-description
        label-class="pt-md-0"
        description-class="pt-md-0"
      >
        <b-form-radio-group
          v-model="findEntities"
          name="findEntities"
          :options="findEntitiesOptions"
          stacked
        />
      </form-fieldset-i18n>
      <form-fieldset-i18n
        v-if="isPipelineNamedEntities"
        name="pipeline"
        translation-key="task.entities.form.pipeline"
        label-class="pt-md-0"
        description-class="pt-md-0"
      >
        <b-alert
          v-if="error"
          model-value
          variant="danger"
        >
          {{ error }}
        </b-alert>
        <b-form-radio-group
          v-else
          v-model="pipeline"
          :options="pipelineOptions"
          name="pipeline"
          stacked
        >
          <template #option="val">
            <div v-html="val.text" />
          </template>
        </b-form-radio-group>
      </form-fieldset-i18n>
      <form-fieldset-i18n
        name="offline"
        translation-key="task.entities.form.offline"
        label-class="pt-md-0"
        description-class="pt-md-0"
      >
        <b-form-radio-group
          v-model="offline"
          name="offline"
          :options="offlineOptions"
          stacked
        />
      </form-fieldset-i18n>
    </form-creation>
  </app-wait>
</template>
