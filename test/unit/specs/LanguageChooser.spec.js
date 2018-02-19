import Vue from 'vue'
import LanguageChooser from '@/components/LanguageChooser'
import VueI18n from 'vue-i18n'
import messages from '../../../src/messages'
Vue.use(VueI18n)

const i18n = new VueI18n({locale: 'en', messages})

describe('LanguageChooser.vue', () => {
  it('should display a select', () => {
    const Constructor = Vue.extend(LanguageChooser)

    const vm = new Constructor({i18n}).$mount()

    expect(vm.$el.querySelector('div.language-chooser > select')).to.not.equal(null)
  })

  it('should change the i18n locale', () => {
    const Constructor = Vue.extend(LanguageChooser)
    const vm = new Constructor({i18n}).$mount()
    expect(vm.$i18n.locale).to.equal('en')

    vm.onChange({target: {value: 'fr'}})

    expect(vm.$i18n.locale).to.equal('fr')
  })
})
