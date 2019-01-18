<template>
  <form class="indexing-form" id="indexing-form" @submit.prevent="submit">
    <div class="indexing-form__step--01 indexing-form__step" v-if="step === 1">
      <div class="indexing-form__step__header mb-4">
        <h4>
          {{ $t('indexing.step_01') }}
        </h4>
      </div>
      <div class="indexing-form__step__body form-group my-0 pl-4">
        <div class="custom-control custom-checkbox">
          <input class="custom-control-input" type="checkbox" id="index" v-model="index" value="index">
          <label class="custom-control-label" for="index">
            {{ $t('indexing.index_stage_label') }}
          </label>
        </div>
        <div class="custom-control custom-checkbox">
          <input class="custom-control-input" type="checkbox" id="findNames" v-model="findNames" value="findNames" :disabled="isFindNamesDisabled">
          <label class="custom-control-label" for="findNames">
            {{ $t('indexing.findNames_stage_label') }}
          </label>
        </div>
      </div>
      <div class="indexing-form__step__footer mt-4 text-right">
        <button class="btn btn-dark" type="button" @click="next">
          {{ $t('indexing.next') }}
        </button>
      </div>
    </div>
    <div class="indexing-form__step--02 indexing-form__step" v-if="step === 2 && index">
      <div class="indexing-form__step__header mb-4">
        <h4>
          {{ $t('indexing.step_02') }}
        </h4>
      </div>
      <div class="indexing-form__step__body form-group my-0 pl-4">
        <div class="custom-control custom-radio">
          <input class="custom-control-input" type="radio" id="yes" value="true" v-model="ocr">
          <label class="custom-control-label" for="yes">
            {{ $t('indexing.yes') }}
          </label>
        </div>
        <div class="custom-control custom-radio">
          <input class="custom-control-input" type="radio" id="no" value="false" v-model="ocr">
          <label class="custom-control-label" for="no">
            {{ $t('indexing.no') }}
          </label>
        </div>
      </div>
      <div class="indexing-form__step__footer mt-4 row no-gutters">
        <div class="col">
          <button class="btn btn-dark" type="button" @click="previous">
            {{ $t('indexing.previous') }}
          </button>
        </div>
        <div class="col text-right">
          <button class="btn btn-dark" type="button" @click="next">
            {{ $t('indexing.next') }}
          </button>
        </div>
      </div>
    </div>
    <div class="indexing-form__step--03 indexing-form__step" v-if="step === 3 && findNames">
      <div class="indexing-form__step__header mb-4">
        <h4>
          {{ $t('indexing.step_03') }}
        </h4>
      </div>
      <div class="indexing-form__step__body form-group my-0 pl-4">
        <div class="custom-control custom-radio">
          <input class="custom-control-input" type="radio" id="pipeline_corenlp" value="corenlp" v-model="pipeline">
          <label class="custom-control-label" for="pipeline_corenlp">Core NLP</label>
        </div>
        <div class="custom-control custom-radio">
          <input class="custom-control-input" type="radio" id="pipeline_opennlp" value="opennlp" v-model="pipeline">
          <label class="custom-control-label" for="pipeline_opennlp">Open NLP</label>
        </div>
        <div class="custom-control custom-radio">
          <input class="custom-control-input" type="radio" id="pipeline_mitie" value="mitie" v-model="pipeline">
          <label class="custom-control-label" for="pipeline_mitie">Mitie</label>
        </div>
        <div class="custom-control custom-radio">
          <input class="custom-control-input" type="radio" id="pipeline_ixapipe" value="ixapipe" v-model="pipeline">
          <label class="custom-control-label" for="pipeline_ixapipe">Ixa Pipe</label>
        </div>
      </div>
      <div class="indexing-form__step__footer mt-4 row no-gutters">
        <div class="col">
          <button class="btn btn-dark" type="button" @click="previous">
            {{ $t('indexing.previous') }}
          </button>
        </div>
        <div class="col text-right">
          <button class="btn btn-dark" type="button" @click="next">
            {{ $t('indexing.next') }}
          </button>
        </div>
      </div>
    </div>
    <div class="indexing-form__step--04 indexing-form__step" v-if="step === 4">
      <div class="indexing-form__step__header mb-4">
        <h4>
          {{ $t('indexing.step_04') }}
        </h4>
      </div>
      <dl class="form-group mb-0 border border-white py-2 mx-3">
        <div class="row">
          <dt class="col-sm-4 text-sm-right">{{ $t('indexing.index_stage_label') }}</dt>
          <dd class="col-sm-8">
            <span v-if="$store.state.indexing.form.index">{{ $t('indexing.yes') }}</span>
            <span v-if="!$store.state.indexing.form.index">{{ $t('indexing.no') }}</span>
          </dd>
        </div>
        <div v-if="$store.state.indexing.form.index" class="row">
          <dt class="col-sm-4 text-sm-right">{{ $t('indexing.ocr') }}</dt>
          <dd class="col-sm-8">
            <span v-if="$store.state.indexing.form.ocr">{{ $t('indexing.yes') }}</span>
            <span v-if="!$store.state.indexing.form.ocr">{{ $t('indexing.no') }}</span>
          </dd>
        </div>
        <div class="row">
          <dt class="col-sm-4 text-sm-right">{{ $t('indexing.findNames_stage_label') }}</dt>
          <dd class="col-sm-8">
            <span v-if="$store.state.indexing.form.findNames">{{ $t('indexing.yes') }}</span>
            <span v-if="!$store.state.indexing.form.findNames">{{ $t('indexing.no') }}</span>
          </dd>
        </div>
        <div v-if="$store.state.indexing.form.findNames" class="row">
          <dt class="col-sm-4 text-sm-right">{{ $t('indexing.pipelines') }}</dt>
          <dd class="col-sm-8">
            <ul class="list-unstyled mb-0">
              <li v-if="$store.state.indexing.form.pipeline === 'corenlp'">Core NLP</li>
              <li v-if="$store.state.indexing.form.pipeline === 'opennlp'">Open NLP</li>
              <li v-if="$store.state.indexing.form.pipeline === 'mitie'">Mitie</li>
              <li v-if="$store.state.indexing.form.pipeline === 'ixapipe'">Ixa Pipe</li>
            </ul>
          </dd>
        </div>
      </dl>
      <div class="indexing-form__step__footer mt-4 row no-gutters">
        <div class="col">
          <div class="col">
            <button class="btn btn-dark" type="button" @click="previous">
              {{ $t('indexing.previous') }}
            </button>
          </div>
        </div>
        <div class="col text-right">
          <div class="col text-right">
            <button class="btn btn-primary font-weight-bold" type="submit">
              {{ $t('indexing.btnLabel') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <p v-if="errors.length" class="indexing-form__errors mb-0">
      <ul class="list-unstyled mb-0 mt-4">
        <li v-for="error in errors" :key="error">
          <div class="alert alert-danger mb-0 mt-2" role="alert">
            {{ $t(error) }}
          </div>
        </li>
      </ul>
    </p>
  </form>
</template>

<script>
import { createHelpers } from 'vuex-map-fields'
import { mapState } from 'vuex'
import noop from 'lodash/noop'

const { mapFields } = createHelpers({
  getterType: `indexing/getField`,
  mutationType: `indexing/updateField`
})

export default {
  name: 'indexing',
  props: {
    finally: {
      type: Function,
      default: noop
    }
  },
  data () {
    return {
      errors: []
    }
  },
  computed: {
    ...mapFields([
      'form.index',
      'form.findNames',
      'form.ocr',
      'form.pipeline',
      'form.step'
    ]),
    ...mapState('search', {
      isIndexEmpty: state => {
        return state.response.hits.length === 0
      }
    }),
    isFindNamesDisabled () {
      return this.isIndexEmpty && !this.index
    }
  },
  methods: {
    previous () {
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
          break
        case 4:
          break
      }
      return true
    },
    submit () {
      this.finally(this.$store.dispatch('indexing/query').then(() => {
        this.$store.commit('indexing/reset')
      }))
    }
  }
}
</script>

<style lang="scss">
  .indexing-form {
    background: theme-color('icij');
    color: white;

    &__step {

      &__header h4 {
        font-size: 1.2em;
        font-weight: bolder;
      }

      &__footer {
      }
    }
  }
</style>
