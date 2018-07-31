<template>
  <div class="about container-fluid">
    <dl class="row p-3">
      <dt class="col-sm-1">{{ $t('about.datashareVersion') }}</dt>
      <dd class="col-sm-2">{{ serverVersion }}</dd>
      <dt class="col-sm-1">{{ $t('about.clientVersion') }}</dt>
      <dd class="col-sm-2">{{ clientHash }}</dd>
      <dt class="col-sm-1">{{ $t('about.serverVersion') }}</dt>
      <dd class="col-sm-2">{{ serverHash }}</dd>
    </dl>
  </div>
</template>

<script>
import {DatashareClient} from '@/api/DatashareClient'

export default {
  name: 'about',
  created () {
    this.getServerVersion()
  },
  data () {
    return {
      serverHash: '',
      serverVersion: ''
    }
  },
  computed: {
    clientHash () {
      return process.env.VUE_APP_GIT_HASH.substring(0, 7)
    },
    promise () {
      return new DatashareClient().getVersion().then(r => r.json())
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

<style lang="scss">
.about {
  & .row {
    & dd {
      word-wrap: break-word;
    }
  }
}
</style>
