<script>
import { compact, get, filter, trim, trimEnd, uniqueId } from 'lodash'

export default {
  name: 'InlineDirectoryPicker',
  model: {
    prop: 'path',
    event: 'input'
  },
  props: {
    dark: {
      type: Boolean
    },
    path: {
      type: String
    },
    hideFolderIcon: {
      type: Boolean
    }
  },
  data() {
    return {
      browse: false,
      browsingPath: null,
      browsingTree: null
    }
  },
  computed: {
    cannonicalDataDir() {
      return trimEnd(this.dataDir, '/')
    },
    dataDir() {
      return this.$config.get('dataDir')
    },
    browsingTreeDirectories() {
      return filter(get(this.browsingTree, 'contents', []), { type: 'directory' })
    },
    directories() {
      if (!this.path) {
        return ['Home']
      }
      return compact(['Home', ...this.pathWithoutDataDir.split('/')])
    },
    pathWithoutDataDir() {
      return trim(this.path.split(this.dataDir).pop(), '/')
    },
    waitIdentifier() {
      return uniqueId('inline-directory-picker-')
    },
    isReady() {
      return !this.$wait.is(this.waitIdentifier)
    },
    browseBtnLabel() {
      if (this.browse) {
        return this.$t('inlineDirectoryPicker.header.browseBtn.close')
      }
      return this.$t('inlineDirectoryPicker.header.browseBtn.browse')
    },
    browseBtnVariant() {
      return this.dark ? 'light' : 'dark'
    },
    overlayVariant() {
      return this.dark ? 'dark' : 'light'
    }
  },
  methods: {
    basename(path) {
      return trim(path.split('/').pop(), '/')
    },
    directoryTitle(index) {
      return [this.cannonicalDataDir, ...this.directories.slice(1, index + 1)].join('/')
    },
    select(pathOrIndex, continueBrowsing = false) {
      this.browse = continueBrowsing
      if (isNaN(pathOrIndex)) {
        return this.selectPath(pathOrIndex)
      }
      return this.selectIndex(pathOrIndex)
    },
    selectIndex(index) {
      const nonNullPath = this.path || this.cannonicalDataDir
      const path = nonNullPath
        .split(this.cannonicalDataDir)
        .pop()
        .split('/')
        .slice(0, index + 1)
        .join('/')
      return this.selectPath(this.cannonicalDataDir + path)
    },
    selectPath(path) {
      this.$emit('input', path)
      return path
    },
    async selectAndBrowse(pathOrIndex) {
      this.select(pathOrIndex, true)
      // Browse only if we are already browsing
      await this.$nextTick()
      this.toggleBrowser(this.browse)
    },
    async toggleBrowser(browse = null) {
      this.browse = browse ?? !this.browse
      if (this.browse) {
        this.$wait.start(this.waitIdentifier)
        this.browsingPath = this.path || this.cannonicalDataDir
        this.browsingTree = await this.$core.api.tree(this.browsingPath)
        this.$wait.end(this.waitIdentifier)
      }
    }
  }
}
</script>

<template>
  <div class="inline-directory-picker border rounded" :class="{ 'inline-directory-picker--dark': dark }">
    <b-overlay rounded :show="!isReady" :variant="overlayVariant" spinner-small>
      <div class="inline-directory-picker__header d-flex align-items-center p-2">
        <fa v-if="!hideFolderIcon" class="inline-directory-picker__header__icon mr-3" icon="folder" fixed-width />
        <active-text-truncate
          :key="directories.length"
          class="inline-directory-picker__header__list mr-1"
          direction="rtl"
        >
          <div
            v-for="(directory, i) in directories"
            :key="directory"
            class="inline-directory-picker__header__list__item"
            @click="selectAndBrowse(i)"
          >
            <b-btn
              v-b-tooltip="{ delay: { show: 1e3, hide: 0 }, customClass: 'tooltip-lg' }"
              class="p-0"
              variant="link"
              :title="directoryTitle(i)"
            >
              {{ basename(directory) }}
            </b-btn>
          </div>
        </active-text-truncate>
        <b-btn
          class="inline-directory-picker__header__browse py-0 ml-auto"
          size="sm"
          :variant="browseBtnVariant"
          @click="toggleBrowser()"
        >
          {{ browseBtnLabel }}
        </b-btn>
      </div>
      <b-collapse :visible="browse">
        <ul v-if="browsingTreeDirectories.length" class="inline-directory-picker__browser list-unstyled m-0 border-top">
          <li
            v-for="directory in browsingTreeDirectories"
            :key="directory.name"
            class="inline-directory-picker__browser__item position-relative"
          >
            <a
              class="inline-directory-picker__browser__item__link d-block p-2 stretched-link"
              href
              @click.prevent="selectAndBrowse(directory.name, true)"
            >
              <fa icon="folder" fixed-width class="mr-3" />
              {{ basename(directory.name) }}
            </a>
          </li>
        </ul>
        <p v-else-if="isReady" class="text-center small p-3 m-0">
          {{ $t('inlineDirectoryPicker.browser.empty') }}
        </p>
      </b-collapse>
    </b-overlay>
  </div>
</template>

<style lang="scss">
.inline-directory-picker {
  &__header {
    &__list {
      & &__item {
        margin-right: 0;
        display: inline-flex;

        &:not(:last-of-type):after {
          content: '/';
          margin: 0 $spacer-xxs;
        }

        .btn {
          color: inherit;
          opacity: $btn-disabled-opacity;
        }

        &:last-of-type .btn {
          font-weight: bold;
          opacity: 1;
        }
      }
    }
  }

  &__browser {
    &__item {
      &__link,
      &__link:hover {
        color: inherit;
      }

      &__link:hover,
      &--active &__link {
        text-decoration: none;
        background: $table-hover-bg;
      }

      .inline-directory-picker--dark &__link:hover,
      .inline-directory-picker--dark &--active &__link {
        background: $table-dark-hover-bg;
      }

      &__link:hover + &__browse {
        display: block;
      }
    }
  }
}
</style>
