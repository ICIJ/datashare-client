<template>
  <batch-search-filter :id="id" :name="name" :active="isActive">
    <keep-alive>
      <date-picker is-range color="gray" :max-date="new Date()" v-model="selectedDateRange"
        :model-config="modelConfig" :key="`date-${id}`" :locale="locale">
      </date-picker>
    </keep-alive>
  </batch-search-filter>
</template>

<script>
import BatchSearchFilter from '@/components/BatchSearchFilter'
import moment from 'moment'
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
    startTimeAdjust (start) {
      return moment(start).locale(this.$i18n.locale).startOf('day').valueOf()
    },
    endTimeAdjust (end) {
      return moment(end).locale(this.$i18n.locale).endOf('day').valueOf()
    }
  },
  computed: {
    isActive () {
      return this.date !== null
    },
    modelConfig () {
      return {
        type: 'number'
      }
    },
    locale () {
      return this.$i18n.locale
    },
    selectedDateRange: {
      get () {
        if (this.date?.start && this.date?.end) {
          const start = this.startTimeAdjust(this.date?.start)
          const end = this.endTimeAdjust(this.date?.end)
          return { start, end }
        }
        return this.date
      },
      set (values) {
        this.$emit('update', values)
      }
    }

  }
}
</script>
