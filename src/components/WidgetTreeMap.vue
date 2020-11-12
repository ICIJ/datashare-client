<template>
  <div class="widget widget--tree-map">
    <div class="widget__header" v-if="widget.title" :class="{ 'card-header': widget.card }">
      <h4 v-html="widget.title" class="m-0 h"></h4>
    </div>
    <div class="widget__content lead" :class="{ 'card-body': widget.card }">
      <div :id="id"></div>
    </div>
  </div>
</template>

<script>
import { format, hierarchy, select, treemap } from 'd3'
import { uniqueId } from 'lodash'

/**
 * Widget to display a tree map on the insights page.
 */
export default {
  name: 'WidgetTreeMap',
  props: {
    /**
     * The widget definition object.
     */
    widget: {
      type: Object
    }
  },
  data () {
    return {
      id: uniqueId('widget_tree_map')
    }
  },
  mounted () {
    if (!this.widget.data) {
      const span = document.createElement('span')
      const text = document.createTextNode('Please select a data file')
      span.appendChild(text)
      document.getElementById(this.id).appendChild(span)
    } else {
      const width = document.getElementById(this.id).offsetWidth
      const height = 500

      const root = hierarchy(this.widget.data).sum(d => d.count_including_children)
      const treemap2 = treemap()
        .size([width, height])
        .padding(2)
      treemap2(root)

      const svg = select(`#${this.id}`)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')

      const leaf = svg.selectAll('g')
        .data(root.leaves())
        .enter()

      leaf
        .append('rect')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .style('fill', '#FA4070')
        .style('fill-opacity', 0.5)
      leaf
        .append('text')
        .attr('x', d => d.x0 + 5)
        .attr('y', d => d.y0 + 20)
        .text(d => this.widget.transformName(d.data.dirname))
        .attr('font-size', '12px')
        .attr('fill', 'black')
      leaf
        .append('text')
        .attr('x', d => d.x0 + 5)
        .attr('y', d => d.y0 + 30)
        .text(d => `${ format(',d')(d.data.count_including_children) } files`)
        .attr('font-size', '10px')
        .attr('fill', '#25252A')
    }
  }
}
</script>

<style lang="scss" scoped>
  .widget--tree-map {
    min-height: 100%;
  }
</style>
