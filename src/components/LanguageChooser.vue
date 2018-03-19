<template>
  <label class="input-group m-0 language-chooser">
    <span class="input-group-prepend">
      <span class="input-group-text">
        <font-awesome-icon icon="globe"/>
        <span class="pl-2 d-none d-lg-inline">
          Language
        </span>
      </span>
    </span>
    <select v-model="language" @change="onChange" class="custom-select">
      <option selected value="en">English</option>
      <option value="fr">Français</option>
    </select>
  </label>
</template>

<script>
import moment from 'moment'
export default {
  name: 'language-chooser',
  data () {
    return {
      language: 'en'
    }
  },
  created () {
    moment.locale(this.language)
  },
  methods: {
    onChange (event) {
      this.$root.$i18n.locale = event.target.value
      moment.locale(event.target.value)
      this.$emit('changed', event.target.value)
    }
  }
}
</script>
