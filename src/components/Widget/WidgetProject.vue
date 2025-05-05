<template>
  <div class="widget widget--project">
    <ul class="list-group list-group-flush widget__fields small">
      <li
        v-for="{ key, label, href, value, classList } in metadata"
        :key="key"
        class="widget__fields__item list-group-item"
        :class="`widget__fields__item--${key}`"
      >
        <div class="row">
          <div class="col-4 fw-bold text-uppercase text-muted widget__fields__item__label">
            {{ label }}
          </div>
          <div class="col-8 widget__fields__item__value">
            <a v-if="href" :href="href" class="text-truncate d-block">
              {{ value }}
            </a>
            <span v-else :class="classList">
              {{ value || '-' }}
            </span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import moment from 'moment'
import { isFunction, kebabCase } from 'lodash'
import { useI18n } from 'vue-i18n'

/**
 * A placeholder widget for the insights page. This widget is not intended to be used directly.
 */
export default {
  name: 'WidgetEmpty',
  props: {
    /**
     * The widget definition object.
     */
    widget: {
      type: Object,
      default: () => ({})
    },
    /**
     * The project name.
     */
    project: {
      type: String,
      required: true
    }
  },
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data() {
    return {
      fields: [
        {
          key: 'name',
          classList: 'border font-monospace. px-1 bg-tertiary rounded'
        },
        {
          key: 'sourcePath',
          formatter({ rawValue }) {
            return rawValue?.split('//').pop()
          }
        },
        {
          key: 'maintainerName'
        },
        {
          key: 'publisherName'
        },
        {
          key: 'sourceUrl',
          href({ rawValue }) {
            return rawValue
          },
          formatter({ rawValue }) {
            return rawValue?.split('//').pop()
          }
        },
        {
          key: 'creationDate',
          formatter: ({ rawValue }) => {
            return moment(rawValue).locale(this.$i18n.locale).format('LL')
          }
        },
        {
          key: 'updateDate',
          formatter: ({ rawValue }) => {
            return moment(rawValue).locale(this.$i18n.locale).format('LL')
          }
        }
      ]
    }
  },
  computed: {
    metadata() {
      return this.fields.map((field) => {
        const project = this.$core.findProject(this.project)
        const rawValue = project[field.key]
        const value = isFunction(field.formatter) ? field.formatter({ ...field, rawValue }) : rawValue
        const href = isFunction(field.href) ? field.href({ ...field, rawValue, value }) : null
        const label = this.t(`widget.project.fields.${field.key}`)
        const key = kebabCase(field.key)
        return { ...field, key, label, href, rawValue, value }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.widget--project {
  min-height: 100%;
}
</style>
