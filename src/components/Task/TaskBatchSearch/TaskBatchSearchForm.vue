<script setup>
import { computed, ref, toRaw, toRef, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

import FormStep from '@/components/Form/FormStep/FormStep'
import FormFieldsetI18n from '@/components/Form/FormFieldset/FormFieldsetI18n'
import SearchBarInputDropdownForProjects from '@/components/Search/SearchBar/SearchBarInputDropdownForProjects'
import FormCreation from '@/components/Form/FormCreation'
import { useCore } from '@/composables/core'
import FormControlRange from '@/components/Form/FormControl/FormControlRange/FormControlRange'
import { usePath } from '@/components/Task/path'
import * as filterTypes from '@/store/filters'
import FilterTypePath from '@/components/Filter/FilterType/FilterTypePath'
import FilterType from '@/components/Filter/FilterType/FilterType'
import TableEditable from '@/components/TableEditable/TableEditable'
import TabGroupEntry from '@/components/TabGroup/TabGroupEntry'
import TabGroup from '@/components/TabGroup/TabGroup'

const props = defineProps({
  projects: {
    type: Array,
    default: () => []
  }
})
const { t } = useI18n()
const { core } = useCore()
const { defaultProject } = usePath()

const projects = toRef(props, 'projects')
const projectList = computed(() => {
  if (projects.value.length) {
    return projects.value.filter((index) => !!core.findProject(index))
  } else {
    return [defaultProject.value]
  }
})

const initialValues = {
  name: '',
  projects: toRaw(projectList),
  description: '',
  visibility: false,
  csvFile: null,
  phraseMatch: false,
  phraseChanges: 0,
  spellingChanges: 0,
  queryList: undefined,
  filters: {
    paths: [],
    tags: [],
    tagsExcluded: [],
    fileTypes: []
  }
}
const name = ref(initialValues.name)
const selectedProjects = ref(projectList.value)
const description = ref(initialValues.description)
const visibility = ref(initialValues.visibility)
const csvFile = ref(initialValues.csvFile)
const phraseMatch = ref(initialValues.phraseMatch)
const phraseChanges = ref(initialValues.phraseChanges)
const spellingChanges = ref(initialValues.spellingChanges)
const paths = ref(initialValues.filters.paths)
const tags = ref(initialValues.filters.tags)
const tagsExcluded = ref(initialValues.filters.tagsExcluded)
const fileTypes = ref(initialValues.filters.fileTypes)
const queryList = ref(initialValues.queryList)

function reset() {
  name.value = initialValues.name
  selectedProjects.value = initialValues.projects
  description.value = initialValues.description
  visibility.value = initialValues.visibility
  csvFile.value = initialValues.csvFile
  phraseMatch.value = initialValues.phraseMatch
  phraseChanges.value = initialValues.phraseChanges
  spellingChanges.value = initialValues.spellingChanges
  paths.value = initialValues.filters.paths
  tags.value = initialValues.filters.tags
  tagsExcluded.value = initialValues.filters.tagsExcluded
  fileTypes.value = initialValues.filters.fileTypes
}
const valid = computed(() => {
  return name.value.trim(' ').length > 0 && csvFile.value !== null
})

function submit(formData) {
  if (valid.value) {
    const form = {
      name: formData.get('name'),
      csvFile: formData.get('csvFile'),
      description: formData.get('description'),
      projects: formData.get('projects').split(','),
      phraseMatch: !!formData.get('phraseMatch'),
      fuzziness:
        formData.get('phraseMatch') === 'true' ? +formData.get('phraseChanges') : +formData.get('spellingChanges'),
      fileTypes: formData.get('fileTypes').length ? formData.get('fileTypes').split(',') : [],
      paths: formData.get('paths').length ? formData.get('paths').split(',') : [],
      published: formData.get('visibility') === 'true',
      queryTemplate: ''
    }
    console.log(form)
  } else {
    console.log('not valid')
  }
}

function colRadiobutton({ option, description }) {
  return `<div class="d-flex gap-3 "><div class="col-radio-button">${option}</div><div class="fw-normal">${description}</div></div>`
}
const phraseMatchDescription = (option, { doubleQuotes, withOperators }) => {
  const searchInDoubleQuotes = doubleQuotes ? t('global.yes') : t('global.no')
  const operatorsApplied = withOperators ? t('global.yes') : t('global.no')
  const description = `${t(
    'task.batch-search.form.phraseMatch.options.searchInDoubleQuotes'
  )}:&nbsp;${searchInDoubleQuotes}.<br/>${t(
    'task.batch-search.form.phraseMatch.options.operatorsApplied'
  )}:&nbsp;${operatorsApplied}.`
  return colRadiobutton({ option, description })
}

const phraseMatchNo = computed(() => {
  return phraseMatchDescription(t('task.batch-search.form.phraseMatch.options.no'), {
    doubleQuotes: false,
    withOperators: true
  })
})
const phraseMatchYes = computed(() => {
  return phraseMatchDescription(t('task.batch-search.form.phraseMatch.options.yes'), {
    doubleQuotes: true,
    withOperators: false
  })
})
const phraseMatchOptions = computed(() => [
  { html: phraseMatchNo.value, value: false },
  { html: phraseMatchYes.value, value: true }
])

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
    section: 'batchSearch',
    preference: 'filter-content-type'
  }
})
const submitLabel = computed(() => t('task.batch-search.form.submit'))
const sections = reactive({
  general: { title: computed(() => t('task.batch-search.form.section.general')), collapse: false },
  queries: { title: computed(() => t('task.batch-search.form.section.queries')), collapse: false },
  search: { title: computed(() => t('task.batch-search.form.section.operators')), collapse: false },
  filters: { title: computed(() => t('task.batch-search.form.section.filters')), collapse: false },
  visibility: { title: computed(() => t('task.batch-search.form.section.visibility')), collapse: false }
})
</script>

