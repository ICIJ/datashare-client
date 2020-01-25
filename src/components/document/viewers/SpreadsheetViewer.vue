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
        <b-form-checkbox v-model="fieldsInFirstItem" switch class="ml-3">
          {{ $t('document.spreadsheet.fieldsInFirstItem') }}
        </b-form-checkbox>
        <div class="spreadsheet-viewer__content__toolbox__filter flex-grow-1 pl-3">
          <input type="search" class="form-control float-right" v-model="filter" :placeholder="$t('document.spreadsheet.findInSpreadsheet')" v-shortkey.focus="['ctrl', 'f']"/>
        </div>
      </div>
      <div class="spreadsheet-viewer__content__table mx-3 small flex-grow-1" :style="tableVars">
        <dynamic-scroller :items="scrollerItems" :min-item-size="54" class="spreadsheet-viewer__content__table__scroller border-left border mb-3">
          <template #before v-if="fieldsInFirstItem">
            <div class="spreadsheet-viewer__content__table__item row no-gutters border-bottom">
              <div v-for="field in fields" class="spreadsheet-viewer__content__table__item__col col border-right overflow-hidden" :key="field">
                <div class="p-2">
                  {{ field }}
                </div>
              </div>
            </div>
          </template>
          <template v-slot="{ item, index, active }">
            <dynamic-scroller-item :item="item" :active="active" :data-index="index" :size-dependencies="item.cols">
              <div class="spreadsheet-viewer__content__table__item row no-gutters border-bottom">
                <div v-for="(col, i) in item.cols" class="spreadsheet-viewer__content__table__item__col col border-right overflow-hidden" :key="i">
                  <div class="p-2">
                    {{ col }}
                  </div>
                </div>
              </div>
            </dynamic-scroller-item>
          </template>
        </dynamic-scroller>
      </div>
      <b-tabs v-model="activeSheetIndex" pills class=" mx-3 mb-3" v-if="nonEmptySheets.length > 1">
        <b-tab :title="sheet" v-for="(sheet, i) in nonEmptySheets" :key="i" />
      </b-tabs>
    </div>
  </div>
</template>

<script>
import { getCookie } from 'tiny-cookie'
import first from 'lodash/first'
import get from 'lodash/get'
import filter from 'lodash/filter'
import kebabCase from 'lodash/kebabCase'
import range from 'lodash/range'
import startCase from 'lodash/startCase'
import sortBy from 'lodash/sortBy'
import Fuse from 'fuse.js'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import shortkeys from '@/mixins/shortkeys'

export default {
  name: 'SpreadsheetViewer',
  props: ['document'],
  mixins: [shortkeys],
  components: {
    DynamicScroller,
    DynamicScrollerItem
  },
  data () {
    return {
      isReady: false,
      activeSheetIndex: 0,
      meta: null,
      fieldsInFirstItem: false,
      filter: ''
    }
  },
  async mounted () {
    this.$Progress.start()
    const response = await fetch(this.contentUrl, this.contentOptions)
    this.meta = await response.json()
    this.activeSheetIndex = 0
    this.isReady = true
    this.$Progress.finish()
  },
  computed: {
    tableVars () {
      return {
        '--table-wrapper-width': Math.max(100, (5 + this.firstItem.length) * 10) + '%'
      }
    },
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
    activeSheet () {
      return this.nonEmptySheets[this.activeSheetIndex]
    },
    sheets () {
      return sortBy(Object.keys(get(this, 'meta.content', {})))
    },
    nonEmptySheets () {
      return filter(this.sheets, sheet => {
        const rows = get(this, `meta.content.${sheet}`, [])
        return filter(rows, row => row.length).length
      })
    },
    filteredItems () {
      if (this.filter === '') return this.items
      const keys = range(this.firstItem.length).map(String)
      const options = { keys }
      const fuse = new Fuse(this.items, options)
      return fuse.search(this.filter)
    },
    items () {
      const items = get(this, `meta.content.${this.activeSheet}`, [])
      // Skip first item
      return (this.fieldsInFirstItem ? items.slice(1) : items)
    },
    firstItem () {
      return first(get(this, `meta.content.${this.activeSheet}`, [])) || []
    },
    scrollerItems () {
      return this.filteredItems.map((cols, id) => ({ id, cols }))
    },
    fields () {
      if (this.fieldsInFirstItem) {
        return this.firstItem
      }
    }
  }
}
</script>

<style lang="scss">
  @import '~node_modules/vue-virtual-scroller/dist/vue-virtual-scroller.css';

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

        position: relative;

        &__item {

          &__col.border-right:last-child {
            border-right: 0 !important;
          }
        }

        &__scroller {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;

          .vue-recycle-scroller__slot,
          .vue-recycle-scroller__item-wrapper {
            width: var(--table-wrapper-width) !important;
          }

          .vue-recycle-scroller__slot:first-child {
            position: sticky;
            top: 0;
            z-index: 10;
            background: $light;
            font-weight: bold;
            border-bottom: 1px solid $border-color;
          }
        }
      }
    }
  }
</style>
