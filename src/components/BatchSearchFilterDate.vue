<template>
  <column-filter :id="id" :name="name" :active="isActive">
    <keep-alive>
      <date-picker
        :key="`date-${id}`"
        v-model="selectedDateRange"
        is-range
        color="gray"
        class="border-0"
        :max-date="new Date()"
        :model-config="modelConfig"
        :locale="locale"
      >
      </date-picker>
    </keep-alive>
  </column-filter>
</template>

<script>
import moment from 'moment'
import DatePicker from 'v-calendar/lib/components/date-picker.umd'

import ColumnFilter from '@/components/ColumnFilter'
export default {
  name: 'BatchSearchFilterDate',
  components: {
    ColumnFilter,
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
  computed: {
    isActive() {
      return this.date !== null
    },
    modelConfig() {
      return {
        type: 'number'
      }
    },
    locale() {
      return this.$i18n.locale
    },
    selectedDateRange: {
      get() {
        if (this.date?.start && this.date?.end) {
          const start = this.startTimeAdjust(this.date?.start)
          const end = this.endTimeAdjust(this.date?.end)
          return { start, end }
        }
        return this.date
      },
      set(values) {
        this.$emit('update', values)
      }
    }
  },
  methods: {
    startTimeAdjust(start) {
      return moment(start).locale(this.$i18n.locale).startOf('day').valueOf()
    },
    endTimeAdjust(end) {
      return moment(end).locale(this.$i18n.locale).endOf('day').valueOf()
    }
  }
}
</script>
