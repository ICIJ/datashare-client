import 'es6-promise/auto'

import moment from 'moment'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'

import messages from '@/messages'
import router from '@/router'

import ContentPlaceholder from '@/components/ContentPlaceholder'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import LanguageChooser from '@/components/LanguageChooser'

Vue.use(VueI18n)
Vue.use(VueProgressBar, { color: '#852308' })

const i18n = new VueI18n({locale: 'en', messages})
Vue.component('coontent-placeholder', ContentPlaceholder)
Vue.component('font-awesome-icon', FontAwesomeIcon)

describe('LanguageChooser.vue', () => {
  it('should display a select', () => {
    const Constructor = Vue.extend(LanguageChooser)

    const vm = new Constructor({i18n, router}).$mount()

    expect(vm.$el.querySelector('.language-chooser > select')).to.not.equal(null)
  })

  it('should change the i18n locale', () => {
    const Constructor = Vue.extend(LanguageChooser)
    const vm = new Constructor({i18n, router}).$mount()
    expect(vm.$i18n.locale).to.equal('en')

    vm.onChange({target: {value: 'fr'}})

    expect(vm.$i18n.locale).to.equal('fr')
  })

  it('should change moment locale', () => {
    let dateIso = '2018-03-19T13:14:15Z'
    const Constructor = Vue.extend(LanguageChooser)
    const vm = new Constructor({i18n, router}).$mount()
    expect(moment(dateIso).format('LL')).to.equal('March 19, 2018')

    vm.onChange({target: {value: 'fr'}})

    expect(moment(dateIso).format('LL')).to.equal('19 mars 2018')
  })
})
