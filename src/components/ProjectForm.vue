<script>
import { every, cloneDeep, kebabCase } from 'lodash'

import InlineDirectoryPicker from '@/components/InlineDirectoryPicker'
import { slugger, isUrl } from '@/utils/strings'

export default {
  name: 'ProjectForm',
  components: {
    InlineDirectoryPicker
  },
  props: {
    card: {
      type: Boolean
    },
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
      form: {
        name: null,
        label: null,
        sourcePath: this.$config.get('dataDir'),
        description: null,
        logoUrl: null,
        sourceUrl: null,
        publisherName: null,
        maintainerName: null
      }
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
      // Transform to kebab case first to insert a "minus" when input is using camel case
      this.form.name = slugger(kebabCase(label)).toLowerCase()
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
      return value !== null && value !== ''
    },
    isBlank(value) {
      return !this.isPresent(value)
    },
    submit() {
      if (this.valid) {
        this.$emit('submit', cloneDeep(this.form))
      }
    },
    reset() {
      this.$set(this, 'form', {
        name: null,
        label: null,
        sourcePath: this.$config.get('dataDir'),
        allowedMask: '*',
        description: null,
        logoUrl: null,
        sourceUrl: null,
        publisherName: null,
        maintainerName: null
      })
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
        <b-form-textarea v-model="form.description" placeholder="" rows="3" max-rows="8" />
      </b-form-group>
      <b-form-group
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
        type="button"
        class="btn btn-outline-primary mr-3"
        :confirmed="reset"
        :label="$t('projectForm.resetConfirmation')"
      >
        <slot name="reset-text">{{ $t('projectForm.reset') }}</slot>
      </confirm-button>
      <b-button type="submit" variant="primary" class="ml-auto" :disabled="!valid">
        <slot name="submit-text">{{ $t('projectForm.submit') }}</slot>
      </b-button>
    </component>
  </b-form>
</template>
