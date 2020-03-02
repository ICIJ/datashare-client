<template>
  <div class="widget">
    <div class="widget__header" v-if="widget.title" :class="{ 'card-header': widget.card }">
      <h4 v-html="widget.title" class="m-0"></h4>
    </div>
    <div class="widget__content lead" :class="{ 'card-body': widget.card }">
      <svg class="chart"></svg>
    </div>
  </div>
</template>

<script>
import compact from 'lodash/compact'
import get from 'lodash/get'
import map from 'lodash/map'
import sortBy from 'lodash/sortBy'
import * as d3 from 'd3'

export default {
  name: 'WidgetCreationDateOverTime',
  props: {
    widget: {
      type: Object
    }
  },
  data () {
    return {
      data: []
    }
  },
  methods: {
    async loadData () {
      const response = await this.$store.dispatch('search/queryFilter', { name: 'creationDate', options: { size: 1000 } })
      const aggregation = get(response, ['aggregations', 'metadata.tika_metadata_creation_date', 'buckets'])
      const dates = map(aggregation, d => {
        if (d.key_as_string !== '0000-01') {
          d.date = new Date(d.key)
          return d
        }
      })
      return sortBy(compact(dates), ['key'])
    },
    buildChart () {
      const margin = { top: 20, right: 20, bottom: 100, left: 50 }
      const height = 500 - margin.top - margin.bottom
      const width = 960 - margin.left - margin.right

      const svg = d3.select('.chart')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

      const x = d3.scaleTime()
        .domain([d3.min(this.data, d => d.date), d3.max(this.data, d => d.date)])
        .range([0, width])
        .nice()

      const y = d3.scaleLinear()
        .domain([0, d3.max(this.data, d => d.doc_count)])
        .range([height, 0])

      svg.append('g')
        .selectAll('rect')
        .data(this.data)
        .enter()
        .append('rect')
        .attr('x', d => x(d.date))
        .attr('y', d => y(d.doc_count))
        .attr('width', d => x(d3.timeDay.offset(d.date, 10)) - x(d.date))
        .attr('height', d => height - y(d.doc_count))

      // Create the x axis
      const xAxis = d3.axisBottom(x)
        .tickValues(this.data.map(d => d.date))
        .tickFormat(d3.timeFormat('%m-%Y'))
      // Add the x axis
      svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)
      svg.selectAll('.tick text')
        .attr('transform', 'translate(20, 20) rotate(45)')
      // Text label for the x axis
      svg.append('text')
        .attr('transform', `translate(${(width / 2)}, ${(height + margin.top + 20)})`)
        .style('text-anchor', 'middle')
        .text('Time')

      // Add the y axis
      svg.append('g')
        .call(d3.axisLeft(y))
      // Text label for the y axis
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 15 - margin.left)
        .attr('x', 0 - (height / 2))
        .style('text-anchor', 'middle')
        .text('Number of documents')
    }
  },
  async mounted () {
    this.data = await this.loadData()
    this.buildChart()
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
