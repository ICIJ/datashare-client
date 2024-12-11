<script setup>
import { computed, ref, toRef, reactive } from 'vue'
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
const selectedProjects = ref(projectList.value)

const name = ref('')
const description = ref('')
const csvFile = ref(null)
const phraseMatch = ref(true)

function colRadiobutton({ option, description }) {
  return `<div class="d-flex gap-3 "><div class="col-radio-button">${option}</div><div class="fw-normal ">${description}</div></div>`
}
const phraseMatchDescription = (option, { doubleQuotes, withOperators }) => {
  const searchInDoubleQuotes = doubleQuotes ? t('global.yes') : t('global.no')
  const operatorsApplied = withOperators ? t('global.yes') : t('global.no')
  const description = `${t(
    'task.batch-search.form.phraseMatch.options.searchInDoubleQuotes'
  )}: ${searchInDoubleQuotes}.<br/>${t(
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
const phraseChanges = ref(0)
const spellingChanges = ref(0)
/* const paths = ref([]) */
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
const visibility = ref(true)
const visibilityOptions = computed(() => [
  {
    html: colRadiobutton({
      option: t('task.batch-search.form.visibility.options.shared'),
      description: t('task.batch-search.form.visibility.options.sharedDescription')
    }),
    value: true
  },
  {
    html: colRadiobutton({
      option: t('task.batch-search.form.visibility.options.private'),
      description: t('task.batch-search.form.visibility.options.privateDescription')
    }),
    value: false
  }
])

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
  >
    <form-step v-model:collapse="sections.general.collapse" :title="sections.general.title" index="1">
      <form-fieldset-i18n name="name" translation-key="task.batch-search.form.name">
        <b-form-input v-model="name" type="text" :placeholder="t('task.batch-search.form.name.placeholder')" />
      </form-fieldset-i18n>
      <form-fieldset-i18n name="projects" translation-key="task.batch-search.form.projects">
        <search-bar-input-dropdown-for-projects v-model="selectedProjects" />
      </form-fieldset-i18n>
      <form-fieldset-i18n name="description" translation-key="task.batch-search.form.description">
        <b-form-textarea
          v-model="description"
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
    <form-step v-model:collapse="sections.queries.collapse" :title="sections.queries.title" index="2">
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
      </form-fieldset-i18n>
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
        <form-control-range v-model="phraseChanges" :min="0" :max="3" :step="1" />
      </form-fieldset-i18n>
      <form-fieldset-i18n v-else name="spellingChanges" translation-key="task.batch-search.form.spellingChanges">
        <form-control-range v-model="spellingChanges" :min="0" :max="5" :step="1" />
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
        <filter-type-path :filter="filterPath" :projects="projectNames" />
      </form-fieldset-i18n>
      <form-fieldset-i18n
        class="form-step-sub-content"
        label-visually-hidden
        name="tags-included"
        translation-key="task.batch-search.form.tag-included"
      >
        <filter-type :filter="filterTag" :projects="projectNames" />
      </form-fieldset-i18n>
      <form-fieldset-i18n
        label-visually-hidden
        name="tags-excluded"
        class="form-step-sub-content"
        translation-key="task.batch-search.form.tags-excluded"
      >
        <filter-type :filter="filterTagExcluded" :projects="projectNames" />
      </form-fieldset-i18n>
      <form-fieldset-i18n
        label-visually-hidden
        class="form-step-sub-content"
        name="content-types"
        translation-key="task.batch-search.form.content-types"
      >
        <filter-type :filter="filterContentType" :projects="projectNames" />
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
    & .form-step-sub-content .filters-panel-section-filter {
      background: $white;
    }
  }

  .radio-group-col-description {
    .form-check-label {
      width: 100%;
    }
    .col-radio-button {
      flex-basis: 60px;
    }
  }
}
</style>
