<script setup>
import { computed, onMounted, ref, watch, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { ButtonIcon } from '@icij/murmur-next'

import IPhPlus from '~icons/ph/plus'

import PathBannersList from '@/components/PathBanner/PathBannersList.vue'
import PathBannersListEntry from '@/components/PathBanner/PathBannersListEntry.vue'
import ProjectViewEditPathBannersModal from './ProjectViewEditPathBannersModal.vue'
import { useConfirmModal } from '@/composables/useConfirmModal.js'
import { useCore } from '@/composables/useCore.js'
import { useToast } from '@/composables/useToast.js'
import { useWait } from '@/composables/useWait.js'
import PathBannerDescription from '@/components/PathBanner/PathBannerDescription.vue'
import { useDocumentPathBannersStore } from '@/store/modules/documentPathBanners.js'

const props = defineProps({
  name: { type: String }
})

const { t } = useI18n()
const core = useCore()
const route = useRoute()
const router = useRouter()
const { toast } = useToast()
const { waitFor } = useWait()
const { afterConfirmation } = useConfirmModal()
const pathBannersStore = useDocumentPathBannersStore()

const banners = reactive([])
const modalBannerIndex = ref(-1)
const bannersLoaded = ref(false)

const selectedBanner = computed(() => banners[modalBannerIndex.value] ?? null)

function pathHash(path) {
  let hash = 5381
  for (let i = 0; i < path.length; i++) {
    hash = ((hash << 5) + hash) ^ path.charCodeAt(i)
    hash >>>= 0
  }
  return hash.toString(36)
}

function bannersRoute(bannerId) {
  const name = 'project.view.edit.banners'
  const params = { name: props.name, bannerId }
  return { name, params }
}

function closeModal() {
  router.push(bannersRoute(undefined))
}

function resolveBannerId(newId) {
  if (newId === 'new') {
    modalBannerIndex.value = -1
  }
  else if (newId) {
    const index = banners.findIndex(b => pathHash(b.path) === newId)
    if (index !== -1) {
      modalBannerIndex.value = index
    }
    else {
      closeModal()
    }
  }
  else {
    modalBannerIndex.value = -1
  }
}

watch(
  () => route.params.bannerId,
  (newId) => {
    // Skip until banners are loaded; loadBanners calls resolveBannerId directly
    // after the first fetch so a hard-refresh on an edit URL is handled correctly.
    if (!bannersLoaded.value) return
    resolveBannerId(newId)
  }
)

function openCreateModal() {
  router.push(bannersRoute('new'))
}

function openEditModal(index) {
  const { path } = banners[index]
  const to = bannersRoute(pathHash(path))
  router.push(to)
}

const deleteBanner = waitFor(async (index) => {
  const banner = banners[index]
  try {
    await core.api.deletePathBanner(banner.project.name, banner.path)
    banners.splice(index, 1)
    pathBannersStore.set({ project: props.name, pathBanners: [...banners] })
    toast.success(t('projectViewEdit.pathBanners.notify.delete.succeedBody'))
  }
  catch {
    toast.error(t('projectViewEdit.pathBanners.notify.delete.failedBody'))
  }
})

function confirmDeleteBanner(index) {
  afterConfirmation(() => deleteBanner(index))
}

async function loadBanners() {
  const data = await core.api.getPathBanners(props.name)
  banners.splice(0, banners.length, ...data)
  pathBannersStore.set({ project: props.name, pathBanners: data })
  bannersLoaded.value = true
  resolveBannerId(route.params.bannerId)
}

onMounted(loadBanners)

defineExpose({
  closeModal,
  confirmDeleteBanner,
  loadBanners,
  openCreateModal,
  openEditModal,
  pathHash,
  resolveBannerId,
})
</script>

<template>
  <div class="project-view-edit-path-banners d-flex flex-column gap-2">
    <path-banner-description class="mt-2" />
    <button-icon
      data-testid="add-banner"
      type="button"
      variant="action"
      class="ms-auto"
      :icon-left="IPhPlus"
      @click="openCreateModal"
    >
      {{ t('projectViewEdit.pathBanners.add') }}
    </button-icon>

    <path-banners-list :banners="banners">
      <template #banner-item="{ banner, index }">
        <path-banners-list-entry
          :banner="banner"
          :index="index"
          @banner:edit="openEditModal(index)"
          @banner:delete="confirmDeleteBanner(index)"
        />
      </template>
    </path-banners-list>

    <project-view-edit-path-banners-modal
      :name="name"
      :banner="selectedBanner"
      @banner:save="loadBanners"
    />
  </div>
</template>
