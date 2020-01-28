<template>
  <div class="document-attachments" v-if="total !== null && total > 0">
    <h6>{{ $tc('document.attachments.heading', total, { total }) }}</h6>
    <ul class="document-attachments__list list-unstyled d-flex-inline">
      <li v-for="attachment in attachments" class="document-attachments__list__item" :key="attachment.id">
        <router-link :to="{ name: 'document', params: attachment.routerParams }" class="document-attachments__list__item__link d-flex-inline">
          <fa :icon="attachment.contentTypeIcon" fixed-width class="mr-1 mt-1" />
          <span>{{ attachment.slicedName.pop() }}</span>
        </router-link>
      </li>
    </ul>
    <a v-if="total && attachments.length < total" @click.prevent="loadMore" href="#" class="document-attachments__more">
      <fa icon="plus" fixed-width class="mr-1" />
      {{ $t('document.attachments.more') }}
    </a>
  </div>
</template>

<script>
import bodybuilder from 'bodybuilder'
import flatten from 'lodash/flatten'
import sum from 'lodash/sum'
import esClient from '@/api/esClient'
import Response from '@/api/resources/Response'

export default {
  name: 'DocumentAttachments',
  props: {
    document: {
      type: Object
    }
  },
  data () {
    return {
      pages: [],
      isReady: false,
      size: 50
    }
  },
  async mounted () {
    await this.loadMore()
    this.$emit('document:attachments', this.total)
  },
  methods: {
    async loadMore () {
      this.isReady = false
      const index = this.$store.state.search.index
      const body = this.searchBody().build()
      const response = await esClient.search({ index, body })
      this.pages.push(new Response(response))
      this.isReady = true
    },
    searchBody () {
      return bodybuilder()
        .query('match', 'type', 'Document')
        .query('match', 'extractionLevel', this.document.extractionLevel + 1)
        .query('match', '_routing', this.document.id)
        .rawOption('_source', { includes: ['*'], excludes: ['content'] })
        .from(this.from)
        .size(this.size)
    }
  },
  computed: {
    attachments () {
      return flatten(this.pages.map(page => page.hits))
    },
    total () {
      return this.pages.length ? this.pages[0].total : null
    },
    from () {
      return sum(this.pages.map(page => page.hits.length))
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
          background: $secondary;
          color: white;

          &:hover {
            text-decoration: none;
            background: lighten($secondary, 5);
            color: white;
          }
        }
      }
    }

    &__more {
      display: inline-block;
      padding: $spacer * 0.25 $spacer * 0.5;
      margin-bottom: $spacer * 0.25;
      background: $light;

      &:hover {
        text-decoration: white;
        background: white;
      }
    }
  }
</style>
