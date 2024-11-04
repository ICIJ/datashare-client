<script setup>
import { ref, computed, onMounted } from 'vue'
import { orderBy, values } from 'lodash'
import { useI18n } from 'vue-i18n'

import { useCore } from '@/composables/core'
import FormCreation from '@/components/Form/FormCreation'
import FormFieldsetI18n from '@/components/Form/FormFieldset/FormFieldsetI18n'
import { useWait } from '@/composables/wait'

const props = defineProps({
  /**
   * Project name to select in the input instead of default project
   */
  projectName: {
    type: String,
    default: null
  },
  /**
   * Force hiding the project selector input
   */
  hideProjectSelector: {
    type: Boolean,
    default: false
  }
})

const { core, toastedPromise } = useCore()
const { t } = useI18n()
const { wait, waitFor } = useWait()

const defaultProject = core.config.get('defaultProject')
const defaultPipeline = 'CORENLP'
const loaderPipelineId = 'load ner pipelines'

const initialFormValues = computed(() => ({
  pipeline: defaultPipeline,
  pipelines: {},
  offline: false,
  project: props.projectName ?? defaultProject
}))

const selectedProject = ref({ name: initialFormValues.value.project })
const pipeline = ref(initialFormValues.value.pipeline)
const pipelines = ref(initialFormValues.value.pipelines)
const offline = ref(initialFormValues.value.offline)
const error = ref(null)

const getNerPipelines = () => core.api.getNerPipelines()
const fetchPipelines = waitFor(loaderPipelineId, getNerPipelines)

onMounted(async () => {
  try {
    pipelines.value = await fetchPipelines()
  } catch (e) {
    error.value = e
  }
})

const offlineOptions = computed(() => [
  { text: t('task.entities.form.offline.options.yes'), value: true },
  { text: t('task.entities.form.offline.options.no'), value: false }
])
const pipelineOptions = computed(() => {
  return orderBy(
    values(pipelines.value).map((pip) => {
      const text = t(`indexing.pipelineOptions.${pip.toLowerCase()}`)
      const value = pip.toUpperCase()
      if (pip === defaultPipeline) {
        const defaultLabel = t('task.entities.form.defaultPipeline')
        const html = `${text} <span class="font-italic small">(${defaultLabel})</span>`
        return { html, value, isDefault: true }
      }
      return { text, value, isDefault: false }
    }),
    ['isDefault'],
    ['desc']
  )
})

const submitLabel = computed(() => t(`task.entities.form.submit`))
const successMessage = computed(() => t('task.entities.form.success'))
const errorMessage = (error) => t(`task.entities.form.error`, { error })

const valid = computed(() => {
  return !wait.waiting(loaderPipelineId) && !wait.waiting(loaderLaunchTask) && !error.value
})

function reset() {
  selectedProject.value = { name: initialFormValues.value.project }
  pipeline.value = initialFormValues.value.pipeline
  offline.value = initialFormValues.value.offline
}

function findNamedEntities() {
  const options = { syncModels: !offline.value, defaultProject: selectedProject.value.name }
  return core.api.findNames(pipeline.value, options)
}
const loaderLaunchTask = 'launch task'
const launchTask = waitFor(loaderLaunchTask, findNamedEntities)
async function submit() {
  try {
    await toastedPromise(launchTask(), { successMessage, errorMessage })
  } catch (error) {}
  await core.router.push({ name: 'task.entities.list' })
}
</script>

<template>
  <v-wait :for="loaderPipelineId">
    <form-creation
      class="task-entities-form"
      :submit-label="submitLabel"
      :valid="valid"
      @reset="reset"
      @submit="submit"
    >
      <form-fieldset-i18n name="project-selector" translation-key="task.entities.form.projectSelector" compact-auto>
        <search-bar-input-dropdown-for-projects v-model="selectedProject" />
      </form-fieldset-i18n>
      <form-fieldset-i18n name="pipeline" translation-key="task.entities.form.pipeline" compact-auto>
        <b-alert v-if="error" model-value variant="danger">{{ error }}</b-alert>
        <b-form-radio-group v-else v-model="pipeline" :options="pipelineOptions" name="pipeline" stacked />
      </form-fieldset-i18n>
      <form-fieldset-i18n name="offline" translation-key="task.entities.form.offline" compact-auto>
        <b-form-radio-group v-model="offline" name="offline" :options="offlineOptions" stacked />
      </form-fieldset-i18n>
    </form-creation>
  </v-wait>
</template>
