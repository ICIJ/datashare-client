<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { ButtonIcon } from '@icij/murmur-next'

import IPhPlus from '~icons/ph/plus'

import PathBannersList from '@/components/PathBanner/PathBannersList.vue'
import PathBannersListEntry from '@/components/PathBanner/PathBannersListEntry.vue'
import ProjectViewEditPathBannersModal from './ProjectViewEditPathBannersModal.vue'
import { useConfirmModal } from '@/composables/useConfirmModal.js'
import { useToast } from '@/composables/useToast.js'
import { useWait } from '@/composables/useWait.js'
import PathBannerDescription from '@/components/PathBanner/PathBannerDescription.vue'
import { useDocumentPathBannersStore } from '@/store/modules/documentPathBanners.js'

const props = defineProps({
  name: { type: String }
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { toast } = useToast()
const { waitFor } = useWait()
const { afterConfirmation } = useConfirmModal()
const { pathBanners, fetchPathBanners, deletePathBanner} = useDocumentPathBannersStore()

const banners = computed(() => pathBanners[props.name] ?? [])
const modalBannerIndex = ref(-1)
const bannersLoaded = ref(false)

const selectedBanner = computed(() => modalBannerIndex.value < 0 ? null : banners.value[modalBannerIndex.value])

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

function findBannerIndex(id) {
  return banners.value.findIndex(b => pathHash(b.path) === id)
}
function isNewBannerId(id) {
  return id === 'new'
}
function isKnownBanner(id) {
  return findBannerIndex(id) !== -1
}

function deactivateModalBanner()  {
  modalBannerIndex.value = -1
}

function activateModalBanner(id)  {
  modalBannerIndex.value = findBannerIndex(id)
}

function resolveBannerId(id) {
  if (isNewBannerId(id)) {
    return deactivateModalBanner()
  }

  if (isKnownBanner(id)) {
    return activateModalBanner(id)
  }

  // id defined but unknown (stale) => should close
  if (id) {
    return closeModal()
  }

  return deactivateModalBanner()
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
  const { path } = banners.value[index]
  const to = bannersRoute(pathHash(path))
  router.push(to)
}

const deleteBanner = waitFor(async (index) => {
  const { path } = banners.value[index]
  try {
    await deletePathBanner({project:props.name, path})
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
  await fetchPathBanners({project:props.name})
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
    <path-banner-description 
      class="mt-2"
      persist
      name="project-view-edit-path-banners.description"
    />
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
