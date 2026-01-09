<script setup>
import { computed, ref, watch } from 'vue'
import { cloneDeep, every, kebabCase } from 'lodash'
import { useI18n } from 'vue-i18n'

import IPhTextAa from '~icons/ph/text-aa'
import IPhTextAlignLeft from '~icons/ph/text-align-left'
import IPhFolderOpen from '~icons/ph/folder-open'
import IPhImage from '~icons/ph/image'
import IPhUserSquare from '~icons/ph/user-square'
import IPhLink from '~icons/ph/link'

import FormCreation from '@/components/Form/FormCreation'
import FormControlPath from '@/components/Form/FormControl/FormControlPath'
import FormFieldset from '@/components/Form/FormFieldset/FormFieldset'
import { isUrl, slugger } from '@/utils/strings'
import { useCore } from '@/composables/useCore'

const props = defineProps({
  disabled: {
    type: Boolean
  },
  values: {
    type: Object,
    default: () => ({})
  },
  edit: {
    type: Boolean
  }
})

const emit = defineEmits(['submit'])

const { t } = useI18n()
const core = useCore()

const form = ref(initialFormValues())

function isReservedWord(value) {
  const reserved = ['new', 'edit']
  return reserved.includes(value.toLowerCase())
}

function isPresent(value) {
  return value?.trim()?.length > 0
}

function isBlank(value) {
  return !isPresent(value)
}

function submit() {
  if (valid.value) {
    emit('submit', cloneDeep(form.value))
  }
}

function initialFormValues() {
  return {
    name: null,
    label: null,
    sourcePath: core.getDefaultDataDir(),
    allowFromMask: '*.*.*.*',
    description: null,
    logoUrl: null,
    sourceUrl: null,
    publisherName: null,
    maintainerName: null,
    creationDate: new Date(),
    ...props.values
  }
}

function reset() {
  form.value = initialFormValues()
}

const valid = computed(() => {
  return every([
    !props.disabled,
    isPresent(form.value.name),
    isPresent(form.value.label) && !isReservedWord(form.value.label),
    !isPresent(form.value.sourceUrl) || isUrl(form.value.sourceUrl),
    !isPresent(form.value.logoUrl) || isUrl(form.value.logoUrl)
  ])
})

watch(
  () => form.value.label,
  (label) => {
    if (!props.edit) {
      form.value.name = slugger(kebabCase(label)).toLowerCase()
    }
  }
)
const resetLabel = computed(() => t('projectForm.reset'))
const submitLabel = computed(() => t('projectForm.submit'))
</script>

<template>
  <form-creation
    :valid="valid"
    :reset-label="resetLabel"
    :submit-label="submitLabel"
    @reset="reset"
    @submit="submit"
  >
    <div>
      <form-fieldset
        class="project-form__group project-form__group--label"
        :icon="IPhTextAa"
        required
        :label="t('projectForm.form.label.label')"
        :invalid-feedback="t('projectForm.form.label.invalidFeedback', { label: form.label })"
        :disabled="disabled"
        :validated="isPresent(form.label) && !isReservedWord(form.label)"
      >
        <b-form-input
          v-model="form.label"
          name="label"
          type="text"
          required
          :placeholder="t('projectForm.form.label.placeholder')"
          :state="isBlank(form.label) ? null : !isReservedWord(form.label)"
        />
      </form-fieldset>
      <form-fieldset
        class="project-form__group project-form__group--name"
        :icon="IPhTextAa"
        :label="t('projectForm.form.name.label')"
        :disabled="disabled"
      >
        <b-form-input
          v-model="form.name"
          name="name"
          type="text"
          :placeholder="t('projectForm.form.name.placeholder')"
          required
          disabled
          readonly
        />
      </form-fieldset>
      <form-fieldset
        class="project-form__group project-form__group--description"
        :icon="IPhTextAlignLeft"
        :label="t('projectForm.form.description.label')"
        :disabled="disabled"
        :validated="isPresent(form.description)"
      >
        <b-form-textarea
          v-model="form.description"
          name="description"
          :placeholder="t('projectForm.form.description.placeholder')"
          rows="3"
          max-rows="8"
        />
      </form-fieldset>
      <form-fieldset
        v-if="!edit"
        class="project-form__group project-form__group--source-path"
        required
        :icon="IPhFolderOpen"
        :label="t('projectForm.form.sourcePath.label')"
        :disabled="disabled"
        :validated="isPresent(form.sourcePath)"
      >
        <form-control-path
          v-model="form.sourcePath"
          class="p-0"
        />
      </form-fieldset>
      <form-fieldset
        class="project-form__group project-form__group--logo-url"
        :icon="IPhImage"
        :label="t('projectForm.form.logoUrl.label')"
        :disabled="disabled"
        :validated="isUrl(form.logoUrl)"
      >
        <b-form-input
          v-model="form.logoUrl"
          :state="isBlank(form.logoUrl) ? null : isUrl(form.logoUrl)"
          name="logoUrl"
          type="url"
          :placeholder="t('projectForm.form.logoUrl.placeholder')"
        />
      </form-fieldset>
      <form-fieldset
        class="project-form__group project-form__group--maintainer-name"
        :icon="IPhUserSquare"
        :label="t('projectForm.form.maintainerName.label')"
        :disabled="disabled"
        :validated="isPresent(form.maintainerName)"
      >
        <b-form-input
          v-model="form.maintainerName"
          name="maintainerName"
          type="text"
          :placeholder="t('projectForm.form.maintainerName.placeholder')"
        />
      </form-fieldset>
      <form-fieldset
        class="project-form__group project-form__group--publisher-name"
        :icon="IPhUserSquare"
        :label="t('projectForm.form.publisherName.label')"
        :disabled="disabled"
        :validated="isPresent(form.publisherName)"
      >
        <b-form-input
          v-model="form.publisherName"
          name="publisherName"
          type="text"
          :placeholder="t('projectForm.form.publisherName.placeholder')"
        />
      </form-fieldset>
      <form-fieldset
        class="project-form__group project-form__group--source-url"
        :icon="IPhLink"
        :label="t('projectForm.form.sourceUrl.label')"
        :disabled="disabled"
        :validated="isUrl(form.sourceUrl)"
      >
        <b-form-input
          v-model="form.sourceUrl"
          name="sourceUrl"
          type="url"
          :placeholder="t('projectForm.form.sourceUrl.placeholder')"
          :state="isBlank(form.sourceUrl) ? null : isUrl(form.sourceUrl)"
        />
      </form-fieldset>
    </div>
    <template #submit-text>
      <slot name="submit-text" />
    </template>
  </form-creation>
</template>
