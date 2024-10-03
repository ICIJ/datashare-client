<template>
  <div v-if="isReady && hasAttachments" class="document-attachments">
    <h6>{{ $t('document.attachments.heading', total, { total }) }}</h6>
    <ul class="document-attachments__list list-unstyled d-flex-inline">
      <li v-for="attachment in attachments" :key="attachment.id" class="document-attachments__list__item">
        <router-link
          :to="{ name: 'document', params: attachment.routerParams }"
          class="document-attachments__list__item__link d-flex-inline"
        >
          <fa :icon="attachment.contentTypeIcon" fixed-width class="me-1 mt-1" />
          <span>{{ attachment.slicedName.pop() }}</span>
        </router-link>
      </li>
    </ul>
    <a v-if="total && attachments.length < total" href="#" class="document-attachments__more" @click.prevent="loadMore">
      <fa icon="plus" fixed-width class="me-1" />
      {{ $t('document.attachments.more') }}
    </a>
  </div>
</template>

<script>
import bodybuilder from 'bodybuilder'
import { flatten, get, sum } from 'lodash'

import EsDocList from '@/api/resources/EsDocList'

/**
 * A list of attachments for a document (usually, it's child documents)
 */
export default {
  name: 'DocumentAttachments',
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    }
  },
  data() {
    return {
      pages: [],
      size: 50
    }
  },
  computed: {
    attachments() {
      return flatten(this.pages.map((page) => page.hits))
    },
    total() {
      return get(this, 'pages.0.total', null)
    },
    from() {
      return sum(this.pages.map((page) => page.hits.length))
    },
    isReady() {
      return !this.$wait.is('document-attachement')
    },
    hasAttachments() {
      return !!this.attachments.length
    }
  },
  async mounted() {
    await this.loadMore()
  },
  methods: {
    async loadMore() {
      this.$wait.start('document-attachement')
      const { index } = this.document
      const body = this.searchBody().build()
      const response = await this.$core.api.elasticsearch.search({ index, body })
      this.pages.push(new EsDocList(response))
      this.$wait.end('document-attachement')
    },
    searchBody() {
      return bodybuilder()
        .query('match', 'type', 'Document')
        .query('match', 'extractionLevel', this.document.extractionLevel + 1)
        .query('match', '_routing', this.document.id)
        .rawOption('_source', { includes: ['*'], excludes: ['content'] })
        .from(this.from)
        .size(this.size)
    }
  }
}
</script>

<style lang="scss">
.document-attachments {
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
