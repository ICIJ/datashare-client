<script setup>
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { ButtonIcon } from '@icij/murmur-next'

import AppModal from '@/components/AppModal/AppModal.vue'
import AppOverlay from '@/components/AppOverlay/AppOverlay.vue'
import FormActions from '@/components/Form/FormActions/FormActions.vue'
import PathBannerForm from '@/components/PathBanner/PathBannerForm.vue'
import { useCore } from '@/composables/useCore.js'
import { useToast } from '@/composables/useToast.js'
import { useWait } from '@/composables/useWait.js'
import ButtonReset from '@/components/Button/ButtonReset.vue'

const props = defineProps({
  name: { type: String, required: true },
  banner: { type: Object, default: null },
})

const emit = defineEmits(['banner:save', 'banner:error'])

const { t } = useI18n()
const core = useCore()
const route = useRoute()
const router = useRouter()
const { toast } = useToast()
const { waitFor, isLoading } = useWait()
const bannerFormRef = ref(null)

const isNew = computed(() => route.params.bannerId === 'new')

function defaultBanner() {
  return { path: null, note: '', variant: 'info', blurSensitiveMedia: false }
}

const activeBanner = computed(() => {
  if (isNew.value) {
    return defaultBanner()
  }
  return props.banner
})

const open = computed({
  get: () => !!route.params.bannerId,
  set: (val) => { if (!val) nextTick(closeModal) }
})

const modalTitle = computed(() =>
  isNew.value
    ? t('projectViewEdit.pathBanners.add')
    : t('projectViewEdit.pathBanners.editTitle')
)

function bannersRoute(bannerId) {
  return { name: 'project.view.edit.banners', params: { name: props.name, bannerId } }
}

function closeModal() {
  router.push(bannersRoute(undefined))
}

async function onModalSave(formData) {
  const success = await saveBanner(formData)
  if (success) closeModal()
}

function onModalReset() {
  bannerFormRef.value?.reset()
}

const saveBanner = waitFor(async (formData) => {
  try {
    await core.api.savePathBanner(props.name, formData.path, formData)
    toast.success(t(`projectViewEdit.pathBanners.notify.${isNew.value ? 'create' : 'update'}.succeedBody`))
    emit('banner:save', formData)
    return true
  }
  catch {
    const key = isNew.value ? 'create' : 'update'
    toast.error(t(`projectViewEdit.pathBanners.notify.${key}.failedBody`))
    emit('banner:error', formData.path)
    return false
  }
})
</script>

<template>
  <app-modal
    v-model="open"
    :title="modalTitle"
    size="xl"
  >
    <template #footer>
      <form-actions end>
        <button-icon
          type="button"
          variant="outline-action"
          @click="closeModal"
        >
          {{ t('projectViewEdit.pathBanners.cancel') }}
        </button-icon>
        <button-reset @click="onModalReset" />
        <button-icon
          type="button"
          variant="action"
          :disabled="isLoading || !bannerFormRef?.isValid"
          @click="bannerFormRef?.submit()"
        >
          {{ t('projectViewEdit.pathBanners.save') }}
        </button-icon>
      </form-actions>
    </template>
    <app-overlay :show="isLoading">
      <path-banner-form
        v-if="activeBanner"
        ref="bannerFormRef"
        :banner="activeBanner"
        @save="onModalSave"
      />
    </app-overlay>
  </app-modal>
</template>
