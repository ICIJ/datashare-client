<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

import AppModal from '@/components/AppModal/AppModal'
import FormFieldset from '@/components/Form/FormFieldset/FormFieldset'
import { useCore } from '@/composables/core'
import { useSearchSaving } from '@/composables/search-saving'

const emit = defineEmits(['success', 'error'])
const form = reactive({ name: '' })
const { toast } = useCore()
const { save } = useSearchSaving()
const { t } = useI18n()

async function confirmSaving() {
  try {
    await save(form)
    toast.success(t('searchSavingModal.success'))
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
    :title="$t('searchSavingModal.title')"
    size="lg"
    @ok="confirmSaving"
  >
    <template #default="{ close }">
      <form @submit.prevent="confirmSaving().then(close)">
        <form-fieldset :label="$t('searchSavingModal.form.name')" :icon="PhTextAa">
          <div class="col">
            <b-form-input v-model="form.name" name="name" type="text" required class="mb-3" />
            <i18n-t keypath="searchSavingModal.form.description" tag="p">
              <template #link>
                <router-link :to="{ name: 'user-history.saved-search.list' }">
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
