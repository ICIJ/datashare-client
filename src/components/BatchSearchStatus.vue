<template>
  <div class="d-flex align-items-center">
    <span :class="`text-${ toVariant(lowerCase(batchSearch.state)) }`">
      <fa :icon="getStateIcon"></fa>
      {{ capitalize(batchSearch.state) }}
    </span>
    <b-badge
      class="cursor-pointer ml-1"
      @click.prevent="$refs.batchSearchErrorModal.show()"
      :id="batchSearch.uuid"
      v-if="isFailed"
      variant="danger">
      {{ $t('batchSearch.seeError') }}
    </b-badge>
    <b-modal :title="$t('batchSearch.errorTitle')" ok-only body-class="py-0" v-if="isFailed" ref="batchSearchErrorModal">
      <div v-if="batchSearch.errorQuery" class="font-size-large pb-2 font-weight-bolder">
        <fa icon="exclamation-triangle" class="mr-1"></fa>
        {{ $t('batchSearch.errorQuery', { query: batchSearch.errorQuery }) }}
      </div>
      <div v-if="batchSearch.errorMessage">
        <div v-html="$t('batchSearch.errorMessage')"></div>
        <div class="code mt-3 px-3 py-1 text-monospace text-break">
          {{ batchSearch.errorMessage }}
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { capitalize, get, isEqual, lowerCase } from 'lodash'
import { toVariant } from '@/utils/utils'

export default {
  name: 'BatchSearchStatus',
  props: {
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
  .code {
    background-color: black;
    color: white;
  }

  .font-size-large {
    font-size: $font-size-lg;
  }

  .cursor-pointer {
    cursor: pointer;
  }
</style>
