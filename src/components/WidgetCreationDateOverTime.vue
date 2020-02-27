<template>
  <svg class="chart"></svg>
</template>

<script>
import get from 'lodash/get'
import maxBy from 'lodash/maxBy'
import sortBy from 'lodash/sortBy'
import * as d3 from 'd3'

export default {
  methods: {
    async buildChart () {
      const response = await this.$store.dispatch('search/queryFilter', { name: 'creationDate', options: { size: 1000 } })
      const aggregation = get(response, ['aggregations', 'metadata.tika_metadata_creation_date', 'buckets'])
      const data = sortBy(aggregation, ['key'])

      const width = 960
      const height = 500
      const max = maxBy(data, 'doc_count').doc_count
      const barWidth = width / data.length

      const y = d3.scaleLinear()
        .domain([0, max])
        .range([height, 0])

      const chart = d3.select('.chart')
        .attr('width', width)
        .attr('height', height)

      const bar = chart.selectAll('g')
        .data(data)
        .enter().append('g')
        .attr('transform', (d, i) => 'translate(' + i * barWidth + ',0)')

      bar.append('rect')
        .attr('y', d => y(d.doc_count))
        .attr('height', d => height - y(d.doc_count))
        .attr('width', barWidth - 1)

      bar.append('text')
        .attr('x', barWidth / 2)
        .attr('y', d => y(d.doc_count) + 3)
        .attr('dy', '.75em')
        .text(d => d.key_as_string)
    }
  },
  mounted () {
    this.buildChart()
  }
}
</script>

<style lang="scss">
  .chart rect {
    fill: steelblue;
  }

  .chart text {
    fill: white;
    font: 10px sans-serif;
    text-anchor: middle;
  }
</style>
