<script setup>
import { ref, watch, computed } from 'vue'
import { every, cloneDeep, kebabCase } from 'lodash'

import FormControlPath from '@/components/Form/FormControl/FormControlPath'
import ButtonIcon from '@/components/Button/ButtonIcon'
import FormFieldset from '@/components/Form/FormFieldset/FormFieldset'
import { slugger, isUrl } from '@/utils/strings'
import { useCore } from '@/composables/core'

// Props
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
  },
  showDeleteButton: {
    type: Boolean
  }
})

const emit = defineEmits(['submit', 'delete'])

const { core } = useCore()

const form = ref(initialFormValues())

function isReservedWord(value) {
  const reserved = ['new', 'edit', 'delete']
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
    sourcePath: core.config.get('dataDir'),
    allowFromMask: '*.*.*.*',
    description: null,
    logoUrl: null,
    sourceUrl: null,
    publisherName: null,
    maintainerName: null,
    ...props.values
  }
}

function reset() {
  form.value = initialFormValues()
}

function emitDelete() {
  emit('delete', props.values.name)
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
</script>

<template>
  <b-form class="project-form" novalidate @submit.stop.prevent="submit">
    <div>
      <form-fieldset
        class="project-form__group project-form__group--label"
        icon="text-aa"
        required
        :label="$t('projectForm.form.label.label')"
        :invalid-feedback="$t('projectForm.form.label.invalidFeedback', { label: form.label })"
        :disabled="disabled"
        :validated="isPresent(form.label) && !isReservedWord(form.label)"
      >
        <b-form-input
          v-model="form.label"
          name="label"
          type="text"
          required
          :placeholder="$t('projectForm.form.label.placeholder')"
          :state="isBlank(form.label) ? null : !isReservedWord(form.label)"
        />
      </form-fieldset>
      <form-fieldset
        class="project-form__group project-form__group--name"
        icon="text-aa"
        :label="$t('projectForm.form.name.label')"
        :disabled="disabled"
      >
        <b-form-input
          v-model="form.name"
          name="name"
          type="text"
          :placeholder="$t('projectForm.form.name.placeholder')"
          required
          readonly
        />
      </form-fieldset>
      <form-fieldset
        class="project-form__group project-form__group--description"
        icon="text-align-left"
        :label="$t('projectForm.form.description.label')"
        :disabled="disabled"
        :validated="isPresent(form.description)"
      >
        <b-form-textarea
          v-model="form.description"
          name="description"
          :placeholder="$t('projectForm.form.description.placeholder')"
          rows="3"
          max-rows="8"
        />
      </form-fieldset>
      <form-fieldset
        v-if="!edit"
        class="project-form__group project-form__group--source-path"
        required
        icon="folder-open"
        :label="$t('projectForm.form.sourcePath.label')"
        :disabled="disabled"
        :validated="isPresent(form.sourcePath)"
      >
        <form-control-path v-model="form.sourcePath" />
      </form-fieldset>
      <form-fieldset
        class="project-form__group project-form__group--logo-url"
        icon="image"
        :label="$t('projectForm.form.logoUrl.label')"
        :disabled="disabled"
        :validated="isUrl(form.logoUrl)"
      >
        <b-form-input
          v-model="form.logoUrl"
          :state="isBlank(form.logoUrl) ? null : isUrl(form.logoUrl)"
          name="logoUrl"
          type="url"
          :placeholder="$t('projectForm.form.logoUrl.placeholder')"
        />
      </form-fieldset>
      <form-fieldset
        class="project-form__group project-form__group--maintainer-name"
        icon="user-square"
        :label="$t('projectForm.form.maintainerName.label')"
        :disabled="disabled"
        :validated="isPresent(form.maintainerName)"
      >
        <b-form-input
          v-model="form.maintainerName"
          name="maintainerName"
          type="text"
          :placeholder="$t('projectForm.form.maintainerName.placeholder')"
        />
      </form-fieldset>
      <form-fieldset
        class="project-form__group project-form__group--publisher-name"
        icon="user-square"
        :label="$t('projectForm.form.publisherName.label')"
        :disabled="disabled"
        :validated="isPresent(form.publisherName)"
      >
        <b-form-input
          v-model="form.publisherName"
          name="publisherName"
          type="text"
          :placeholder="$t('projectForm.form.publisherName.placeholder')"
        />
      </form-fieldset>
      <form-fieldset
        class="project-form__group project-form__group--source-url"
        icon="link"
        :label="$t('projectForm.form.sourceUrl.label')"
        :disabled="disabled"
        :validated="isUrl(form.sourceUrl)"
      >
        <b-form-input
          v-model="form.sourceUrl"
          name="sourceUrl"
          type="url"
          :placeholder="$t('projectForm.form.sourceUrl.placeholder')"
          :state="isBlank(form.sourceUrl) ? null : isUrl(form.sourceUrl)"
        />
      </form-fieldset>
    </div>
    <div class="d-flex">
      <confirm-button
        v-if="showDeleteButton"
        type="button"
        class="project-form__action--delete btn btn-danger me-3"
        :confirmed="emitDelete"
        :label="$t('projectForm.deleteConfirmation')"
      >
        <fa icon="trash-can" class="me-1" />
        <slot name="delete-text">{{ $t('projectForm.delete') }}</slot>
      </confirm-button>
      <button-icon
        type="button"
        variant="outline-light"
        icon-left="arrow-counter-clockwise"
        class="project-form__action--reset btn btn-outline-action ms-auto"
        :label="$t('projectForm.reset')"
        @click="reset"
      >
        <slot name="reset-text" />
      </button-icon>
      <b-button type="submit" variant="action" class="ms-2" :disabled="!valid">
        <slot name="submit-text">{{ $t('projectForm.submit') }}</slot>
      </b-button>
    </div>
  </b-form>
</template>
