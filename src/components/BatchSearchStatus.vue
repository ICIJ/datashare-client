<template>
  <div class="batch-search-status d-flex align-items-center">
    <span :class="`text-${ toVariant(lowerCase(batchSearch.state)) }`">
      <fa :icon="getStateIcon"></fa>
      {{ capitalize(batchSearch.state) }}
    </span>
    <b-badge
      class="batch-search-status__badge ml-1"
      @click.prevent="$refs.batchSearchErrorModal.show()"
      :id="batchSearch.uuid"
      v-if="isFailed"
      variant="danger">
      {{ $t('batchSearch.seeError') }}
    </b-badge>
    <b-modal
      body-class="batch-search-status__modal py-0"
      ok-only
      ref="batchSearchErrorModal"
      :title="$t('batchSearch.errorTitle')"
      v-if="isFailed">
      <div v-if="batchSearch.errorQuery" class="batch-search-status__modal__error-query pb-2 font-weight-bolder">
        <fa icon="exclamation-triangle" class="mr-1"></fa>
        <span v-html="$t('batchSearch.errorQuery', { query: batchSearch.errorQuery })"></span>
      </div>
      <div v-if="batchSearch.errorMessage">
        <div v-html="$t('batchSearch.errorMessage')"></div>
        <div class="batch-search-status__modal__error-message mt-3 px-3 py-1 text-monospace text-break">
          {{ batchSearch.errorMessage }}
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { capitalize, get, isEqual, lowerCase } from 'lodash'
import { toVariant } from '@/utils/utils'

/**
 * A badge to display batch search status.
 */
export default {
  name: 'BatchSearchStatus',
  props: {
    /**
     * The batch search meta data
     */
    batchSearch: {
      type: Object
    }
  },
  computed: {
    isFailed () {
      return isEqual(this.batchSearch.state, 'FAILURE')
    },
    getStateIcon () {
      const state = lowerCase(this.batchSearch.state)
      const icons = {
        failure: 'times-circle',
        queued: 'clock',
        running: 'circle-notch',
        success: 'glass-cheers'
      }
      return get(icons, state, 'ban')
    }
  },
  methods: {
    capitalize,
    lowerCase,
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
      }
    }
  }
</style>
