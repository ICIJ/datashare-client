import Vue from 'vue'
import App from '@/components/App'

describe('App.vue', () => {
  it('should display search bar', () => {
    const Constructor = Vue.extend(App)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('div.search > input').getAttribute('placeholder')).to.equal('Search...')
  })
})
