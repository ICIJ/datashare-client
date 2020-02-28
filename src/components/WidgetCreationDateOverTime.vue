<template>
  <div class="widget widget--text">
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
  props: {
    widget: {
      type: Object
    }
  },
  methods: {
    async buildChart () {
      const response = await this.$store.dispatch('search/queryFilter', { name: 'creationDate', options: { size: 1000 } })
      const aggregation = get(response, ['aggregations', 'metadata.tika_metadata_creation_date', 'buckets'])
      const dates = map(aggregation, d => {
        if (d.key_as_string !== '0000-01') {
          d.date = new Date(d.key)
          return d
        }
      })
      const data = sortBy(compact(dates), ['key'])

      const margin = { top: 20, right: 20, bottom: 100, left: 50 }
      const height = 500 - margin.top - margin.bottom
      const width = 960 - margin.left - margin.right

      const svg = d3.select('.chart')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

      const x = d3.scaleTime()
        .domain([new Date('2005-01-01'), new Date('2020-01-01')])
        .range([0, width])

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.doc_count)])
        .range([height, 0])

      svg.append('g')
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => x(d.date))
        .attr('y', d => y(d.doc_count))
        .attr('width', '12')
        .attr('height', d => height - y(d.doc_count))

      svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x))

      svg.append('g')
        .call(d3.axisLeft(y))
    }
  },
  mounted () {
    this.buildChart()
  }
}
</script>

<style lang="scss">
  .widget--text {
    min-height: 100%;
  }

  .chart {
    margin: 10px;
  }

  .chart rect {
    fill: steelblue;
  }
</style>
