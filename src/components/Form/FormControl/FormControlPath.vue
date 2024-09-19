<script>
import { compact, get, filter, trim, trimEnd, uniqueId } from 'lodash'

export default {
  name: 'FormControlPath',
  props: {
    dark: {
      type: Boolean
    },
    path: {
      type: String
    },
    hideFolderIcon: {
      type: Boolean
    },
    sourcePath: {
      type: String,
      default: null
    }
  },
  emits: ['update:path'],
  data() {
    return {
      browse: false,
      browsingPath: null,
      browsingTree: null,
      pathSeparator: this.$config.get('pathSeparator', '/')
    }
  },
  computed: {
    dataDir() {
      return this.$config.get('dataDir')
    },
    cannonicalDataDir() {
      return trimEnd(this.dataDir, this.pathSeparator)
    },
    cannonicalSourcePath() {
      return trimEnd(this.sourcePath, this.pathSeparator)
    },
    baseDir() {
      return this.sourcePath ? this.cannonicalSourcePath : this.cannonicalDataDir
    },
    baseDirLabel() {
      return this.baseDir === this.cannonicalDataDir ? 'Home' : this.basename(this.baseDir)
    },
    browsingTreeDirectories() {
      return filter(get(this.browsingTree, 'contents', []), { type: 'directory' })
    },
    directories() {
      if (!this.path) {
        return [this.baseDirLabel]
      }
      return compact([this.baseDirLabel, ...this.pathWithoutBaseDir.split(this.pathSeparator)])
    },
    pathWithoutBaseDir() {
      return trim(this.path.split(this.baseDir).pop(), this.pathSeparator)
    },
    waitIdentifier() {
      return uniqueId('form-control-path-')
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
  watch: {
    async sourcePath(path) {
      this.select(path)
      await this.loadBrowsingPath()
    }
  },
  methods: {
    basename(path) {
      return trim(path.split(this.pathSeparator).pop(), this.pathSeparator)
    },
    directoryTitle(index) {
      return [this.baseDir, ...this.directories.slice(1, index + 1)].join(this.pathSeparator)
    },
    select(pathOrIndex, continueBrowsing = false) {
      this.browse = continueBrowsing
      if (isNaN(pathOrIndex)) {
        return this.selectPath(pathOrIndex)
      }
      return this.selectIndex(pathOrIndex)
    },
    selectIndex(index) {
      const nonNullPath = this.path || this.baseDir
      const path = nonNullPath
        .split(this.baseDir)
        .pop()
        .split(this.pathSeparator)
        .slice(0, index + 1)
        .join(this.pathSeparator)
      return this.selectPath(this.baseDir + path)
    },
    selectPath(path) {
      this.browsingPath = trimEnd(path, this.pathSeparator)
      this.$emit('update:path', this.browsingPath)
      return path
    },
    async selectAndBrowse(pathOrIndex) {
      this.select(pathOrIndex, true)
      // Browse only if we are already browsing
      await this.$nextTick()
      await this.toggleBrowser(this.browse)
    },
    async toggleBrowser(browse = null) {
      this.browse = browse ?? !this.browse
      if (this.browse) {
        await this.loadBrowsingPath()
      }
    },
    async loadBrowsingPath() {
      this.$wait.start(this.waitIdentifier)
      this.browsingPath = this.path || this.baseDir
      try {
        this.browsingTree = await this.$core.api.tree(this.browsingPath)
      } finally {
        this.$wait.end(this.waitIdentifier)
      }
    }
  }
}
</script>

<template>
  <div class="form-control-path border rounded" :class="{ 'form-control-path--dark': dark }">
    <b-overlay rounded :show="!isReady" :variant="overlayVariant" spinner-small>
      <div class="form-control-path__header d-flex align-items-center p-2">
        <fa v-if="!hideFolderIcon" class="form-control-path__header__icon me-3" icon="folder" fixed-width />
        <active-text-truncate
          :key="directories.length"
          class="form-control-path__header__list me-1"
          direction="rtl"
        >
          <div
            v-for="(directory, i) in directories"
            :key="directory"
            class="form-control-path__header__list__item"
            @click="selectAndBrowse(i)"
          >
            <b-button
              v-b-tooltip.body="{ delay: { show: 1e3, hide: 0 }, customClass: 'tooltip-lg' }"
              class="p-0"
              variant="link"
              :title="directoryTitle(i)"
            >
              {{ basename(decodeURI(directory)) }}
            </b-button>
          </div>
        </active-text-truncate>
        <b-button
          class="form-control-path__header__browse py-0 ms-auto"
          size="sm"
          :variant="browseBtnVariant"
          @click="toggleBrowser()"
        >
          {{ browseBtnLabel }}
        </b-button>
      </div>
      <b-collapse :visible="browse">
        <ul v-if="browsingTreeDirectories.length" class="form-control-path__browser list-unstyled m-0 border-top">
          <li
            v-for="directory in browsingTreeDirectories"
            :key="directory.name"
            class="form-control-path__browser__item position-relative"
          >
            <a
              class="form-control-path__browser__item__link d-block p-2 stretched-link"
              href
              @click.prevent="selectAndBrowse(directory.name, true)"
            >
              <fa icon="folder" fixed-width class="me-3" />
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
.form-control-path {
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

      .form-control-path--dark &__link:hover,
      .form-control-path--dark &--active &__link {
        background: $dark;
      }

      &__link:hover + &__browse {
        display: block;
      }
    }
  }
}
</style>
