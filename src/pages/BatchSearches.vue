<template>
  <div class="batchsearches container pt-4">
    <b-form @submit.prevent="onSubmit">
      <div class="card">
        <div class="card-header">
          <h3 class="h5 m-0">
            Batch Searches
          </h3>
        </div>
        <div class="m-4">
          <b-form-group
            id="group-name"
            label="Name:"
            label-for="name"
          >
            <b-form-input
              id="name"
              :value="name"
              type="text"
              required
              placeholder="Search name"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            id="group-description"
            label="Description:"
            label-for="description"
          >
            <b-form-textarea
              id="description"
              :value="description"
              placeholder="Search description"
              rows="3"
              max-rows="6"
            ></b-form-textarea>
          </b-form-group>
          <b-form-group
            id="group-file"
            label="CSV file:"
            label-for="file"
            description="Only CSV format accepted."
          >
            <b-form-file
              :value="file"
              :state="Boolean(file)"
              placeholder="Choose a file..."
              drop-placeholder="Drop file here..."
              accept=".csv"
              required
            ></b-form-file>
          </b-form-group>
        </div>
        <div class="card-footer text-right border-0">
          <b-button type="submit" variant="primary">Submit</b-button>
        </div>
      </div>
    </b-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'BatchSearches',
  computed: {
    ...mapState('batchSearches', ['name', 'description', 'file'])
  },
  methods: {
    onSubmit () {
      this.$store.dispatch('batchSearches/onSubmit')
    }
  }
}
</script>
