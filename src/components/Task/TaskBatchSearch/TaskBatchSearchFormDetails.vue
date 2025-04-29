<script setup>
import { computed } from 'vue'

import FormFieldsetI18n from '@/components/Form/FormFieldset/FormFieldsetI18n'
import FormStep from '@/components/Form/FormStep/FormStep'
import ProjectDropdownSelector from '@/components/Project/ProjectDropdownSelector/ProjectDropdownSelector'
import ModeServerOnly from '@/components/Mode/ModeServerOnly'
import { useCore } from '@/composables/useCore'

const name = defineModel('name', { type: String, required: true })
const description = defineModel('description', { type: String, required: false })
const visibility = defineModel('visibility', { type: Boolean, required: true })
const selectedProjects = defineModel('selectedProjects', { type: Array, required: true })

const { core } = useCore()
const allProjects = computed(() => core.projects)
</script>

<template>
  <form-step :title="$t('task.batch-search.form.sections.general')" :index="1">
    <form-fieldset-i18n required name="name" translation-key="task.batch-search.form.name" :icon="PhTextAa">
      <b-form-input
        v-model="name"
        type="text"
        name="name"
        :placeholder="$t('task.batch-search.form.name.placeholder')"
      />
    </form-fieldset-i18n>
    <form-fieldset-i18n name="projects" translation-key="task.batch-search.form.projects" :icon="PhCirclesThreePlus">
      <project-dropdown-selector v-model="selectedProjects" :projects="allProjects" />
    </form-fieldset-i18n>
    <form-fieldset-i18n name="description" translation-key="task.batch-search.form.description" :icon="PhTextAlignLeft">
      <b-form-textarea
        v-model="description"
        name="description"
        :rows="2"
        :max-rows="8"
        :placeholder="$t('task.batch-search.form.description.placeholder')"
      />
    </form-fieldset-i18n>
    <mode-server-only>
      <form-fieldset-i18n
        name="visibility"
        force-compact
        translation-key="task.batch-search.form.visibility"
        label-class="pt-md-0"
        :icon="PhQuotes"
      >
        <b-form-radio-group v-model="visibility" stacked>
          <b-form-radio name="visibility" :value="false">
            {{ $t('task.batch-search.form.visibility.options.private') }}
          </b-form-radio>
          <b-form-radio name="visibility" :value="true">
            {{ $t('task.batch-search.form.visibility.options.shared') }}
          </b-form-radio>
        </b-form-radio-group>
      </form-fieldset-i18n>
    </mode-server-only>
  </form-step>
</template>
