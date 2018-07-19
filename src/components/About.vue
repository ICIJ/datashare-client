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
      return process.env.CONFIG.git_hash.substring(0, 7)
    }
  },
  methods: {
    getServerVersion () {
      return new DatashareClient().getVersion().then(r => r.json().then(json => {
        this.serverHash = json['git.commit.id.abbrev']
        this.serverVersion = json['git.build.version']
      }))
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
