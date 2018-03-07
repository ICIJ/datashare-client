import Vue from 'vue'
import VueI18n from 'vue-i18n'
import 'es6-promise/auto'

import messages from '@/messages'
import router from '@/router'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import LanguageChooser from '@/components/LanguageChooser'

Vue.use(VueI18n)

const i18n = new VueI18n({locale: 'en', messages})
// Font Awesome component must be available everywhere
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
})
