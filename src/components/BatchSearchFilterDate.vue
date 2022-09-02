<template>
  <batch-search-filter :id="id" :name="name" :active="isActive">
    <keep-alive>
      <date-picker
        is-range
        color="gray"
        :max-date="new Date()"
        v-model="selectedDateRange"
        :model-config="{ type: 'number' }"
        :locale="locale"
        :key="locale">
      </date-picker>
    </keep-alive>
  </batch-search-filter>
</template>

<script>
import BatchSearchFilter from '@/components/BatchSearchFilter'
import DatePicker from 'v-calendar/lib/components/date-picker.umd'
export default {
  name: 'BatchSearchFilterDate',
  components: {
    BatchSearchFilter,
    DatePicker
  },
  model: {
    prop: 'selectedDateRange',
    event: 'update'
  },
  props: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    date: {
      type: Object
    }
  },
  methods: {

  },
  computed: {
    isActive () {
      return this.date !== null
    },
    locale () {
      return this.$i18n.locale
    },
    selectedDateRange: {
      get () {
        return this.date
      },
      set (values) {
        this.$emit('update', values)
      }
    }

  }
}
</script>
