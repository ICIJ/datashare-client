<template>
  <div class="batchsearches container pt-4">
    <b-form @submit="onSubmit" @reset="onReset">
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
              v-model="name"
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
              v-model="description"
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
            required
          >
            <b-form-file
              v-model="file"
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
export default {
  name: 'BatchSearches',
  data () {
    return {
      name: '',
      description: '',
      file: null
    }
  },
  methods: {
    onSubmit () {
    },
    onReset () {
    }
  }
}
</script>
