<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete.vue'
import ButtonRowActionEdit from '@/components/Button/ButtonRowAction/ButtonRowActionEdit.vue'
import PageTableTdActions from '@/components/PageTable/PageTableTdActions.vue'
import PageTableToggleDetailsButton from '@/components/PageTable/PageTableToggleDetailsButton.vue'
import PageTableTr from '@/components/PageTable/PageTableTr.vue'
import PathBanner from '@/components/PathBanner/PathBanner.vue'
import DisplayStatus from '@/components/Display/DisplayStatus.vue'
import { variantOptions } from '@/enums/variants.js'
import IPhEyeSlash from '~icons/ph/eye-slash'
import { BTd } from 'bootstrap-vue-next'

const props = defineProps({
  index: { type: Number, default: 0 },
  banner: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['banner:edit', 'banner:delete'])

const { t } = useI18n()

const showDetails = ref(false)
const variant = computed(() => variantOptions[props.banner.variant])
const sensitiveVariant = { key: 'variant.sensitive', icon: IPhEyeSlash }
</script>

<template>
  <page-table-tr data-testid="banner-card">
    <b-td class="d-flex gap-2">
      <display-status
        :value="banner.variant"
        :title="t(variant.key)"
      />
      <display-status
        v-if="banner.blurSensitiveMedia"
        variant="primary"
        :icon="sensitiveVariant.icon"
        :title="t(sensitiveVariant.key)"
      />
    </b-td>
    <b-td>
      <code class="small">{{ banner.path }}</code>
    </b-td>
    <b-td
      class="text-truncate"
      style="max-width: 18rem"
    >
      <span class="text-muted small">{{ banner.note || '-' }}</span>
    </b-td>
    <page-table-td-actions>
      <button-row-action-edit @click="emit('banner:edit', index)" />
      <button-row-action-delete @click="emit('banner:delete', index)" />
      <page-table-toggle-details-button v-model="showDetails" />
    </page-table-td-actions>
  </page-table-tr>
  <tr
    v-if="showDetails"
    class="d-none"
    aria-hidden="true"
    role="presentation"
  />
  <page-table-tr v-if="showDetails">
    <td colspan="4">
      <path-banner
        :path="banner.path"
        :note="banner.note"
        :variant="banner.variant"
        :sensitive="banner.blurSensitiveMedia"
      />
    </td>
  </page-table-tr>
</template>
