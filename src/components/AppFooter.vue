<template>
  <div class="app__footer text-nowrap">
    <router-link :to="{ name: 'indexing' }"  class="app__footer__addon btn btn-sm" :title="$t('footer.analyse')" v-b-tooltip>
      <font-awesome-icon icon="plus" />
      <span class="sr-only">{{ $t('menu.analyse') }}</span>
    </router-link>
    <div class="app__footer__addon app__footer__addon--homedir" :title="$t('footer.homedir')" v-b-tooltip v-if="!isRemote">
      <font-awesome-icon icon="folder" class="mr-1" />
      {{ config.userDir || config.dataDir }}
    </div>
    <div class="w-100">
      <b-tooltip :target="() => this.$refs.appFooterVersion">
        <div class="app__footer__tooltip">
          <div class="d-flex text-left align-items-center app__footer__tooltip__client">
            <div class="text-muted w-100">
              <font-awesome-icon icon="desktop" />
              {{ $t('footer.clientVersion') }}
            </div>
            <div class="m-1 text-monospace app__footer__tooltip__client__value">
              {{ clientHash }}
            </div>
          </div>
          <div class="d-flex text-left align-items-center app__footer__tooltip__server">
            <div class="text-muted w-100">
              <font-awesome-icon icon="server" />
              {{ $t('footer.serverVersion') }}
            </div>
            <div class="m-1 text-monospace app__footer__tooltip__server__value">
              {{ serverHash }}
            </div>
          </div>
        </div>
      </b-tooltip>
    </div>
    <div class="app__footer__addon app__footer__addon--version" ref="appFooterVersion">
      <font-awesome-icon icon="bolt" class="mr-1" />
      {{ serverVersion }}
    </div>
  </div>
</template>

<style lang="scss">
  .app__footer {
    z-index: $zindex-fixed;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: $app-footer-height;
    background: #222;
    color: white;
    font-size: 0.8rem;
    display: flex;
    align-items: center;

    &__addon {
      padding: 0 .5em;
      height: $app-footer-height;
      display: flex;
      align-items: center;

      &--homedir {
        border-left: 1px solid  rgba(white, .1);
        font-family: $font-family-monospace;
      }

      &--version {
        font-weight: bold;
      }
    }
  }
</style>

<script>
import DatashareClient from '@/api/DatashareClient'

export default {
  name: 'AppFooter',
  created () {
    const ds = new DatashareClient()
    this.promise = ds.getVersion().then(r => r.json())
    this.getServerVersion()
  },
  data () {
    return {
      serverHash: '',
      serverVersion: '',
      promise: null
    }
  },
  computed: {
    clientHash () {
      return process.env.VUE_APP_GIT_HASH.substring(0, 7)
    },
    isRemote () {
      return this.config && this.config.mode === 'SERVER'
    }
  },
  methods: {
    getServerVersion () {
      return this.promise.then(res => {
        this.serverHash = res['git.commit.id.abbrev']
        this.serverVersion = res['git.build.version']
      })
    }
  }
}
</script>
