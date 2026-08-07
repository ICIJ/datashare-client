import { defineAsyncComponent, markRaw } from 'vue'
import iteratee from 'lodash/iteratee'
import isFunction from 'lodash/isFunction'

import WidgetListGroup from '@/store/widgets/WidgetListGroup'

// See WidgetEmpty.js for why this is lazy.
const Component = defineAsyncComponent(() => import('@/components/Widget/WidgetFieldFacets'))

function castFunction(value) {
  if (isFunction(value)) {
    return value
  }
  return () => value
}

/**
 * Widget to display a list of items or links on the insights page
 */
class WidgetFieldFacets extends WidgetListGroup {
  /**
   * Create a new WidgetFacets
   * @param title=null {string} - The title of the widget
   * @param field="type" {string} - Field to build the facet uppon
   * @param icon=null {mixed}
   * @param routeQueryField=null {string}
   * @param bucketTranslation {mixed}
   * @param options {Object} - See WidgetEmpty for others options
   */
  constructor({
    title = null,
    field = 'type',
    icon = null,
    routeQueryField = null,
    bucketTranslation = iteratee('key'),
    ...options
  }) {
    super(options)
    this.title = title ?? options.name ?? field
    this.field = field
    this.icon = icon ? markRaw(icon) : null
    this.routeQueryField = routeQueryField
    this.bucketTranslation = castFunction(bucketTranslation)
  }

  get component() {
    return Component
  }
}

export default WidgetFieldFacets
