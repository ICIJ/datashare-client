<template>
  <span class="shortkeys-modal" v-if="hasFeature('SHORTKEYS')">
    <b-button class="text-dark" variant="transparent" href="#" size="lg" v-b-modal.shortkeys :title="$t('search.settings.title')" v-b-tooltip.hover.bottomleft>
      <fa icon="keyboard" />
      <span class="sr-only">
        {{ $t('search.settings.title') }}
      </span>
    </b-button>
    <b-modal id="shortkeys" title="Keyboard Shortcuts">
      <div v-for="(shortkey, index) in shortkeys" :key="index" class="row mb-2">
        <div class="col-sm-2">
          <fa :icon="shortkey.icon" v-if="shortkey.icon"/>
        </div>
        <div class="col-sm-6">
          {{ shortkey.label }}
        </div>
        <div class="col-sm-4">
          {{ shortkey.keys[getShortkeyOS] | shortkey }}
        </div>
      </div>
    </b-modal>
  </span>
</template>

<script>
import shortkeys from '@/utils/shortkeys.json'
import { getShortkeyOS } from '@/utils/utils'
import capitalize from 'lodash/capitalize'
import join from 'lodash/join'
import map from 'lodash/map'
import features from '@/mixins/features'

export default {
  name: 'ShortkeysModal',
  mixins: [features],
  data () {
    return {
      shortkeys: shortkeys.shortkeys
    }
  },
  filters: {
    shortkey (values) {
      return join(map(values, capitalize), '+')
    }
  },
  computed: {
    getShortkeyOS () {
      return getShortkeyOS()
    }
  }
}
</script>
