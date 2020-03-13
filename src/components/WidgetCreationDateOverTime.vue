<template>
  <div class="widget">
    <div class="widget__header" v-if="widget.title" :class="{ 'card-header': widget.card }">
      <h4 v-html="widget.title" class="m-0"></h4>
    </div>
    <div class="widget__content lead" :class="{ 'card-body': widget.card }">
      <svg class="chart" :height="height" :width="width">
        <g :style="{ transform: `translate(${margin.left}px, ${margin.top}px)` }">
          <g class="axis-x" :style="{ transform: `translate(0px, ${this.innerHeight}px)` }"></g>
          <text transform="translate(445, 450)" style="text-anchor: middle;">Time</text>
          <g class="axis-y"></g>
          <text transform="rotate(-90)" y="-35" x="-190" style="text-anchor: middle;">Number of documents</text>
          <rect v-for="(bar, index) in bars" :key="index" :x="bar.x" :y="bar.y" :height="bar.height" :width="bar.width"></rect>
        </g>
      </svg>
    </div>
  </div>
</template>

<script>
import compact from 'lodash/compact'
import get from 'lodash/get'
import map from 'lodash/map'
import sortBy from 'lodash/sortBy'
import * as d3 from 'd3'
import { mapState } from 'vuex'

export default {
  name: 'WidgetCreationDateOverTime',
  props: {
    widget: {
      type: Object
    }
  },
  data () {
    return {
      data: [],
      height: 500,
      width: 960,
      margin: { top: 20, right: 20, bottom: 100, left: 50 }
    }
  },
  watch: {
    index () {
      this.init()
    }
  },
  computed: {
    ...mapState('search', ['index']),
    innerHeight () {
      return this.height - this.margin.top - this.margin.bottom
    },
    innerWidth () {
      return this.width - this.margin.left - this.margin.right
    },
    x () {
      return d3.scaleTime()
        .domain([d3.min(this.data, d => d.date), d3.max(this.data, d => d.date)])
        .range([0, this.innerWidth])
        .nice()
    },
    y () {
      return d3.scaleLinear()
        .domain([0, d3.max(this.data, d => d.doc_count)])
        .range([this.innerHeight, 0])
    },
    bars () {
      return this.data.map(d => {
        return {
          x: this.x(d.date),
          y: this.y(d.doc_count),
          height: this.innerHeight - this.y(d.doc_count),
          width: this.x(d3.timeDay.offset(d.date, 10)) - this.x(d.date)
        }
      })
    }
  },
  methods: {
    async loadData () {
      const response = await this.$store.dispatch('search/queryFilter', { name: 'creationDate', options: { size: 1000 } })
      const aggregation = get(response, ['aggregations', 'metadata.tika_metadata_creation_date', 'buckets'])
      const dates = map(aggregation, d => {
        if (d.key >= 0) {
          d.date = new Date(d.key)
          return d
        }
      })
      return sortBy(compact(dates), ['key'])
    },
    buildChart () {
      // Create the x axis
      const xAxis = d3.select('.axis-x').call(d3.axisBottom(this.x))
      xAxis.selectAll('.tick text')
        .attr('transform', 'translate(20, 20) rotate(45)')
      // Create the y axis
      d3.select('.axis-y').call(d3.axisLeft(this.y))
    },
    async init () {
      this.data = await this.loadData()
      this.buildChart()
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style lang="scss">
  .widget {
    min-height: 100%;

    .chart rect {
      fill: $primary;
    }
  }
</style>
