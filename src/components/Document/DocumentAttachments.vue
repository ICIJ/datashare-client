<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import bodybuilder from 'bodybuilder'
import { PhosphorIcon } from '@icij/murmur-next'
import { flatten, get, sum } from 'lodash'
import { useI18n } from 'vue-i18n'

import EsDocList from '@/api/resources/EsDocList'
import { useWait } from '@/composables/useWait'
import { useCore } from '@/composables/useCore'

/**
 * A list of attachments for a document (usually, it's child documents)
 */
const props = defineProps({
  /**
   * The selected document
   */
  document: {
    type: Object,
    default: () => ({})
  }
})

const { t } = useI18n()
const wait = useWait()
const { core } = useCore()

const pages = ref([])
const size = ref(50)

const attachments = computed(() => {
  return flatten(pages.value.map(page => page.hits))
})

const total = computed(() => {
  return get(pages.value, '0.total', null)
})

const from = computed(() => {
  return sum(pages.value.map(page => page.hits.length))
})

const isReady = computed(() => {
  return !wait.waiting('document-attachments')
})

const hasAttachments = computed(() => {
  return !!attachments.value.length
})

function searchBody() {
  return bodybuilder()
    .query('match', 'type', 'Document')
    .query('match', 'extractionLevel', props.document.extractionLevel + 1)
    .query('match', '_routing', props.document.id)
    .rawOption('_source', { includes: ['*'], excludes: ['content'] })
    .from(from.value)
    .size(size.value)
}

async function loadMore() {
  wait.start('document-attachments')
  const { index } = props.document
  const body = searchBody().build()
  try {
    const response = await core.api.elasticsearch.search({ index, body })
    pages.value.push(new EsDocList(response))
  }
  finally {
    wait.end('document-attachments')
  }
}

onBeforeMount(() => {
  return loadMore()
})
</script>

<template>
  <div
    v-if="isReady && hasAttachments"
    class="document-attachments"
  >
    <h6>{{ t('document.attachments.heading', total, { total }) }}</h6>
    <ul class="document-attachments__list list-unstyled d-flex-inline">
      <li
        v-for="attachment in attachments"
        :key="attachment.id"
        class="document-attachments__list__item"
      >
        <router-link
          :to="{ name: 'document', params: attachment.routerParams }"
          class="document-attachments__list__item__link d-flex-inline"
        >
          <phosphor-icon
            :name="document.contentTypeIcon"
            class="me-1 mt-1"
          />
          <span>{{ attachment.slicedName.pop() }}</span>
        </router-link>
      </li>
    </ul>
    <a
      v-if="total && attachments.length < total"
      href="#"
      class="document-attachments__more"
      @click.prevent="loadMore"
    >
      {{ t('document.attachments.more') }}
    </a>
  </div>
</template>

<style lang="scss">
.document-attachments {
  margin-top: $spacer;
  padding-top: $spacer;
  border-top: $border-color 1px solid;

  &__list {
    &__item {
      &__link {
        display: inline-block;
        padding: $spacer * 0.25 $spacer * 0.5;
        margin-bottom: $spacer * 0.25;
        background: $primary;
        color: white;

        &:hover {
          text-decoration: none;
          background: color.adjust($primary, $lightness: 5%);
          color: white;
        }
      }
    }
  }

  &__more {
    display: inline-block;
    padding: $spacer * 0.25 $spacer * 0.5;
    margin-bottom: $spacer * 0.25;
    background: $tertiary;

    &:hover {
      text-decoration: white;
      background: white;
    }
  }
}
</style>
