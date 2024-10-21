<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { every, castArray } from 'lodash'
import { useI18n } from 'vue-i18n'
import uniqueId from 'lodash/uniqueId'

import FormControlPath from '@/components/Form/FormControl/FormControlPath'
import { useCore } from '@/composables/core'
import FormCreation from '@/components/Form/FormCreation'
import FormFieldsetI18n from '@/components/Form/FormFieldset/FormFieldsetI18n'

// Props
const props = defineProps({
  disabled: {
    type: Boolean
  },
  values: {
    type: Object,
    default: () => ({})
  },
  projectName: {
    type: String
  }
})

const { toastedPromise, core, wait } = useCore()
const { t } = useI18n()

const submitLabel = computed(() => t(`task.analysis.form.submit`))

const defaultProject = computed(() => core.config.get('defaultProject'))
const defaultDataDir = computed(() => core.config.get('dataDir'))
const initialFormValues = computed(() => ({
  path: defaultDataDir.value,
  language: null,
  extractOcr: true,
  skipIndexedDocuments: true,
  hasTesseract: true,
  project: props.projectName ?? defaultProject.value,
  ...props.values
}))

function isPresent(value) {
  return value?.trim()?.length > 0
}

const selectedProject = ref({ name: initialFormValues.value.project })
const currentProject = computed(() => core.findProject(selectedProject.value))

const sourcePath = computed(() => {
  const currentSourcePath = currentProject.value?.sourcePath?.split('file://').pop() ?? defaultDataDir.value
  return decodeURI(currentSourcePath)
})

const path = ref(initialFormValues.value.path)
const language = ref(initialFormValues.value.language)
const hasTesseract = ref(true)
const extractOcr = ref(true)
const textLanguages = ref([])
const ocrLanguages = ref([])
const skipIndexedDocuments = ref(initialFormValues.value.skipIndexedDocuments)
const form = reactive({
  defaultProject: selectedProject.value.name,
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
const successMessage = computed(() => t(`task.analysis.form.success`))
const errorMessage = (error) => t(`task.analysis.form.error`, { error })
async function submit() {
  try {
    await toastedPromise(dispatchExtract(), { successMessage, errorMessage })
  } catch (error) {}
  await core.router.push({ name: 'task.analysis.list' })
}
const valid = computed(() => {
  return every([!props.disabled, isPresent(path.value)])
})

const showOcrMessage = computed(() => {
  return !hasTesseract.value || !!extractOcr.value
})
async function retrieveLanguages() {
  try {
    const [textLanguages, ocrLanguages] = await Promise.all([core.api.textLanguages(), core.api.ocrLanguages()])
    textLanguages.value = castArray(textLanguages)
    ocrLanguages.value = castArray(ocrLanguages)
  } catch (e) {
    hasTesseract.value = e.response.status !== 503
    if (hasTesseract.value) {
      throw e
    }
  }
}
const waitOcrIdentifier = uniqueId('extracting-form-extract-ocr-control-')
onMounted(() => {
  return loadLanguages()
})

async function loadLanguages() {
  wait.start(waitOcrIdentifier)
  await toastedPromise(retrieveLanguages(), {
    errorMessage: t('extractingLanguageFormControl.failedToRetrieveLanguages')
  })
  wait.end(waitOcrIdentifier)
}

const isReady = computed(() => {
  return !wait.is(waitOcrIdentifier)
})

const ocrOptions = computed(() => [
  { text: t('task.analysis.form.extractOcr.options.yes'), value: true },
  { text: t('task.analysis.form.extractOcr.options.no'), value: false }
])
const skipOptions = computed(() => [
  { text: t('task.analysis.form.skipIndexedDocuments.options.yes'), value: true },
  { text: t('task.analysis.form.skipIndexedDocuments.options.no'), value: false }
])
</script>

<template>
  <form-creation class="indexing-form" :valid="valid" :submit-label="submitLabel" @reset="reset" @submit="submit">
    <form-fieldset-i18n name="project-selector" translation-key="task.analysis.form.projectSelector" compact-auto>
      <search-bar-input-dropdown-for-projects v-model="selectedProject" />
      <input type="hidden" name="project" :value="selectedProject.name" />
    </form-fieldset-i18n>
    <form-fieldset-i18n name="source-path" translation-key="task.analysis.form.path" compact-auto>
      <form-control-path v-model="path" :path="sourcePath" hide-folder-icon />
      <input type="hidden" name="path" :value="path" />
    </form-fieldset-i18n>
    <form-fieldset-i18n name="extracting-language" translation-key="task.analysis.form.extractingLanguage" compact-auto>
      <extracting-language-form-control v-model="language" />
      <input type="hidden" name="language" :value="language" />
    </form-fieldset-i18n>
    <form-fieldset-i18n name="extract-extract-ocr" translation-key="task.analysis.form.extractOcr" compact-auto>
      <b-form-radio-group
        v-model="extractOcr"
        name="extract-ocr"
        :disabled="!hasTesseract"
        :options="ocrOptions"
        stacked
      />
      <div v-show="showOcrMessage" class="">
        <extracting-form-ocr-control
          :iso-lang="language"
          :text-languages="textLanguages"
          :ocr-languages="ocrLanguages"
          :has-tesseract="hasTesseract"
          :is-ready="isReady"
        />
      </div>
    </form-fieldset-i18n>
    <form-fieldset-i18n
      name="skip-indexed-documents"
      translation-key="task.analysis.form.skipIndexedDocuments"
      compact-auto
    >
      <b-form-radio-group v-model="skipIndexedDocuments" name="skip-indexed-documents" :options="skipOptions" stacked />
    </form-fieldset-i18n>
  </form-creation>
</template>
