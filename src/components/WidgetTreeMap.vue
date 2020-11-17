<template>
  <div class="widget widget--tree-map">
    <div class="widget__header" v-if="widget.title" :class="{ 'card-header': widget.card }">
      <h4 v-html="widget.title" class="m-0 h"></h4>
    </div>
    <div class="widget__content lead" :class="{ 'card-body': widget.card }">
      <tree-breadcrumb :path="currentPath" no-datadir @input="refreshTreeMap($event)" v-if="currentPath"></tree-breadcrumb>
      <div :id="id">
        <svg width="100%" height="500"></svg>
      </div>
    </div>
  </div>
</template>

<script>
import { hierarchy, select, treemap } from 'd3'
import { uniqueId } from 'lodash'

import TreeBreadcrumb from '@/components/TreeBreadcrumb'

/**
 * Widget to display a tree map on the insights page.
 */
export default {
  name: 'WidgetTreeMap',
  components: {
    TreeBreadcrumb
  },
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
      id: uniqueId('widget_tree_map'),
      currentPath: null
    }
  },
  async mounted () {
    await this.refreshTreeMap(this.widget.baseDirname)
  },
  methods: {
    cleanTreeMap (path) {
      return select(path).remove()
    },
    renderTreeMap (data) {
      this.cleanTreeMap(`#${this.id} > svg > g`)

      const width = document.getElementById(this.id).offsetWidth
      const height = 500

      const root = hierarchy(data).sum(d => d.count_including_children)
      treemap()
        .size([width, height])
        .padding(2)(root)

      const svg = select(`#${this.id} > svg`)
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
        .on('click', d => this.refreshTreeMap(d.data.dirname))
      leaf
        .append('text')
        .attr('x', d => d.x0 + 5)
        .attr('y', d => d.y0 + 20)
        .text(d => this.widget.getTitle(d))
        .attr('font-size', '12px')
        .attr('fill', 'black')
      leaf
        .append('text')
        .attr('x', d => d.x0 + 5)
        .attr('y', d => d.y0 + 30)
        .text(d => this.widget.getSubtitle(d))
        .attr('font-size', '10px')
        .attr('fill', '#25252A')
    },
    async refreshTreeMap (path) {
      try {
        this.$set(this, 'currentPath', path)
        const dataSource = await this.widget.getData(path)
        this.renderTreeMap(dataSource)
      } catch (_) {
        this.$set(this, 'currentPath', null)
        this.cleanTreeMap(`#${this.id} > svg`)
        const span = document.createElement('span')
        const text = document.createTextNode('Please select a correct data file')
        span.appendChild(text)
        document.getElementById(this.id).appendChild(span)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .widget--tree-map {
    min-height: 100%;
  }
</style>
