<script setup>
import { computed, ref, toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import FormFieldsetI18n from '@/components/Form/FormFieldset/FormFieldsetI18n'
import SearchBarInputDropdownForProjects from '@/components/Search/SearchBar/SearchBarInputDropdownForProjects'
import FormCreation from '@/components/Form/FormCreation'
import { useCore } from '@/composables/core'
import FormControlRange from '@/components/Form/FormControl/FormControlRange/FormControlRange'
import { usePath } from '@/components/Task/path'
import * as filterTypes from '@/store/filters'
import FilterTypePath from '@/components/Filter/FilterType/FilterTypePath'
import FilterType from '@/components/Filter/FilterType/FilterType'

const props = defineProps({
  projects: {
    type: Array,
    default: () => []
  }
})
const { t } = useI18n()
const { core } = useCore()
const { defaultProject, defaultDataDir } = usePath()

const projects = toRef(props, 'projects')
const projectList = computed(() => {
  if (projects.value.length) {
    return projects.value.filter((index) => !!core.findProject(index))
  } else {
    return [defaultProject.value]
  }
})
const selectedProjects = ref(projectList.value)

const name = ref('')
const description = ref('')
const csvFile = ref(null)
const phraseMatch = ref(true)
const phraseMatchOptions = computed(() => [
  { text: t('task.documents.form.extractOcr.options.yes'), value: true },
  { text: t('task.documents.form.extractOcr.options.no'), value: false }
])
const phraseChanges = ref(2)
const paths = ref([])

const projectNames = computed(() => {
  return selectedProjects.value.map((p) => p.name)
})

function instantiateFilter() {
  return ({ type, options } = {}) => {
    const Type = filterTypes[type]
    return new Type(options)
  }
}
const f = instantiateFilter()
const filterPath = f({
  type: 'FilterPath',
  options: {
    name: 'path',
    key: 'byDirname',
    icon: 'tree-structure',
    order: 35,
    section: 'batchSearch',
    hideSearch: true,
    fromElasticSearch: true,
    preference: 'filter-path'
  }
})
const filterTag = f({
  type: 'FilterTag',
  options: {
    name: 'tags',
    key: 'tags',
    icon: 'tag',
    order: 20,
    section: 'batchSearch',
    preference: 'filter-tags'
  }
})
const filterTagExcluded = f({
  type: 'FilterTag',
  options: {
    name: 'excluded-tags',
    key: 'tags',
    icon: 'tag',
    order: 20,
    section: 'batchSearch',
    preference: 'filter-tags',
    excluded: true
  }
})
const filterContentType = f({
  type: 'FilterContentType',
  options: {
    name: 'contentType',
    key: 'contentType',
    icon: 'file',
    order: 40,
    section: 'documentsInfo',
    preference: 'filter-content-type'
  }
})
const shared = ref(true)
</script>

<template>
  <form-creation
    class="task-batch-search-form"
    :valid="valid"
    :submit-label="submitLabel"
    @reset="reset"
    @submit="submit"
  >
    <form-fieldset-i18n name="name" translation-key="task.batch-search.form.name">
      <b-form-input v-model="name" type="text" />
    </form-fieldset-i18n>
    <form-fieldset-i18n name="projects" translation-key="task.batch-search.form.projects">
      <search-bar-input-dropdown-for-projects v-model="selectedProjects" />
    </form-fieldset-i18n>
    <form-fieldset-i18n name="description" translation-key="task.batch-search.form.description">
      <b-form-textarea v-model="description" type="text" placeholder="task.batch-search.form.description.placeholder" />
    </form-fieldset-i18n>
    <form-fieldset-i18n name="csvFile" translation-key="task.batch-search.form.csvFile">
      <b-form-file
        v-model="csvFile"
        :placeholder="$t('task.batch-search.form.csvFile.placeholder')"
        :state="!!csvFile"
        accept=".csv"
        class="text-truncate"
        no-drop
        required
      ></b-form-file>
      <div>
        <ul>
          <li>Only <abbr>CSV</abbr> format is accepted Export your spreadsheet as a CSV using encoding UTF-8</li>
          <li>Your <abbr>CSV</abbr> file should not contain more than 60,000 queries</li>
          <li>The first and only column should contain the terms to search No line break(s) in cells</li>
          <li>
            Selecting 'do phrase matches' prevent from using operators like <code>AND</code>, <code>OR</code>,
            <code>NOT</code>, <code>*</code>, <code>?</code>, <code>!</code>, <code>+</code>, <code>-</code> or Regexes
            (between 2 slashes).
          </li>
        </ul>
      </div>
    </form-fieldset-i18n>
    <form-fieldset-i18n name="phraseMatch" translation-key="task.batch-search.form.phraseMatch">
      <b-form-radio-group v-model="phraseMatch" name="extract-ocr" :options="phraseMatchOptions" stacked />
    </form-fieldset-i18n>
    <form-fieldset-i18n name="phraseChanges" translation-key="task.batch-search.form.phraseChanges">
      <form-control-range v-model="phraseChanges" :min="0" :max="5" :step="1" />
    </form-fieldset-i18n>

    <form-fieldset-i18n name="path" translation-key="task.batch-search.form.path">
      <filter-type-path :filter="filterPath" :projects="projectNames" />
    </form-fieldset-i18n>
    <form-fieldset-i18n name="tags-included" translation-key="task.batch-search.form.tag-included">
      <filter-type :filter="filterTag" :projects="projectNames" />
    </form-fieldset-i18n>
    <form-fieldset-i18n name="tags-excluded" translation-key="task.batch-search.form.tags-excluded">
      <filter-type :filter="filterTagExcluded" :projects="projectNames" />
    </form-fieldset-i18n>
    <form-fieldset-i18n name="content-types" translation-key="task.batch-search.form.content-types">
      <filter-type :filter="filterContentType" :projects="projectNames" />
    </form-fieldset-i18n>
  </form-creation>
</template>
