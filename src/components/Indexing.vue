<template>
  <div class="indexing container-fluid">
    <div class="row">
      <form class="indexing__form mt-4 col-lg-3 col-md-4 order-last" id="indexing-form" @submit.prevent="submit">
        <div class="indexing__form__step_01 card" v-if="step === 1">
          <div class="card-header">
            <h3 class="h5 m-0">
              {{ $t('indexing.step_01') }}
            </h3>
          </div>
          <div class="form-group card-body my-0">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="index" v-model="index" value="index">
              <label class="form-check-label" for="index">
                {{ $t('indexing.index_stage_label') }}
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="findNames" v-model="findNames" value="findNames" :disabled="isIndexEmpty">
              <label class="form-check-label" for="findNames">
                {{ $t('indexing.findNames_stage_label') }}
              </label>
            </div>
          </div>
          <div class="form-group card-footer mb-0">
            <button class="btn btn-icij" type="button" @click="next">
              {{ $t('indexing.next') }}
            </button>
          </div>
        </div>
        <div class="indexing__form__step_02 card" v-if="step === 2 && index">
          <div class="card-header">
            <h3 class="h5 m-0">
              {{ $t('indexing.step_02') }}
            </h3>
          </div>
          <div class="form-group card-body my-0">
            <div class="form-check">
              <input class="form-check-input" type="radio" id="yes" value="1" v-model="ocr">
              <label class="form-check-label" for="yes">
                {{ $t('indexing.yes') }}
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" id="no" value="0" v-model="ocr">
              <label class="form-check-label" for="no">
                {{ $t('indexing.no') }}
              </label>
            </div>
          </div>
          <div class="form-group card-footer mb-0">
            <button class="btn btn-icij" type="button" @click="previous">
              {{ $t('indexing.previous') }}
            </button>
            <button class="btn btn-icij" type="button" @click="next">
              {{ $t('indexing.next') }}
            </button>
          </div>
        </div>
        <div class="indexing__form__step_03 card" v-if="step === 3 && findNames">
          <div class="card-header">
            <h3 class="h5 m-0">
              {{ $t('indexing.step_03') }}
            </h3>
          </div>
          <div class="form-group card-body my-0">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="pipeline_corenlp" v-model="pipeline_corenlp" name="pipeline_corenlp">
              <label class="form-check-label" for="pipeline_corenlp">
                Core NLP
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="pipeline_opennlp" v-model="pipeline_opennlp" name="pipeline_opennlp">
              <label class="form-check-label" for="pipeline_opennlp">
                Open NLP
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="pipeline_mitie" v-model="pipeline_mitie" name="pipeline_mitie">
              <label class="form-check-label" for="pipeline_mitie">
                Mitie
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="pipeline_ixapipe" v-model="pipeline_ixapipe" name="pipeline_ixapipe">
              <label class="form-check-label" for="pipeline_ixapipe">
                Ixa Pipe
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="pipeline_gatenlp" v-model="pipeline_gatenlp" name="pipeline_gatenlp">
              <label class="form-check-label" for="pipeline_gatenlp">
                Gate NLP
              </label>
            </div>
          </div>
          <div class="form-group card-footer mb-0">
            <button class="btn btn-icij" type="button" @click="previous">
              {{ $t('indexing.previous') }}
            </button>
            <button class="btn btn-icij" type="button" @click="next">
              {{ $t('indexing.next') }}
            </button>
          </div>
        </div>
        <div class="indexing__form__step_04 card" v-if="step === 4">
          <div class="card-header">
            <h3 class="h5 m-0">
              {{ $t('indexing.step_04') }}
            </h3>
          </div>
          <div class="form-group card-footer mb-0">
            <div>
              <span>{{ $t('indexing.index_stage_label') }} : </span>
              <span v-if="$store.state.indexing.form.index">{{ $t('indexing.yes') }}</span>
              <span v-if="!$store.state.indexing.form.index">{{ $t('indexing.no') }}</span>
            </div>
            <div v-if="$store.state.indexing.form.index">
              <span>{{ $t('indexing.ocr') }} : </span>
              <span v-if="$store.state.indexing.form.ocr">{{ $t('indexing.yes') }}</span>
              <span v-if="!$store.state.indexing.form.ocr">{{ $t('indexing.no') }}</span>
            </div>
            <div>
              <span>{{ $t('indexing.findNames_stage_label') }} : </span>
              <span v-if="$store.state.indexing.form.findNames">{{ $t('indexing.yes') }}</span>
              <span v-if="!$store.state.indexing.form.findNames">{{ $t('indexing.no') }}</span>
            </div>
            <div v-if="$store.state.indexing.form.findNames">
              <span>{{ $t('indexing.pipelines') }} : </span>
              <ul>
                <li v-if="$store.state.indexing.form.pipeline_corenlp">Core NLP</li>
                <li v-if="$store.state.indexing.form.pipeline_opennlp">Open NLP</li>
                <li v-if="$store.state.indexing.form.pipeline_mitie">Mitie</li>
                <li v-if="$store.state.indexing.form.pipeline_ixapipe">Ixa Pipe</li>
                <li v-if="$store.state.indexing.form.pipeline_gatenlp">Gate NLP</li>
              </ul>
            </div>
          </div>
          <div class="form-group card-footer mb-0">
            <button class="btn btn-icij" type="button" @click="previous">
              {{ $t('indexing.previous') }}
            </button>
            <button class="btn btn-icij" type="submit">
              {{ $t('indexing.btnLabel') }}
            </button>
          </div>
        </div>
        <p v-if="errors.length">
          <b>{{ $t('indexing.correct_errors') }}</b>
          <ul>
            <li v-for="error in errors" :key="error">{{ $t(error) }}</li>
          </ul>
        </p>
      </form>
      <div class="col-lg-9 col-md-8 mt-4" v-if="tasks.length">
        <div class="card">
          <div class="card-header">
            <h3 class="h5 m-0">
              {{ $t('indexing.ongoing') }}
            </h3>
          </div>
          <ul class="list-group list-group-flush">
            <li v-for="task in tasks" :key="task.name" class="indexing__tasks list-group-item">
              {{ taskLabel(task.name) }}
              <span class="badge badge-pill small float-right">
                {{ task.state }}
              </span>
              <div class="indexing__tasks__progress progress">
                <div class="progress-bar" :class="taskStateToClass(task.state)" role="progressbar" :style="'width: ' + getProgress(task.progress) + '%'" :aria-valuenow="getProgress(task.progress)" aria-valuemin="0" aria-valuemax="100">
                  {{ getProgress(task.progress) }}%
                </div>
              </div>
            </li>
          </ul>
          <div class="card-footer text-right border-0">
            <button class="btn btn-icij" type="button" @click="cleanTasks">
              {{ $t('indexing.purge') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { createHelpers } from 'vuex-map-fields'
import { mapState } from 'vuex'
import last from 'lodash/last'

const { mapFields } = createHelpers({
  getterType: `indexing/getField`,
  mutationType: `indexing/updateField`
})

export default {
  name: 'indexing',
  data () {
    return {
      step: 1,
      errors: []
    }
  },
  computed: {
    ...mapFields(['form.index', 'form.findNames', 'form.ocr', 'form.pipeline_corenlp', 'form.pipeline_opennlp', 'form.pipeline_mitie', 'form.pipeline_ixapipe', 'form.pipeline_gatenlp']),
    ...mapState('indexing', { tasks: state => state.tasks }),
    ...mapState('search', {
      isIndexEmpty: state => {
        return state.response.hits.length === 0
      }
    })
  },
  created () {
    this.$store.dispatch('search/query')
  },
  beforeRouteEnter (to, _from, next) {
    next(vm => {
      vm.$store.commit('indexing/startPolling')
    })
  },
  beforeRouteLeave (to, _from, next) {
    this.$store.commit('indexing/stopPolling')
    next()
  },
  methods: {
    previous () {
      if (this.validatePage()) {
        switch (this.step) {
          case 2:
            this.step = 1
            break
          case 3:
            this.step = (this.index ? 2 : 1)
            break
          case 4:
            this.step = (this.findNames ? 3 : (this.index ? 2 : 1))
            break
          default:
            this.step = 1
            break
        }
      }
    },
    next () {
      if (this.validatePage()) {
        switch (this.step) {
          case 1:
            this.step = (this.index ? 2 : (this.findNames ? 3 : 4))
            break
          case 2:
            this.step = (this.findNames ? 3 : 4)
            break
          case 3:
            this.step = 4
            break
          default:
            this.step = 1
            break
        }
      }
    },
    validatePage () {
      this.errors = []
      switch (this.step) {
        case 1:
          if (!this.$store.state.indexing.form.index && !this.$store.state.indexing.form.findNames) {
            this.errors.push('indexing.choose_one_action')
            return false
          }
          break
        case 2:
          break
        case 3:
          if (!this.$store.state.indexing.form.pipeline_corenlp && !this.$store.state.indexing.form.pipeline_opennlp && !this.$store.state.indexing.form.pipeline_mitie && !this.$store.state.indexing.form.pipeline_ixapipe && !this.$store.state.indexing.form.pipeline_gatenlp) {
            this.errors.push('indexing.choose_one_pipeline')
            return false
          }
          break
        case 4:
          break
      }
      return true
    },
    submit () {
      this.$store.dispatch('indexing/query')
    },
    cleanTasks () {
      this.$store.dispatch('indexing/cleanTasks')
    },
    taskLabel (name) {
      let nameAndId = last(name.split('.')).split('@')
      return nameAndId[0] + '(' + nameAndId[1] + ')'
    },
    taskStateToClass (state) {
      switch (state) {
        case ('DONE'): return 'bg-success'
        case ('ERROR'): return 'bg-danger'
        case ('CANCELLED'): return 'bg-warning'
        case ('RUNNING'): return 'bg-info'
      }
    },
    getProgress (value) {
      if (value === -2.0) {
        return 100
      }
      if (value === -1.0) {
        return 0
      }
      return Math.round(value * 100)
    }
  }
}
</script>
