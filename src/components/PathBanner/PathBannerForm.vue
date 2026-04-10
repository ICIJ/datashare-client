<script setup>
import { computed, reactive, watch, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'
import IPhFolderOpen from '~icons/ph/folder-open'
import IPhSwatches from '~icons/ph/swatches'
import IPhTextAa from '~icons/ph/text-aa'
import IPhWarning from '~icons/ph/warning'

import { useCompact } from '@/composables/useCompact'
import FormControlPath from '@/components/Form/FormControl/FormControlPath.vue'
import FormFieldset from '@/components/Form/FormFieldset/FormFieldset.vue'
import VariantDropdown from '@/components/VariantDropdown/VariantDropdown.vue'
import IPhPencilSimple from '~icons/ph/pencil-simple'
import PathBannerPreview from '@/components/PathBanner/PathBannerPreview.vue'

const props = defineProps({
  banner: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save'])

const isValid = computed(() => !!form.path && !!form.note)

function reset() {
  Object.assign(form, props.banner)
}

defineExpose({ submit: () => emit('save', { ...form, variant: form.variant ?? 'info' }), reset, isValid })

const { t } = useI18n()

const bannerFormRef = useTemplateRef('bannerForm')
const { compact } = useCompact(bannerFormRef, { threshold: 990 })

const form = reactive({ ...props.banner })

watch(
  () => props.banner,
  (newBanner) => {
    Object.assign(form, newBanner)
  }
)
</script>

<template>
  <b-form
    ref="bannerForm"
    class="path-banner-form"
  >
    <form-fieldset
      :compact="compact"
      :icon="IPhFolderOpen"
      :label="t('projectViewEdit.pathBanners.fields.path.label')"
      :description="t('projectViewEdit.pathBanners.fields.path.description')"
      with-description
    >
      <form-control-path v-model="form.path" />
    </form-fieldset>
    <form-fieldset
      :compact="compact"
      :icon="IPhTextAa"
      required
      :label="t('projectViewEdit.pathBanners.fields.text.label')"
    >
      <b-form-textarea
        v-model="form.note"
        name="bannerNote"
        :placeholder="t('projectViewEdit.pathBanners.fields.text.placeholder')"
        rows="2"
      />
      <div
        v-if="form.blurSensitiveMedia"
        class="ms-auto"
      >
        <button-icon
          :icon-left="IPhPencilSimple"
          variant="link"
          size="sm"
          :label="t('projectViewEdit.pathBanners.fields.text.useDefaultText')"
          @click="form.note=t('dismissableContentWarningToggler.description')"
        />
      </div>
    </form-fieldset>
    <form-fieldset
      :compact="compact"
      :icon="IPhWarning"
      :description="t('projectViewEdit.pathBanners.fields.sensitiveContent.description')"
      :label="t('projectViewEdit.pathBanners.fields.sensitiveContent.label')"
      class="flex-shrink-0 text-body-secondary"
    >
      <b-form-radio-group
        v-model="form.blurSensitiveMedia"
        name="blurSensitiveMedia"
      >
        <b-form-radio :value="false">
          {{ t('global.no') }}
        </b-form-radio>
        <b-form-radio :value="true">
          {{ t('global.yes') }}
        </b-form-radio>
      </b-form-radio-group>
    </form-fieldset>
    <form-fieldset
      :compact="compact"
      :icon="IPhSwatches"
      :label="t('projectViewEdit.pathBanners.fields.variant.label')"
    >
      <variant-dropdown
        v-model="form.variant"
        show-label
      />
    </form-fieldset>
    <path-banner-preview
      v-model="form.note"
      v-model:variant="form.variant"
      v-model:sensitive="form.blurSensitiveMedia"
      :path="form.path"
      :placeholder="t('projectViewEdit.pathBanners.fields.text.placeholder')"
    />
  </b-form>
</template>

<style scoped lang="scss"></style>
