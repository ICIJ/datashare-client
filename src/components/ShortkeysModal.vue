<template>
  <span class="shortkeys-modal">
    <b-button
      v-b-modal.shortkeys
      v-b-tooltip.hover.bottomleft
      class="text-dark"
      variant="transparent"
      size="md"
      :title="$t('shortkeys.title')"
    >
      <fa icon="keyboard" />
      <span class="sr-only">
        {{ $t('shortkeys.title') }}
      </span>
    </b-button>
    <b-modal id="shortkeys" title="Keyboard Shortcuts" hide-footer>
      <div v-for="(shortkey, index) in flatShortkeys" :key="index" class="shortkeys-modal__shortkey mb-1">
        <b-link :href="shortkey.link" target="_blank" class="shortkeys-modal__shortkey__link row no-gutters w-100 mb-1">
          <div class="col-sm-1 pr-2">
            <fa v-if="shortkey.icon" :icon="shortkey.icon" fixed-width></fa>
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
import { compact, capitalize, flattenDeep, get, isArray, join, map } from 'lodash'

import shortkeys from '@/utils/shortkeys.json'
import { getShortkeyOS } from '@/utils/utils'

/**
 * A button to display global shortcuts in a modal.
 */
export default {
  name: 'ShortkeysModal',
  filters: {
    shortkey(values) {
      return join(map(values, capitalize), '+')
    }
  },
  computed: {
    getShortkeyOS,
    matchedRoutesNames () {
      return compact(this?.$route?.matched.map(match => match.name))
    },
    shortkeys () {
      return Object.entries(shortkeys).map(([_, action]) => {
        // Filter only shortkeys of the current page
        return Object.entries(action).map(([_, shortkey]) => {
          if (shortkey.page && !this.matchedRoutesNames.includes(shortkey.page)) {
            return
          }

          if (isArray(shortkey.keys.default)) {
            return shortkey
          }

          return Object.entries(shortkey.keys.default).map(([action]) => {
            return {
              action,
              icon: get(shortkey, ['icon', action], false),
              keys: { 
                default: shortkey.keys.default[action], 
                mac: shortkey.keys.mac[action] 
              },
              label: get(shortkey, ['label', action], false),
              link: shortkey.link
            }
          })
        })
      })
    },
    flatShortkeys () {
      return compact(flattenDeep(this.shortkeys))
    }
  },
  methods: {
    getLabel(shortkey) {
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
