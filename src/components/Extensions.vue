<template>
  <div class="extensions h-100">
    <b-card-group deck>
      <b-card :header="extension.name" v-for="extension in extensions" :key="extension.id" class="extensions__card mb-3" footer-bg-variant="white" footer-border-variant="white">
        <b-card-text>
          <div>
            {{ extension.description }}
          </div>
          <div v-if="extension.version" class="font-italic mt-2">
            {{ $t('extensions.version') }}: {{ extension.version }}
          </div>
        </b-card-text>
        <template v-slot:footer>
          <div class="text-center">
            <b-btn :href="extension.url" target="_blank" :title="$t('extensions.homePage')" v-if="extension.url">
              <fa icon="home"></fa>
            </b-btn>
            <b-btn class="ml-2" @click="installExtensionFromId(extension.id)" :title="$t('extensions.install')">
              <fa icon="cloud-upload-alt"></fa>
            </b-btn>
          </div>
        </template>
      </b-card>
    </b-card-group>
  </div>
</template>

<script>
import Api from '@/api'

const api = new Api()

export default {
  name: 'Extensions',
  data () {
    return {
      extensions: []
    }
  },
  async mounted () {
    const extensions = await api.getExtensions()
    this.$set(this, 'extensions', extensions)
  },
  methods: {
    async installExtensionFromId (extensionId) {
      try {
        await api.installExtensionFromId(extensionId)
        this.$bvToast.toast(this.$t('extensions.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('extensions.submitError'), { noCloseButton: true, variant: 'danger' })
      }
    }
  }
}
</script>

<style scoped>

</style>
