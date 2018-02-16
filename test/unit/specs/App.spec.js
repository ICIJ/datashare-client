import Vue from 'vue'
import App from '@/components/App'
import VueI18n from 'vue-i18n'
import messages from '../../../src/messages'
Vue.use(VueI18n)

const i18n = new VueI18n({locale: 'en', messages})

describe('App.vue', () => {
  it('should display search bar', () => {
    const Constructor = Vue.extend(App)

    const vm = new Constructor({i18n}).$mount()

    expect(vm.$el.querySelector('div.search > input').getAttribute('placeholder')).to.equal('Search...')
  })

  it('should display search bar in french', () => {
    const Constructor = Vue.extend(App)

    const vm = new Constructor({i18n: new VueI18n({locale: 'fr', messages})}).$mount()

    expect(vm.$el.querySelector('div.search > input').getAttribute('placeholder')).to.equal('Rechercher...')
  })
})
