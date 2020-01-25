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
          <document-thumbnail :document="document" size="150" :page="page" lazy class="w-100 border-0" />
          <span class="paginated-viewer__thumbnails__item__page">
            {{ page + 1 }}
          </span>
        </div>
      </div>
    </div>
    <div class="paginated-viewer__preview p-3 text-center">
      <document-thumbnail :document="document" size="1200" :page="active" :key="active" class="w-auto d-inline-block" />
    </div>
  </div>
  <div class="p-3" v-else>
    {{ $t('document.not_available') }}
  </div>
</template>

<script>
import { getCookie } from 'tiny-cookie'
import kebabCase from 'lodash/kebabCase'
import startCase from 'lodash/startCase'
import range from 'lodash/range'

import DocumentThumbnail from '@/components/DocumentThumbnail.vue'

export default {
  name: 'PaginatedViewer',
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
    const response = await fetch(this.metaUrl, this.metaOptions)
    this.meta = await response.json()
    this.isReady = true
    this.$Progress.finish()
  },
  computed: {
    pagesRange () {
      return range(this.meta.pages)
    },
    metaUrl () {
      return `${this.$config.get('previewHost')}/api/v1/thumbnail/${this.document.index}/${this.document.id}.json?routing=${this.document.routing}`
    },
    metaOptions () {
      return {
        method: 'GET',
        cache: 'default',
        headers: {
          [this.sessionIdHeaderName]: this.sessionIdHeaderValue
        }
      }
    },
    sessionIdHeaderValue () {
      return getCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    },
    sessionIdHeaderName () {
      let dsCookieName = kebabCase(process.env.VUE_APP_DS_COOKIE_NAME)
      dsCookieName = dsCookieName.split('-').map(startCase).join('-')
      return `x-${dsCookieName}`
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
      width: 120px;

      &__item {
        position: relative;
        border:1px solid $border-color;
        cursor: pointer;

        img {
          width: 100%;
        }

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
      width: 110%;
      flex-grow: 1;
      min-width: 0;

      img {
        max-width: 100%;
      }
    }
  }
</style>
