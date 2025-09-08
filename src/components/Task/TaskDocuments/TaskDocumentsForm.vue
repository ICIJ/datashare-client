<script setup>
import { ref, computed, onBeforeMount, reactive, watch, toRef, toValue } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCore } from '@/composables/useCore'
import { useLanguagesStore } from '@/store/modules/languages'
import FormCreation from '@/components/Form/FormCreation'
import FormControlExtractingLanguage from '@/components/Form/FormControl/FormControlExtractingLanguage'
import FormControlPath from '@/components/Form/FormControl/FormControlPath'
import FormControlOcr from '@/components/Form/FormControl/FormControlOcr'
import FormFieldsetI18n from '@/components/Form/FormFieldset/FormFieldsetI18n'
import SearchBarInputDropdownForProjects from '@/components/Search/SearchBar/SearchBarInputDropdownForProjects'
import TaskDocumentsFormOcrAlert from '@/components/Task/TaskDocuments/TaskDocumentsFormOcrAlert'

const props = defineProps({
  project: {
    type: String
  },
  disabled: {
    type: Boolean
  }
})

const { toastedPromise, core } = useCore()
const { t } = useI18n()
const languagesStore = useLanguagesStore()

const currentProject = computed(() => {
  return core.findProject(props.project ?? core.getDefaultProject())
})

const sourcePath = computed(() => {
  return getProjectSourcePath(selectedProject)
})

const initialFormValues = computed(() => ({
  language: null,
  extractOcr: false,
  skipIndexedDocuments: true,
  project: selectedProject.value.name,
  path: sourcePath.value
}))

const selectedProject = ref(currentProject.value)
const path = ref(initialFormValues.value.path)
const language = ref(initialFormValues.value.language)
const extractOcr = ref(initialFormValues.value.extractOcr)
const skipIndexedDocuments = ref(initialFormValues.value.skipIndexedDocuments)

const form = reactive({
  defaultProject: computed(() => selectedProject.value.name),
  language: computed(() => (language.value?.length ? language.value : null)),
  ocr: extractOcr,
  filter: skipIndexedDocuments
})

function getProjectSourcePath(projectRef) {
  const { sourcePath } = toValue(projectRef) || {}
  const currentSourcePath = sourcePath?.split('file://').pop() ?? core.getDefaultDataDir()
  return decodeURI(currentSourcePath)
}

function reset() {
  selectedProject.value = { name: initialFormValues.value.project }
  path.value = initialFormValues.value.path
  language.value = initialFormValues.value.language
  extractOcr.value = initialFormValues.value.extractOcr
  skipIndexedDocuments.value = initialFormValues.value.skipIndexedDocuments
}

async function dispatchExtract() {
  if (path.value) {
    return core.api.indexPath(path.value, form)
  }
  return core.api.index(form)
}

const successMessage = computed(() => t(`task.documents.form.success`))
const errorMessage = error => t(`task.documents.form.error`, { error })

async function submit() {
  await toastedPromise(dispatchExtract(), { successMessage, errorMessage })
  await core.router.push({ name: 'task.documents.list' })
}

const skipOptions = computed(() => [
  { text: t('task.documents.form.skipIndexedDocuments.options.yes'), value: true },
  { text: t('task.documents.form.skipIndexedDocuments.options.no'), value: false }
])

// Fetch available languages and OCR languages before mounting the component
onBeforeMount(languagesStore.fetch)
// When the project prop changes, update the selected project
watch(toRef(props, 'project'), () => (selectedProject.value = currentProject.value))
// When a project is selected, update the path to the project's source path
watch(selectedProject, p => (path.value = getProjectSourcePath(p)))
</script>

<template>
  <form-creation
    class="task-documents-form"
    :submit-label="t(`task.documents.form.submit`)"
    @reset="reset"
    @submit="submit"
  >
    <form-fieldset-i18n
      name="project-selector"
      translation-key="task.documents.form.projectSelector"
    >
      <search-bar-input-dropdown-for-projects v-model="selectedProject" />
    </form-fieldset-i18n>
    <form-fieldset-i18n
      name="source-path"
      translation-key="task.documents.form.path"
    >
      <form-control-path
        v-model="path"
        :path="sourcePath"
        hide-folder-icon
      />
    </form-fieldset-i18n>
    <form-fieldset-i18n
      name="extracting-language"
      translation-key="task.documents.form.extractingLanguage"
      with-description
    >
      <form-control-extracting-language v-model="language" />
    </form-fieldset-i18n>
    <form-fieldset-i18n
      name="extract-extract-ocr"
      label-class="pt-md-0"
      translation-key="task.documents.form.extractOcr"
      description-class="pt-md-0"
    >
      <form-control-ocr
        v-model="extractOcr"
        :disabled="languagesStore.missingOcrLanguages"
      />
    </form-fieldset-i18n>
    <task-documents-form-ocr-alert v-if="extractOcr" :language="language" />
    <form-fieldset-i18n
      name="skip-indexed-documents"
      translation-key="task.documents.form.skipIndexedDocuments"
      label-class="pt-md-0"
      description-class="pt-md-0"
    >
      <b-form-radio-group
        v-model="skipIndexedDocuments"
        name="skip-indexed-documents"
        :options="skipOptions"
        stacked
      />
    </form-fieldset-i18n>
  </form-creation>
</template>
