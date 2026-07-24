<script setup>
import { computed, ref } from 'vue'
import { orderBy } from 'lodash'
import { useI18n } from 'vue-i18n'

import EmptyState from '@/components/EmptyState/EmptyState.vue'
import PageTable from '@/components/PageTable/PageTable.vue'
import PageTableTh from '@/components/PageTable/PageTableTh.vue'

const props = defineProps({
  banners: {
    type: Array,
    default: () => []
  }
})

const { t } = useI18n()

const sort = ref(null)
const order = ref('asc')

const sortedBanners = computed(() => {
  const indexed = props.banners.map((banner, index) => ({ banner, index }))
  if (!sort.value) return indexed
  return orderBy(indexed, [({ banner }) => banner[sort.value]], [order.value])
})
</script>

<template>
  <div class="path-banners-list">
    <empty-state
      v-if="banners.length === 0"
      :label="t('projectViewEdit.pathBanners.empty')"
    />
    <page-table
      v-else
      v-model:sort="sort"
      v-model:order="order"
    >
      <template #thead>
        <page-table-th
          sortable
          name="variant"
          :label="t('projectViewEdit.pathBanners.fields.variant.label')"
        />
        <page-table-th
          emphasis
          sortable
          name="path"
          :label="t('projectViewEdit.pathBanners.fields.path.label')"
        />
        <page-table-th
          name="note"
          :label="t('projectViewEdit.pathBanners.fields.text.label')"
        />
        <page-table-th
          compact
          hide-label
          :label="t('projectViewEdit.pathBanners.edit')"
        />
      </template>
      <template
        v-for="{ banner, index } in sortedBanners"
        :key="banner.path ?? index"
      >
        <slot
          name="banner-item"
          v-bind="{ banner, index }"
        />
      </template>
    </page-table>
  </div>
</template>
