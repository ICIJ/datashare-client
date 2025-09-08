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
  }
})

const { toastedPromise, core } = useCore()
const { t } = useI18n()
const languagesStore = useLanguagesStore()

const sourcePath = computed(() => {
  return getProjectSourcePath(form.defaultProject)
})

function initialFormValues() {
  const project = props.project ?? core.getDefaultProject()
  const { name: defaultProject } = core.findProject(project)

  return {
    defaultProject,
    language: null,
    path: getProjectSourcePath(defaultProject),
    ocr: false,
    filter: true
  }
}

const form = reactive({ ...initialFormValues() })

const currentProject = computed({
  get() {
    return core.findProject(form.defaultProject)
  },
  set({ name }) {
    form.defaultProject = name
  }
})

function getProjectSourcePath(projectRef) {
  const { sourcePath } = toValue(projectRef) || {}
  const currentSourcePath = sourcePath?.split('file://').pop() ?? core.getDefaultDataDir()
  return decodeURI(currentSourcePath)
}

function reset() {
  for (const field in initialFormValues()) {
    form[field] = initialFormValues()[field]
  }
}

async function dispatchExtract() {
  if (form.path) {
    return core.api.indexPath(form.path, form)
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
onBeforeMount(languagesStore.fetchOnce)
// When the project prop changes, update the selected project
watch(toRef(props, 'project'), () => (form.defaultProject = currentProject.value))
// When a project is selected, update the path to the project's source path
watch(toRef(form, 'defaultProject'), p => form.path = getProjectSourcePath(core.findProject(p)))
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
      <search-bar-input-dropdown-for-projects v-model="currentProject" />
    </form-fieldset-i18n>
    <form-fieldset-i18n
      name="source-path"
      translation-key="task.documents.form.path"
    >
      <form-control-path
        v-model="form.path"
        :path="sourcePath"
        hide-folder-icon
      />
    </form-fieldset-i18n>
    <form-fieldset-i18n
      name="extracting-language"
      translation-key="task.documents.form.extractingLanguage"
      with-description
    >
      <form-control-extracting-language v-model="form.language" />
    </form-fieldset-i18n>
    <form-fieldset-i18n
      name="extract-extract-ocr"
      label-class="pt-md-0"
      translation-key="task.documents.form.extractOcr"
      description-class="pt-md-0"
    >
      <form-control-ocr
        v-model="form.ocr"
        :disabled="languagesStore.missingOcrLanguages"
      />
    </form-fieldset-i18n>
    <task-documents-form-ocr-alert
      :disabled="!form.ocr"
      :language="form.language"
      content-class="mb-3"
    />
    <form-fieldset-i18n
      name="skip-indexed-documents"
      translation-key="task.documents.form.skipIndexedDocuments"
      label-class="pt-md-0"
      description-class="pt-md-0"
    >
      <b-form-radio-group
        v-model="form.filter"
        name="skip-indexed-documents"
        :options="skipOptions"
        stacked
      />
    </form-fieldset-i18n>
  </form-creation>
</template>
