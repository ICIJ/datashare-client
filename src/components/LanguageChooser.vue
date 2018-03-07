<template>
  <div class="language-chooser">
    <select v-model="language" @change="onChange">
      <option selected value="en">English</option>
      <option value="fr">French</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'language-chooser',
  data () {
    return {
      language: 'en'
    }
  },
  methods: {
    onChange (event) {
      this.$root.$i18n.locale = event.target.value
    }
  }
}
</script>
