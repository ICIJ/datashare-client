<script setup>
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { isEmpty } from 'lodash'
import { useRouter } from 'vue-router'

import image from '@/assets/images/illustrations/app-modal-saved-search-naming-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-saved-search-naming-dark.svg'
import AppModal from '@/components/AppModal/AppModal'
import FormFieldset from '@/components/Form/FormFieldset/FormFieldset'
import { useCore } from '@/composables/useCore'
import { useSearchSaving } from '@/composables/useSearchSaving'

const { event } = defineProps({
  event: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['success', 'error'])
const form = reactive({ name: event?.name ?? '' })
const router = useRouter()
const { toast } = useCore()
const { save } = useSearchSaving()
const { t } = useI18n()

const validName = computed(() => !isEmpty(form.name))
const valid = computed(() => validName.value)

async function confirmSaving() {
  try {
    await save({ ...event, ...form })
    const { href } = router.resolve({ name: 'search.saved.list' })
    const body = t('searchSavingModal.success')
    const linkLabel = t('searchSavingModal.seeAll')
    toast.success(body, { href, linkLabel })
    emit('success')
  } catch (_) {
    toast.error(t('searchSavingModal.danger'))
    emit('error')
  }
}
</script>

<template>
  <app-modal
    :ok-title="$t('searchSavingModal.okTitle')"
    :ok-disabled="!valid"
    :image="image"
    :image-dark="imageDark"
    :image-width="110"
    :title="$t('searchSavingModal.title')"
    size="410px"
    @ok="confirmSaving"
  >
    <template #default="{ close }">
      <form @submit.prevent="confirmSaving().then(close)">
        <form-fieldset :label="$t('searchSavingModal.form.name')" :icon="PhTextAa" label-visually-hidden>
          <div class="col">
            <b-form-input v-model="form.name" name="name" type="text" autofocus required class="mb-3" />
            <i18n-t keypath="searchSavingModal.form.description" tag="p">
              <template #link>
                <router-link :to="{ name: 'search.saved.list' }">
                  <i18n-t keypath="searchSavingModal.form.link" />
                </router-link>
              </template>
            </i18n-t>
          </div>
        </form-fieldset>
      </form>
    </template>
  </app-modal>
</template>
7