<template>
  <form-creation
    class="task-batch-search-form d-flex flex-column gap-4"
    content-class-list="d-flex flex-column gap-3"
    :valid="valid"
    :submit-label="submitLabel"
    @reset="reset"
    @submit="submit"
    @keydown.enter.prevent
  >
    <form-step v-model:collapse="sections.general.collapse" :title="sections.general.title" index="1">
      <form-fieldset-i18n required name="name" translation-key="task.batch-search.form.name">
        <b-form-input
          v-model="name"
          type="text"
          name="name"
          :placeholder="t('task.batch-search.form.name.placeholder')"
        />
      </form-fieldset-i18n>
      <form-fieldset-i18n name="projects" translation-key="task.batch-search.form.projects">
        <search-bar-input-dropdown-for-projects v-model="selectedProjects" />
        <input type="hidden" name="projects" :value="projectNames" />
      </form-fieldset-i18n>
      <form-fieldset-i18n name="description" translation-key="task.batch-search.form.description">
        <b-form-textarea
          v-model="description"
          name="description"
          type="text"
          :placeholder="t('task.batch-search.form.description.placeholder')"
        />
      </form-fieldset-i18n>
      <form-fieldset-i18n name="visibility" force-compact translation-key="task.batch-search.form.visibility">
        <b-form-radio-group
          v-model="visibility"
          name="visibility"
          class="radio-group-col-description"
          :options="visibilityOptions"
          stacked
        />
      </form-fieldset-i18n>
    </form-step>
    <form-step v-model:collapse="sections.queries.collapse" :title="sections.queries.title" index="2"
      ><tab-group>
        <tab-group-entry :title="$t('task.batch-search.form.csvFile.label')">
          <b-form-file
            v-model="csvFile"
            :placeholder="$t('task.batch-search.form.csvFile.placeholder')"
            :state="!!csvFile"
            accept=".csv"
            class="text-truncate"
            name="csvFile"
            no-drop
            required
          ></b-form-file>
          <div class="bg-tertiary-subtle rounded-2 mt-3 p-3">
            <ul class="m-0">
              <li>Only <abbr>CSV</abbr> format is accepted Export your spreadsheet as a CSV using encoding UTF-8</li>
              <li>Your <abbr>CSV</abbr> file should not contain more than 60,000 queries</li>
              <li>The first and only column should contain the terms to search No line break(s) in cells</li>
              <li>
                Selecting 'do phrase matches' prevent from using operators like <code>AND</code>, <code>OR</code>,
                <code>NOT</code>, <code>*</code>, <code>?</code>, <code>!</code>, <code>+</code>, <code>-</code> or
                Regexes (between 2 slashes).
              </li>
            </ul>
          </div>
        </tab-group-entry>
        <tab-group-entry :title="$t('task.batch-search.form.listQueries.label')">
          {{ $t('task.batch-search.form.listQueries.placeholder') }}
          <!--          <table-editable v-model:items="queryList" class="col-6" />-->
        </tab-group-entry>
      </tab-group>
    </form-step>
    <form-step v-model:collapse="sections.search.collapse" :title="sections.search.title" index="3">
      <form-fieldset-i18n name="phraseMatch" translation-key="task.batch-search.form.phraseMatch">
        <b-form-radio-group
          v-model="phraseMatch"
          class="radio-group-col-description"
          name="phraseMatch"
          :options="phraseMatchOptions"
          stacked
        />
      </form-fieldset-i18n>
      <form-fieldset-i18n
        v-if="phraseMatch"
        name="phraseChanges"
        translation-key="task.batch-search.form.phraseChanges"
      >
        <form-control-range v-model="phraseChanges" name="phraseChanges" :min="0" :max="3" :step="1" />
      </form-fieldset-i18n>
      <form-fieldset-i18n v-else name="spellingChanges" translation-key="task.batch-search.form.spellingChanges">
        <form-control-range v-model="spellingChanges" name="spellingChanges" :min="0" :max="5" :step="1" />
      </form-fieldset-i18n>
    </form-step>
    <form-step
      v-model:collapse="sections.filters.collapse"
      class="form-step__filters"
      :title="sections.filters.title"
      index="4"
    >
      <form-fieldset-i18n
        class="form-step-sub-content"
        label-visually-hidden
        name="path"
        translation-key="task.batch-search.form.path"
      >
        <filter-type-path
          :filter="filterPath"
          :projects="projectNames"
          actions-position-title
          hide-contextualize
          hide-exclude
          class="p-3"
          @update="updateFilter"
        />
        <input type="hidden" name="paths" :value="paths" />
      </form-fieldset-i18n>
      <form-fieldset-i18n
        class="form-step-sub-content"
        label-visually-hidden
        name="tags-included"
        translation-key="task.batch-search.form.tag-included"
      >
        <filter-type
          :filter="filterTag"
          :projects="projectNames"
          actions-position-title
          hide-contextualize
          hide-exclude
          class="p-3"
        />
        <input type="hidden" name="tags" :value="tags" />
      </form-fieldset-i18n>
      <form-fieldset-i18n
        label-visually-hidden
        name="tags-excluded"
        class="form-step-sub-content"
        translation-key="task.batch-search.form.tags-excluded"
      >
        <filter-type
          :filter="filterTagExcluded"
          :projects="projectNames"
          actions-position-title
          hide-contextualize
          hide-exclude
          class="p-3"
        />

        <input type="hidden" name="tagsExcluded" :value="tagsExcluded" />
      </form-fieldset-i18n>
      <form-fieldset-i18n
        label-visually-hidden
        class="form-step-sub-content"
        name="content-types"
        translation-key="task.batch-search.form.content-types"
      >
        <filter-type
          :filter="filterContentType"
          :projects="projectNames"
          actions-position-title
          hide-contextualize
          hide-exclude
          class="p-3"
        />
        <input type="hidden" name="fileTypes" :value="fileTypes" />
      </form-fieldset-i18n>
    </form-step>
  </form-creation>
</template>
<style lang="scss">
.task-batch-search-form {
  & .project-dropdown-selector {
    padding: 0;
  }
  & .form-step__filters {
    & .form-step-content {
      background: none;
      padding: 0 !important;
    }
    & .form-step-sub-content {
      padding: 0;
      & .filters-panel-section-filter {
        background: $white;
      }
    }
  }

  .radio-group-col-description {
    .form-check-label {
      width: 100%;
    }
    .col-radio-button {
      flex-shrink: 0;
      flex-basis: 60px;
      &__description {
        text-wrap: pretty;
      }
    }
  }
}
</style>
