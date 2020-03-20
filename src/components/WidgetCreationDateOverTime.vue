<template>
  <div class="widget">
    <div class="widget__header d-flex align-items-center" v-if="widget.title" :class="{ 'card-header': widget.card }">
      <h4 v-html="widget.title" class="m-0 flex-grow-1"></h4>
      <div class="widget__header__selector">
        Years | <strong>Months</strong> | Days
      </div>
    </div>
    <div class="widget__content" :class="{ 'card-body': widget.card }">
      <div class="widget__content__chart align-items-center">
        <v-wait for="loading creationDate data">
          <div class="widget__content__chart__spinner" slot="waiting">
            <fa icon="circle-notch" spin size="2x" />
          </div>
          <svg :height="height" width="100%" shape-rendering="crispEdges">
            <g :style="{ transform: `translate(${margin.left}px, ${margin.top}px)` }">
              <g class="widget__content__chart__axis widget__content__chart__axis--x" :style="{ transform: `translate(0px, ${this.innerHeight}px)` }"></g>
              <g class="widget__content__chart__axis widget__content__chart__axis--y"></g>
              <g class="widget__content__chart__bars">
                <rect v-for="(bar, index) in bars" :key="index" :x="bar.x" :y="bar.y" :height="bar.height" :width="bar.width"></rect>
              </g>
            </g>
          </svg>
        </v-wait>
      </div>
    </div>
  </div>
</template>

<script>
import compact from 'lodash/compact'
import get from 'lodash/get'
import map from 'lodash/map'
import ResizeObserver from 'resize-observer-polyfill'
import sortBy from 'lodash/sortBy'
import * as d3 from 'd3'
import { mapState } from 'vuex'
import { waitFor } from 'vue-wait'

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
      mounted: false,
      width: 0,
      margin: { top: 20, right: 20, bottom: 20, left: 50 }
    }
  },
  watch: {
    index () {
      this.init()
    }
  },
  mounted () {
    this.$nextTick(() => this.init())
  },
  computed: {
    ...mapState('search', ['index']),
    container () {
      return this.mounted ? this.$el.querySelector('.widget__content__chart') : null
    },
    chart () {
      return this.mounted ? d3.select(this.container).select('svg') : null
    },
    height () {
      return this.width * 1 / 2
    },
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
    loadData: waitFor('loading creationDate data', async function () {
      const response = await this.$store.dispatch('search/queryFilter', { name: 'creationDate', options: { size: 1000 } })
      const aggregation = get(response, ['aggregations', 'metadata.tika_metadata_creation_date', 'buckets'])
      const dates = map(aggregation, d => {
        if (d.key >= 0) {
          d.date = new Date(d.key)
          return d
        }
      })
      return sortBy(compact(dates), ['key'])
    }),
    buildChart () {
      // Refresh the width so all computed properties that are dependent of
      //  this value are refreshed (including scale functions)
      this.width = this.container.offsetWidth
      // Create/Update the x axis
      this.chart.select('.widget__content__chart__axis--x')
        .call(d3.axisBottom(this.x))
      // Create/Update the y axis
      this.chart.select('.widget__content__chart__axis--y')
        .call(d3.axisLeft(this.y))
        .selectAll('.tick line')
        .attr('x2', this.width - this.margin.left - this.margin.right)
    },
    async init () {
      this.data = await this.loadData()
      this.mounted = true
      // Build the chart when its container is resized
      const observer = new ResizeObserver(this.buildChart)
      observer.observe(this.container)
    }
  }
}
</script>

<style lang="scss">
  .widget {
    min-height: 100%;

    &__content {

      &__chart {
        position: relative;
        padding-top: 50%;
        width: 100%;

        &__spinner {
          position: absolute;
          top: 0%;
          left: 0%;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          .card & {
            background: $card-bg;
          }
        }

        svg:not(.svg-inline--fa) {
          position: absolute;
          top: 0%;
          left: 0%;
          font-family: $font-family-base;
        }

        rect {
          fill: $primary;
        }

        &__axis {

          .tick line {
            color: $gray-300;
          }

          .domain,
          &--x .tick line {
            display: none;
          }
        }
      }
    }
  }
</style>
