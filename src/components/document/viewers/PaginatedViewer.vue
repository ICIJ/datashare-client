<template>
  <div v-if="!isReady" class="p-3 w-100 text-muted">
    {{ $t('document.fetching') }}
  </div>
  <div class="paginated-viewer d-flex" v-else-if="meta.previewable">
    <div id="paginated-viewer__header" class="bg-light px-3 py-2">
      <div id="paginated-viewer__thumbnails" class="paginated-viewer__thumbnails">
        <div class="text-center mt-2 mb-4 d-flex align-items-center viewer__thumbnails__header" v-if="isReady">
          <select class="form-control form-control-sm" v-model.number="active">
            <option v-for="page in pagesRange" :key="page" :value="page">
              {{ page + 1 }}
            </option>
          </select>
          <span class="w-100">
            / {{ meta.pages }}
          </span>
        </div>
        <div v-for="page in pagesRange" :key="page" @click="active = page" class="my-2 paginated-viewer__thumbnails__item" :class="{ 'paginated-viewer__thumbnails__item--active': active === page }">
          <document-thumbnail :document="document" size="150" :page="page" lazy />
          <span class="paginated-viewer__thumbnails__item__page">
            {{ page }}
          </span>
        </div>
      </div>
    </div>
    <div class="paginated-viewer__preview w-100 p-3 text-center">
      <document-thumbnail :document="document" size="1200" :page="active" class="w-auto d-inline-block" />
    </div>
  </div>
  <div class="p-3" v-else>
    {{ $t('document.not_available') }}
  </div>
</template>

<script>
import range from 'lodash/range'
import fetchPonyfill from 'fetch-ponyfill'
import DocumentThumbnail from '@/components/DocumentThumbnail.vue'

const { fetch } = fetchPonyfill()

export default {
  name: 'paginated-viewer',
  props: ['document'],
  components: {
    DocumentThumbnail
  },
  data () {
    return {
      active: 0,
      isReady: false,
      meta: {
        pages: 1
      }
    }
  },
  async mounted () {
    this.$Progress.start()
    const response = await fetch(this.metaUrl)
    this.meta = await response.json()
    this.isReady = true
    this.$Progress.finish()
  },
  computed: {
    pagesRange () {
      return range(this.meta.pages)
    },
    metaUrl () {
      return `${this.$config.get('document-thumbnail.host')}/api/v1/thumbnail/${this.document.index}/${this.document.id}.json?routing=${this.document.routing}`
    }
  }
}
</script>

<style lang="scss">
  .paginated-viewer {
    position: relative;
    min-height: 100%;
    min-width: 100%;

    &__thumbnails {
      min-width: 100px;

      &__item {
        position: relative;
        border:1px solid $border-color;
        cursor: pointer;

        &:hover {
          border-color: $primary;
          box-shadow:0 0 0 0.1em rgba($primary, .2);
        }

        &--active, &--active:hover {
          border-color: $secondary;
        }

        &--active &__page {
          background: $secondary;
          color: white;
        }

        &__page {
          position: absolute;
          bottom: 0;
          right: 0;
          background: $light;
          font-size: 0.8em;
          padding: 0.2em 0.4em;
          font-weight: bold;
          border:1px solid $border-color;
          border-right: 0;
          border-bottom: 0;
        }
      }
    }

    &__preview {
      img {
        max-width: 100%;
      }
    }
  }
</style>
