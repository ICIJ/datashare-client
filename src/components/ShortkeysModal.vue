<template>
  <span class="shortkeys-modal" v-if="hasFeature('SHORTKEYS')">
    <b-button class="text-dark" variant="transparent" href="#" size="lg" v-b-modal.shortkeys :title="$t('search.settings.title')" v-b-tooltip.hover.bottomleft>
      <fa icon="keyboard" />
      <span class="sr-only">
        {{ $t('search.settings.title') }}
      </span>
    </b-button>
    <b-modal id="shortkeys" title="Keyboard Shortcuts" hide-footer>
      <div v-for="(shortkey, index) in shortkeys" :key="index" class="shortkeys-modal__shortkey mb-1">
        <b-link :href="shortkey.link" target="_blank" class="shortkeys-modal__shortkey__link row mb-1">
          <div class="col-sm-1">
            <fa :icon="shortkey.icon" v-if="shortkey.icon"/>
          </div>
          <div class="col-sm-7">
            {{ getLabel(shortkey) }}
          </div>
          <div class="col-sm-4">
            {{ shortkey.keys[getShortkeyOS] | shortkey }}
          </div>
        </b-link>
      </div>
    </b-modal>
  </span>
</template>

<script>
import shortkeys from '@/utils/shortkeys.json'
import { getShortkeyOS } from '@/utils/utils'
import features from '@/mixins/features'
import capitalize from 'lodash/capitalize'
import get from 'lodash/get'
import isArray from 'lodash/isArray'
import join from 'lodash/join'
import map from 'lodash/map'

export default {
  name: 'ShortkeysModal',
  mixins: [features],
  data () {
    return {
      shortkeys: []
    }
  },
  filters: {
    shortkey (values) {
      return join(map(values, capitalize), '+')
    }
  },
  computed: {
    getShortkeyOS
  },
  created () {
    map(shortkeys, action => {
      map(action, shortkey => {
        // Check if multiple keys
        if (isArray(shortkey.keys.default)) {
          this.shortkeys.push(shortkey)
        } else {
          map(shortkey.keys.default, (tmp, action) => {
            const newShortkey = { action, keys: { default: shortkey.keys.default[action], mac: shortkey.keys.mac[action] }, link: shortkey.link }
            const label = get(shortkey, ['label', action], false)
            if (label) newShortkey.label = label
            this.shortkeys.push(newShortkey)
          })
        }
      })
    })
  },
  methods: {
    getLabel (shortkey) {
      const label = get(shortkey, 'label', get(shortkey, 'action', ''))
      return this.$te(label) ? this.$t(label) : label
    }
  }
}
</script>

<style lang="scss">
  .shortkeys-modal__shortkey {
    border-bottom: 1px solid lighten($text-muted, 40);

    &:last-child {
      border-bottom: none;
    }

    &__link {
      color: inherit;
      display: inline-flex;
      text-decoration: none;

      &:hover {
        text-decoration: none;
      }
    }
  }
</style>
