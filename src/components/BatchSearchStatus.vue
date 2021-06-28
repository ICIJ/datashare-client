<template>
  <div class="batch-search-status d-flex align-items-center">
    <span :class="batchSearch.state | toVariant('dark', 'text-')" class="text-nowrap">
      <fa :icon="getStateIcon" :spin="isSpinning" />
      <template v-if="!noLabel">
        {{ batchSearch.state | capitalize }}
      </template>
    </span>
    <template v-if="isFailed">
      <b-badge
        class="batch-search-status__badge ml-1"
        @click.prevent="$refs.batchSearchErrorModal.show()"
        variant="danger"
        v-b-tooltip
        :id="batchSearch.uuid"
        :title="$t('batchSearch.errorTitle')">
        {{ $t('batchSearch.seeError') }}
      </b-badge>
      <b-modal
        body-class="batch-search-status__modal py-0"
        ok-only
        ref="batchSearchErrorModal"
        size="lg"
        hide-header>
        <div v-if="batchSearch.errorQuery" class="batch-search-status__modal__error-query mt-4 mb-2 font-weight-bolder">
          <span v-html="$t('batchSearch.errorQuery', { query: batchSearch.errorQuery })"></span>
        </div>
        <div v-if="batchSearch.errorMessage">
          <template v-if="errorMessageAsJson">
            <json-formatter  class="batch-search-status__modal__error-message" :json="errorMessageAsJson" :open="4" :config="{ theme: 'dark' }" />
          </template>
          <template v-else>
            <pre class="batch-search-status__modal__error-message mt-3 mb-0"><code>{{ batchSearch.errorMessage }}</code></pre>
          </template>
          <div class="mt-2" v-html="$t('batchSearch.errorMessage')"></div>
        </div>
      </b-modal>
    </template>
  </div>
</template>

<script>
import { capitalize, get } from 'lodash'
import { toVariant } from '@/utils/utils'
import JsonFormatter from '@/components/JsonFormatter'

/**
 * A badge to display batch search status.
 */
export default {
  name: 'BatchSearchStatus',
  components: {
    JsonFormatter
  },
  props: {
    /**
     * The batch search meta data
     */
    batchSearch: {
      type: Object
    },
    /**
     * Hide the label
     */
    noLabel: {
      type: Boolean
    },
    /**
     * Hide the error badge
     */
    noError: {
      type: Boolean
    }
  },
  computed: {
    isFailed () {
      return this.batchSearch.state.toLowerCase() === 'failure'
    },
    isSpinning () {
      return this.batchSearch.state.toLowerCase() === 'running'
    },
    getStateIcon () {
      const state = this.batchSearch.state.toLowerCase()
      const icons = {
        failure: 'times-circle',
        queued: 'clock',
        running: 'circle-notch',
        success: 'glass-cheers'
      }
      return get(icons, state, 'ban')
    },
    errorMessageAsJson () {
      const re = /{"error":.+}/gm
      const message = this.batchSearch.errorMessage || ''
      const match = message.match(re)
      try {
        return JSON.parse(match)
      } catch (_) {
        return null
      }
    }
  },
  filters: {
    capitalize,
    toVariant
  }
}
</script>

<style lang="scss" scoped>
  .batch-search-status {
    &__badge {
      cursor: pointer;
    }

    &__modal {

      &__error-query {
        font-size: $font-size-lg;

        /deep/ code {
          background-color: $light;
          border: 1px gray solid;
          border-radius: 3px;
          margin-right: .2rem;
          padding: 0 2px;
        }
      }

      &__error-message {
        background-color: black;
        color: white;
        padding: $spacer;
        overflow: auto;

        code {
          white-space: normal;
          display: block;
        }
      }
    }
  }
</style>
