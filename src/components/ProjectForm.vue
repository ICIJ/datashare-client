<script>
import { every, cloneDeep, kebabCase } from 'lodash'

import InlineDirectoryPicker from '@/components/InlineDirectoryPicker'
import { slugger, isUrl } from '@/utils/strings'

/**
 * Build project form (to create or edit a project).
 */
export default {
  name: 'ProjectForm',
  components: {
    InlineDirectoryPicker
  },
  props: {
    /**
     * Display the form in a card
     */
    card: {
      type: Boolean
    },
    /**
     * Disable all inputs
     */
    disabled: {
      type: Boolean
    },
    /**
     * Default values of the form
     */
    values: {
      type: Object,
      default: () => ({})
    },
    /**
     * Freeze name and sourcePath in edit mode
     */
    edit: {
      type: Boolean
    },
    /**
     * Show delete project button
     */
    showDeleteButton: {
      type: Boolean
    }
  },
  data() {
    return {
      form: this.initialFormValues()
    }
  },
  computed: {
    bodyComponent() {
      return this.card ? 'b-card-body' : 'div'
    },
    footerComponent() {
      return this.card ? 'b-card-footer' : 'div'
    },
    classList() {
      return this.card ? ['card'] : []
    },
    valid() {
      return every([
        !this.disabled,
        this.isPresent(this.form.name),
        this.isPresent(this.form.label) && !this.isReservedWord(this.form.label),
        !this.isPresent(this.form.sourceUrl) || this.isUrl(this.form.sourceUrl),
        !this.isPresent(this.form.logoUrl) || this.isUrl(this.form.logoUrl)
      ])
    }
  },
  watch: {
    'form.label': function (label) {
      // The name cannot change when `edit` is set
      if (!this.edit) {
        // Transform to kebab case first to insert a "minus" when input is using camel case
        this.form.name = slugger(kebabCase(label)).toLowerCase()
      }
    }
  },
  methods: {
    isReservedWord(value) {
      const reserved = ['new', 'edit', 'delete']
      return reserved.includes(value.toLowerCase())
    },
    isUrl(value) {
      return isUrl(value)
    },
    isPresent(value) {
      return value?.trim()?.length > 0
    },
    isBlank(value) {
      return !this.isPresent(value)
    },
    submit() {
      if (this.valid) {
        this.$emit('submit', cloneDeep(this.form))
      }
    },
    initialFormValues() {
      return {
        name: null,
        label: null,
        sourcePath: this.$config.get('dataDir'),
        allowFromMask: '*.*.*.*',
        description: null,
        logoUrl: null,
        sourceUrl: null,
        publisherName: null,
        maintainerName: null,
        // Merge with this propertiy to be able to initialize
        // the form with an existing project
        ...this.values
      }
    },
    reset() {
      this.$set(this, 'form', this.initialFormValues())
    },
    emitDelete() {
      this.$emit('delete', this.values.name)
    }
  }
}
</script>

<template>
  <b-form class="project-form" :class="classList" novalidate @submit.stop.prevent="submit">
    <component :is="bodyComponent">
      <b-form-row>
        <b-col>
          <b-form-group
            class="project-form__group project-form__group--label"
            :invalid-feedback="$t('projectForm.form.label.invalidFeedback', { label: form.label })"
            :label="$t('projectForm.form.label.label')"
            :description="$t('projectForm.form.label.description')"
            :disabled="disabled"
            :validated="isPresent(form.label) && !isReservedWord(form.label)"
          >
            <b-form-input
              v-model="form.label"
              name="label"
              type="text"
              placeholder=""
              required
              :state="isBlank(form.label) ? null : !isReservedWord(form.label)"
            />
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            :label="$t('projectForm.form.name.label')"
            :description="$t('projectForm.form.name.description')"
            :disabled="disabled"
          >
            <b-form-input v-model="form.name" name="name" type="text" placeholder="" required readonly />
          </b-form-group>
        </b-col>
      </b-form-row>
      <b-form-group
        class="project-form__group project-form__group--name"
        :label="$t('projectForm.form.description.label')"
        :description="$t('projectForm.form.description.description')"
        :disabled="disabled"
        :validated="isPresent(form.description)"
      >
        <b-form-textarea v-model="form.description" name="description" placeholder="" rows="3" max-rows="8" />
      </b-form-group>
      <b-form-group
        v-if="!edit"
        class="project-form__group project-form__group--source-path"
        :label="$t('projectForm.form.sourcePath.label')"
        :description="$t('projectForm.form.sourcePath.description')"
        :disabled="disabled"
        :validated="isPresent(form.sourcePath)"
      >
        <inline-directory-picker v-model="form.sourcePath" />
      </b-form-group>
      <b-form-group
        class="project-form__group project-form__group--logo-url"
        :label="$t('projectForm.form.logoUrl.label')"
        :description="$t('projectForm.form.logoUrl.description')"
        :disabled="disabled"
        :validated="isUrl(form.logoUrl)"
      >
        <b-form-input
          v-model="form.logoUrl"
          :state="isBlank(form.logoUrl) ? null : isUrl(form.logoUrl)"
          name="logoUrl"
          type="url"
          placeholder="https://..."
        />
      </b-form-group>
      <b-form-group
        class="project-form__group project-form__group--maintainer-name"
        :label="$t('projectForm.form.maintainerName.label')"
        :description="$t('projectForm.form.maintainerName.description')"
        :disabled="disabled"
        :validated="isPresent(form.maintainerName)"
      >
        <b-form-input v-model="form.maintainerName" name="maintainerName" type="text" placeholder="" />
      </b-form-group>
      <b-form-row>
        <b-col>
          <b-form-group
            class="project-form__group project-form__group--publisher-name"
            :label="$t('projectForm.form.publisherName.label')"
            :description="$t('projectForm.form.publisherName.description')"
            :disabled="disabled"
            :validated="isPresent(form.publisherName)"
          >
            <b-form-input v-model="form.publisherName" name="publisherName" type="text" placeholder="" />
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            class="project-form__group project-form__group--source-url"
            :label="$t('projectForm.form.sourceUrl.label')"
            :description="$t('projectForm.form.sourceUrl.description')"
            :disabled="disabled"
            :validated="isUrl(form.sourceUrl)"
          >
            <b-form-input
              v-model="form.sourceUrl"
              name="sourceUrl"
              type="url"
              placeholder="https://..."
              :state="isBlank(form.sourceUrl) ? null : isUrl(form.sourceUrl)"
            />
          </b-form-group>
        </b-col>
      </b-form-row>
    </component>
    <component :is="footerComponent" class="d-flex">
      <confirm-button
        v-if="showDeleteButton"
        type="button"
        class="project-form__action--delete btn btn-danger mr-3"
        :confirmed="emitDelete"
        :label="$t('projectForm.deleteConfirmation')"
      >
        <slot name="delete-text">{{ $t('projectForm.delete') }}</slot>
      </confirm-button>
      <confirm-button
        type="button"
        class="project-form__action--reset btn btn-outline-primary ml-auto"
        :confirmed="reset"
        :label="$t('projectForm.resetConfirmation')"
      >
        <slot name="reset-text">{{ $t('projectForm.reset') }}</slot>
      </confirm-button>
      <b-button type="submit" variant="primary" class="ml-2" :disabled="!valid">
        <slot name="submit-text">{{ $t('projectForm.submit') }}</slot>
      </b-button>
    </component>
  </b-form>
</template>
