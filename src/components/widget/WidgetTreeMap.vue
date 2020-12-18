<template>
  <div class="widget widget--tree-map">
    <div class="widget__header" v-if="widget.title" :class="{ 'card-header': widget.card }">
      <h4 v-html="widget.title" class="m-0 h"></h4>
    </div>
    <div class="widget__content lead" :class="{ 'card-body': widget.card }">
      <div class="d-flex flex-row">
        <tree-breadcrumb
          :path="currentPath"
          no-datadir
          @input="update($event)"
          v-if="currentPath"
        ></tree-breadcrumb>
        <router-link
          :to="{ name: 'search', query: { index: widget.index, 'f[path]': currentPath } }"
          class="widget__content__search"
        >
          {{ $t('widget.treemap.seeDocuments') }}
        </router-link>
      </div>
      <div :id="id"></div>
    </div>
  </div>
</template>

<script>
import { get, isNull, uniqueId } from 'lodash'
import bodybuilder from 'bodybuilder'
import { format, hierarchy, select, treemap } from 'd3'
import { basename } from 'path'

import elasticsearch from '@/api/elasticsearch'
import TreeBreadcrumb from '@/components/TreeBreadcrumb'
import VueScrollTo from 'vue-scrollto'

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
      currentPath: null,
      height: 500,
      id: uniqueId('widget_tree_map')
    }
  },
  async mounted () {
    await this.update(this.$config.get('dataDir'))
    this.scrollToWidget()
  },
  methods: {
    scrollToWidget () {
      const scrollTo = get(this.$route, 'query.scrollTo', false)
      if (scrollTo === 'WidgetTreeMap') {
        const target = this.$el.querySelector(`#${ this.id }`)
        setTimeout(() => VueScrollTo.scrollTo(target, 100, { offset: 620, force: true }), 500)
      }
    },
    renderTreeMap (data) {
      const width = document.getElementById(this.id).offsetWidth

      const root = hierarchy(data).sum(d => d.doc_count)
      treemap()
        .size([width, this.height])
        .padding(2)(root)

      const svg = select(`#${ this.id } > svg`)
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
        .on('click', d => this.update(d.data.key))
        .on('mouseover', (_, index, nodes) => select(nodes[index]).style('cursor', 'pointer'))
      leaf
        .append('text')
        .attr('x', d => d.x0 + 5)
        .attr('y', d => d.y0 + 20)
        .text(d => basename(d.data.key))
        .attr('font-size', '12px')
        .attr('fill', 'black')
        .on('click', d => this.update(d.data.key))
        .on('mouseover', (_, index, nodes) => select(nodes[index]).style('cursor', 'pointer'))
      leaf
        .append('text')
        .attr('x', d => d.x0 + 5)
        .attr('y', d => d.y0 + 30)
        .text(d => `${ format(',d')(d.data.doc_count) } files`)
        .attr('font-size', '10px')
        .attr('fill', '#25252A')
        .on('click', d => this.update(d.data.key))
        .on('mouseover', (_, index, nodes) => select(nodes[index]).style('cursor', 'pointer'))
    },
    async getData (path) {
      const aggregationOptions = {
        include: path + '/.*',
        exclude: path + '/.*/.*',
        size: 29
      }
      const body = bodybuilder()
        .size(0)
        .andQuery('match', 'type', 'Document')
        .andQuery('match', 'extractionLevel', 0)
        .andFilter('term', 'dirname.tree', path)
        .agg('terms', 'dirname.tree', aggregationOptions, 'byDirname',
          sub => sub.agg('bucket_sort', { size: 50, from: 0 }, 'bucket_truncate'))
        .build()
      const result = await elasticsearch.search({ index: this.widget.index, body, size: 0 })
      const children = get(result, 'aggregations.byDirname.buckets', [])
      const others = get(result, 'aggregations.byDirname.sum_other_doc_count', [])
      return { children, others }
    },
    async update (path = null) {
      let children = null
      let others = null
      try {
        const response = await this.getData(path)
        children = response.children
        others = response.others
      } catch (_) {}
      // Error while downloading data or no more data to display
      if (isNull(children) || children.length === 0) {
        const currentPath = isNull(children) ? null : path
        const message = isNull(children) ? 'Please select a correct data file' : 'No folders'
        this.$set(this, 'currentPath', currentPath)
        select(`#${ this.id } > svg`).remove()
        const span = document.createElement('span')
        span.setAttribute('class', 'error')
        const text = document.createTextNode(message)
        span.appendChild(text)
        document.getElementById(this.id).appendChild(span)
      // Still data to display
      } else {
        this.$set(this, 'currentPath', path)
        select(`#${ this.id } > .error`).remove()
        if (select(`#${ this.id } > svg`).size() === 0) {
          select(`#${ this.id }`)
            .append('svg')
            .attr('width', '100%')
            .attr('height', this.height)
        } else {
          select(`#${ this.id } > svg > g`).remove()
        }
        children.push({ key: this.$t('widget.treemap.others'), doc_count: others })
        this.renderTreeMap({ children })
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
