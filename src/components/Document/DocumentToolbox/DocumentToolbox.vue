<script setup>
import { computed, toRef, useTemplateRef } from 'vue'
import { useElementBounding } from '@vueuse/core'
import { PaginationTiny } from '@icij/murmur'

import { useCompact } from '@/composables/useCompact'
import DocumentGlobalSearchTerms from '@/components/Document/DocumentGlobalSearchTerms/DocumentGlobalSearchTerms'
import DocumentLocalSearch from '@/components/Document/DocumentLocalSearch/DocumentLocalSearch'
import Hook from '@/components/Hook/Hook'

const search = defineModel({ type: String, default: '' })
const activeIndex = defineModel('activeIndex', { type: Number, default: 0 })
const page = defineModel('page', { type: Number, default: 1 })

const props = defineProps({
  document: {
    type: Object,
    required: true
  },
  occurrences: {
    type: Number,
    default: 0
  },
  totalPages: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean
  },
  disabled: {
    type: Boolean
  },
  noCount: {
    type: Boolean
  },
  targetLanguage: {
    type: String,
    default: null
  },
  compactThreshold: {
    type: Number,
    default: 770
  },
  hookPrefix: {
    type: String,
    default: null
  }
})

const element = useTemplateRef('element')
const { height } = useElementBounding(element)
const { compact } = useCompact(element, { threshold: toRef(props, 'compactThreshold') })

const showPagination = computed(() => props.totalPages > 1)

function hookName(position) {
  return props.hookPrefix ? `${props.hookPrefix}.${position}` : null
}

defineExpose({ height })
</script>

<template>
  <div
    ref="element"
    class="document-toolbox d-flex flex-column gap-3"
  >
    <hook
      v-if="hookPrefix"
      :name="hookName('toolbox:before')"
    />
    <div class="d-flex flex-md-nowrap flex-wrap align-items-center gap-3">
      <hook
        v-if="hookPrefix"
        :name="hookName('toolbox.local-search:before')"
      />
      <document-local-search
        v-model="search"
        v-model:active-index="activeIndex"
        :compact="compact"
        :loading="loading"
        :occurrences="occurrences"
        class="flex-grow-1"
      />
      <hook
        v-if="hookPrefix"
        :name="hookName('toolbox.local-search:after')"
      />
      <hook
        v-if="hookPrefix"
        :name="hookName('toolbox.before:before')"
      />
      <fieldset
        :disabled="disabled"
        class="document-toolbox__controls d-flex flex-grow-1 flex-md-grow-0 flex-nowrap align-items-center gap-2"
      >
        <div
          v-if="showPagination"
          class="document-toolbox__controls__pagination"
        >
          <pagination-tiny
            :key="totalPages"
            v-model="page"
            :per-page="1"
            :total-rows="totalPages"
            :compact="compact"
          />
        </div>
        <hook
          v-if="hookPrefix"
          :name="hookName('toolbox.pagination:after')"
        />
        <slot name="dropdown" />
      </fieldset>
    </div>
    <document-global-search-terms
      :document="document"
      :target-language="targetLanguage"
      :no-count="noCount"
      @select="search = $event"
    />
    <hook
      v-if="hookPrefix"
      :name="hookName('toolbox:after')"
    />
  </div>
</template>

<style lang="scss" scoped>
.document-toolbox {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: $spacer 0;
  background: var(--bs-body-bg);
}
</style>
