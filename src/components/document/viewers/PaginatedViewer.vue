<template>
  <v-wait for="load data paginated viewer" class="w-100 d-flex flex-column">
    <div class="p-3 w-100 text-muted" slot="waiting">
      {{ $t('document.fetching') }}
    </div>
    <div class="paginated-viewer d-flex flex-grow-1" v-if="meta.previewable">
      <div id="paginated-viewer__header" class="bg-light py-2 paginated-viewer__header">
        <div id="paginated-viewer__thumbnails" class="paginated-viewer__thumbnails">
          <div class="text-center m-2 d-flex align-items-center viewer__thumbnails__header">
            <select class="form-control form-control-sm" v-model.number="active">
              <option v-for="page in pagesRange" :key="page" :value="page">
                {{ page + 1 }}
              </option>
            </select>
            <span class="w-100">
              / {{ meta.pages }}
            </span>
          </div>
          <div class="paginated-viewer__thumbnails__items bg-light">
            <div v-for="page in pagesRange" :key="page" @click="active = page" class="m-2 paginated-viewer__thumbnails__items__item" :class="{ 'paginated-viewer__thumbnails__item--active': active === page }">
              <document-thumbnail :document="document" size="150" :page="page" lazy class="w-100 border-0" />
              <span class="paginated-viewer__thumbnails__items__item__page">
                {{ page + 1 }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="paginated-viewer__preview p-3 text-center">
        <document-thumbnail :document="document" size="1200" :page="active" :key="active" class="w-auto d-inline-block border" />
      </div>
    </div>
    <div class="p-3" v-else>
      {{ $t('document.notAvailable') }}
    </div>
  </v-wait>
</template>

<script>
import kebabCase from 'lodash/kebabCase'
import range from 'lodash/range'
import startCase from 'lodash/startCase'
import axios from 'axios'
import { getCookie } from 'tiny-cookie'

import DocumentThumbnail from '@/components/DocumentThumbnail.vue'

export default {
  name: 'PaginatedViewer',
  props: {
    document: {
      type: Object
    }
  },
  components: {
    DocumentThumbnail
  },
  data () {
    return {
      active: 0,
      meta: {
        pages: 1
      }
    }
  },
  async mounted () {
    this.$wait.start('load data paginated viewer')
    this.$Progress.start()
    this.meta = (await axios({ url: this.metaUrl, ...this.metaOptions })).data
    this.$Progress.finish()
    this.$wait.end('load data paginated viewer')
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
    &__header {
      width: 200px;
    }

    &__thumbnails {
      min-height: 100%;
      position: relative;

      &__items {
        height: calc(100% - 35px);
        overflow-y: auto;
        position: absolute;
        width: 100%;

        &__item {
          border: 1px solid $border-color;
          cursor: pointer;
          position: relative;

          img {
            width: 100%;
          }

          &:hover {
            border-color: $primary;
            box-shadow: 0 0 0 0.1em rgba($primary, .2);
          }

          &--active, &--active:hover {
            border-color: $secondary;
          }

          &--active &__page {
            background: $secondary;
            color: white;
          }

          &__page {
            background: $light;
            border: 1px solid $border-color;
            border-bottom: 0;
            border-right: 0;
            bottom: 0;
            font-size: 0.8em;
            font-weight: bold;
            padding: 0.2em 0.4em;
            position: absolute;
            right: 0;
          }
        }
      }
    }

    &__preview {
      width: 100%;

      img {
        max-width: 100%;
      }
    }
  }
</style>
