<template>
  <column-filter :id="id" :name="name" :active="isActive">
    {{  date }}
    <keep-alive>
      <date-picker
        :key="`date-${id}`"
        v-model.range.number="selectedDateRange"
        color="gray"
        class="border-0"
        :max-date="new Date()"
        :locale="locale"
      >
      </date-picker>
    </keep-alive>
  </column-filter>
</template>

<script>
import moment from 'moment'
import { DatePicker } from 'v-calendar'

import ColumnFilter from '@/components/ColumnFilter'
export default {
  name: 'BatchSearchFilterDate',
  components: {
    ColumnFilter,
    DatePicker
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
    modelValue: {
      type: Object,
      default:()=>({})
    }
  },
  emits: ['update:modelValue'],
  computed: {
    isActive() {
      return this.modelValue?.start && this.modelValue?.end
    },
    locale() {
      return this.$i18n.locale
    },
    selectedDateRange: {
      get() {
        const start = this.startTimeAdjust(this.modelValue?.start)
        const end = this.endTimeAdjust(this.modelValue?.end)
        return { start, end }
      },
      set(values) {
        this.$emit('update:modelValue', values)
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
