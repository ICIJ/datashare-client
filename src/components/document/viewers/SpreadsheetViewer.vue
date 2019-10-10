<template>
  <div class="spreadsheet-viewer w-100">
    <div v-if="!isReady" class="p-3 text-muted">
      {{ $t('document.fetching') }}
    </div>
    <div v-else-if="!isPreviewable" class="p-3">
      {{ $t('document.not_available') }}
    </div>
    <div v-else class="spreadsheet-viewer__content d-flex flex-column h-100">
      <div class="spreadsheet-viewer__content__toolbox d-flex align-items-center p-2">
        <b-form-select class="w-auto" v-model="active" :options="sheets" />
        <b-form-checkbox v-model="fieldsInFirstItem" switch class="ml-3">
          {{ $t('document.spreadsheet.fieldsInFirstItem') }}
        </b-form-checkbox>
        <div class="spreadsheet-viewer__content__toolbox__filter flex-grow-1 pl-3">
          <input type="search" class="form-control float-right" v-model="filter" :placeholder="$t('document.spreadsheet.findInSpreadsheet')" />
        </div>
      </div>
      <div class="spreadsheet-viewer__content__table flex-grow-1 mx-3 border-left border-right">
        <b-table :items="items" :filter="filter" :fields="fields" :thead-class="fieldsInFirstItem ? '' : 'd-none'" />
      </div>
    </div>
  </div>
</template>

<script>
import { getCookie } from 'tiny-cookie'
import first from 'lodash/first'
import get from 'lodash/get'
import kebabCase from 'lodash/kebabCase'
import startCase from 'lodash/startCase'
import fetchPonyfill from 'fetch-ponyfill'

const { fetch } = fetchPonyfill()

export default {
  name: 'SpreadsheetViewer',
  props: ['document'],
  data () {
    return {
      isReady: false,
      active: null,
      meta: null,
      fieldsInFirstItem: false,
      filter: null
    }
  },
  async mounted () {
    this.$Progress.start()
    const response = await fetch(this.contentUrl, this.contentOptions)
    this.meta = await response.json()
    this.active = this.sheets[0]
    this.isReady = true
    this.$Progress.finish()
  },
  computed: {
    contentUrl () {
      return `${this.$config.get('previewHost')}/api/v1/thumbnail/${this.document.index}/${this.document.id}.json?include-content=1&routing=${this.document.routing}`
    },
    contentOptions () {
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
    },
    isPreviewable () {
      return this.meta && this.meta.previewable && this.meta.content
    },
    sheets () {
      return Object.keys(get(this, 'meta.content', {}))
    },
    items () {
      const items = get(this, `meta.content.${this.active}`, [])
      // Skip first item
      return this.fieldsInFirstItem ? items.slice(1) : items
    },
    firstItem () {
      return first(get(this, `meta.content.${this.active}`, [])) || []
    },
    fields () {
      if (this.fieldsInFirstItem) {
        return this.firstItem.map((key, index) => {
          return {
            key,
            formatter: (value, key, item) => item[index],
            sortable: true
          }
        })
      }
    }
  }
}
</script>

<style lang="scss">
  .spreadsheet-viewer {

    &__content {

      &__toolbox {
        margin: $spacer $grid-gutter-width * 0.5;
        background: $light;
        box-shadow: 0 -1 * $spacer 0 0 white;

        &__filter {

          input.form-control {
            max-width: 300px;
            width: 100%;
            border-radius: 1.5em;
          }
        }
      }

      &__table {
        max-width: 100%;
        max-height: 100%;
        overflow: auto;

        table > tbody > tr > td {
          min-width: 200px;
        }
      }
    }
  }
</style>
