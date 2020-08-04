<template>
  <div class="extensions h-100">
    <b-card-group deck>
      <b-card :header="extension.name" v-for="extension in extensions" :key="extension.id" class="extensions__card mb-3" footer-bg-variant="white" footer-border-variant="white">
        <b-card-text>
          <div>
            {{ extension.description }}
          </div>
          <div v-if="extension.version" class="font-italic mt-2">
            {{ $t('extension.version') }}: {{ extension.version }}
          </div>
        </b-card-text>
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
  }
}
</script>

<style scoped>

</style>
