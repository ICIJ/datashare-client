<script setup>
import { ref, computed, onMounted, reactive, watch, toRef } from 'vue'
import { castArray } from 'lodash'
import { useI18n } from 'vue-i18n'
import uniqueId from 'lodash/uniqueId'

import { useCore } from '@/composables/core'
import ExtractingLanguageFormControl from '@/components/Task/TaskDocuments/ExtractingLanguageFormControl'
import ExtractingFormOcrControl from '@/components/Task/TaskDocuments/ExtractingFormOcrControl'
import FormCreation from '@/components/Form/FormCreation'
import FormControlPath from '@/components/Form/FormControl/FormControlPath'
import FormFieldsetI18n from '@/components/Form/FormFieldset/FormFieldsetI18n'
import SearchBarInputDropdownForProjects from '@/components/Search/SearchBar/SearchBarInputDropdownForProjects'

const props = defineProps({
  projectName: {
    type: String
  },
  disabled: {
    type: Boolean
  }
})

const { toastedPromise, core, wait } = useCore()
const { t } = useI18n()

const submitLabel = computed(() => t(`task.documents.form.submit`))

const currentProject = computed(() => core.findProject(props.projectName ?? core.getDefaultProject()))
const selectedProject = ref(currentProject.value)

function getProjectSourcePath(project) {
  const currentSourcePath = project.value?.sourcePath?.split('file://').pop() ?? core.getDefaultDataDir()
  return decodeURI(currentSourcePath)
}
const sourcePath = computed(() => getProjectSourcePath(selectedProject))
const initialFormValues = computed(() => ({
  language: null,
  extractOcr: false,
  skipIndexedDocuments: true,
  hasTesseract: true,
  project: selectedProject.value.name,
  path: sourcePath.value
}))

const path = ref(initialFormValues.value.path)
const language = ref(initialFormValues.value.language)
const hasTesseract = ref(initialFormValues.value.hasTesseract)
const extractOcr = ref(initialFormValues.value.extractOcr)
const textLanguages = ref([])
const ocrLanguages = ref([])
const skipIndexedDocuments = ref(initialFormValues.value.skipIndexedDocuments)

const form = reactive({
  defaultProject: computed(() => selectedProject.value.name),
  language: computed(() => (language.value?.length ? language.value : null)),
  hasTesseract,
  ocr: extractOcr,
  textLanguages,
  ocrLanguages,
  filter: skipIndexedDocuments
})

function reset() {
  selectedProject.value = { name: initialFormValues.value.project }
  path.value = initialFormValues.value.path
  language.value = initialFormValues.value.language
  hasTesseract.value = initialFormValues.value.hasTesseract
  extractOcr.value = initialFormValues.value.extractOcr
  textLanguages.value = initialFormValues.value.textLanguages
  ocrLanguages.value = initialFormValues.value.ocrLanguages
  skipIndexedDocuments.value = initialFormValues.value.skipIndexedDocuments
}

function dispatchExtract() {
  if (path.value) {
    return core.api.indexPath(path.value, form)
  }
  return core.api.index(form)
}

const successMessage = computed(() => t(`task.documents.form.success`))
const errorMessage = (error) => t(`task.documents.form.error`, { error })

async function submit() {
  try {
    await toastedPromise(dispatchExtract(), { successMessage, errorMessage })
  } catch (error) {}
  await core.router.push({ name: 'task.documents.list' })
}

const showOcrMessage = computed(() => {
  return !hasTesseract.value || !!extractOcr.value
})

const waitOcrIdentifier = uniqueId('documents-form-extract-ocr-control-')

const isReady = computed(() => !wait.is(waitOcrIdentifier))

const ocrOptions = computed(() => [
  { text: t('task.documents.form.extractOcr.options.yes'), value: true },
  { text: t('task.documents.form.extractOcr.options.no'), value: false }
])

const skipOptions = computed(() => [
  { text: t('task.documents.form.skipIndexedDocuments.options.yes'), value: true },
  { text: t('task.documents.form.skipIndexedDocuments.options.no'), value: false }
])

async function retrieveLanguages() {
  try {
    const [tL, ocrL] = await Promise.all([core.api.textLanguages(), core.api.ocrLanguages()])
    textLanguages.value = castArray(tL)
    ocrLanguages.value = castArray(ocrL)
  } catch (e) {
    hasTesseract.value = e.response?.status !== 503
    if (hasTesseract.value) {
      throw e
    }
  }
}

async function loadLanguages() {
  wait.start(waitOcrIdentifier)
  await toastedPromise(retrieveLanguages(), {
    errorMessage: t('extractingLanguageFormControl.failedToRetrieveLanguages')
  })
  wait.end(waitOcrIdentifier)
}

onMounted(loadLanguages)
watch(toRef(props, 'projectName'), () => (selectedProject.value = currentProject.value))
watch(
  () => selectedProject.value,
  (p) => {
    path.value = getProjectSourcePath(toRef(p))
  }
)
</script>

<template>
  <form-creation class="task-documents-form" :submit-label="submitLabel" @reset="reset" @submit="submit">
    <form-fieldset-i18n name="project-selector" translation-key="task.documents.form.projectSelector">
      <search-bar-input-dropdown-for-projects v-model="selectedProject" />
    </form-fieldset-i18n>
    <form-fieldset-i18n name="source-path" translation-key="task.documents.form.path">
      <form-control-path v-model="path" :path="sourcePath" hide-folder-icon />
    </form-fieldset-i18n>
    <form-fieldset-i18n name="extracting-language" translation-key="task.documents.form.extractingLanguage">
      <extracting-language-form-control v-model="language" />
    </form-fieldset-i18n>
    <form-fieldset-i18n name="extract-extract-ocr" translation-key="task.documents.form.extractOcr">
      <b-form-radio-group
        v-model="extractOcr"
        name="extract-ocr"
        :disabled="!hasTesseract"
        :options="ocrOptions"
        stacked
      />
    </form-fieldset-i18n>
    <extracting-form-ocr-control
      v-show="showOcrMessage"
      :iso-lang="language"
      :text-languages="textLanguages"
      :ocr-languages="ocrLanguages"
      :has-tesseract="hasTesseract"
      :is-ready="isReady"
    />
    <form-fieldset-i18n name="skip-indexed-documents" translation-key="task.documents.form.skipIndexedDocuments">
      <b-form-radio-group v-model="skipIndexedDocuments" name="skip-indexed-documents" :options="skipOptions" stacked />
    </form-fieldset-i18n>
  </form-creation>
</template>
