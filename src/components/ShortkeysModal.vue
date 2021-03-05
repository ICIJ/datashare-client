<template>
  <span class="shortkeys-modal">
    <b-button class="text-dark" variant="transparent" size="md" v-b-modal.shortkeys :title="$t('shortkeys.title')"
              v-b-tooltip.hover.bottomleft>
      <fa icon="keyboard" />
      <span class="sr-only">
        {{ $t('shortkeys.title') }}
      </span>
    </b-button>
    <b-modal id="shortkeys" title="Keyboard Shortcuts" hide-footer>
      <div v-for="(shortkey, index) in shortkeys" :key="index" class="shortkeys-modal__shortkey mb-1">
        <b-link :href="shortkey.link" target="_blank" class="shortkeys-modal__shortkey__link row no-gutters w-100 mb-1">
          <div class="col-sm-1 pr-2">
            <fa :icon="shortkey.icon" v-if="shortkey.icon" fixed-width></fa>
          </div>
          <div class="col-sm-7 pr-2">
            {{ getLabel(shortkey) }}
          </div>
          <div class="col-sm-4 small">
            <kbd>
              {{ shortkey.keys[getShortkeyOS] | shortkey }}
            </kbd>
          </div>
        </b-link>
      </div>
    </b-modal>
  </span>
</template>

<script>
import { capitalize, get, isArray, join, map } from 'lodash'

import shortkeys from '@/utils/shortkeys.json'
import { getShortkeyOS } from '@/utils/utils'

/**
 * A button to display global shortcuts in a modal.
 */
export default {
  name: 'ShortkeysModal',
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
          map(shortkey.keys.default, (_, action) => {
            const newShortkey = { action, keys: { default: shortkey.keys.default[action], mac: shortkey.keys.mac[action] }, link: shortkey.link }
            const label = get(shortkey, ['label', action], false)
            if (label) newShortkey.label = label
            const icon = get(shortkey, ['icon', action], false)
            if (icon) newShortkey.icon = icon
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

<style lang="scss" scoped>
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
