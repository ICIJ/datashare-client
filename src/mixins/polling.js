import { find, findIndex, filter, isFunction } from 'lodash'

/**
 * This mixin provides an unified way to poll data from an arbitrary source
 * on a regular interval.
 */
export default {
  data () {
    return {
      registeredPolls: []
    }
  },
  beforeDestroy () {
    this.unregisteredPools()
  },
  methods: {
    unregisteredPools () {
      // Clear all pools
      this.registeredPolls.forEach(this.unregisteredPoll)
    },
    unregisteredPoll ({ id }) {
      const index = findIndex(this.registeredPolls, { id })
      // Clear the timeout
      clearTimeout(id)
      // Delete the function from the poll
      this.registeredPolls.splice(index, 1)
    },
    registerPoll ({ fn, timeout = 2000, immediate = false } = {}) {
      // Scheddule the pool first to get its id
      const id = this.schedulePool({ fn, timeout, immediate })
      // And add it to the list to retreive it later
      this.registeredPolls.push({ fn, id })
    },
    registerPollOnce ({ fn, ...rest } = {}) {
      // Find all matching poll functions
      filter(this.registeredPolls, { fn }).forEach(this.unregisteredPoll)
      // Register the poll again with the new option
      return this.registerPoll({ fn, ...rest })
    },
    schedulePool ({ fn, timeout, immediate = false }) {
      // Return the id of the setInterval
      return setTimeout(async () => {
        const pool = find(this.registeredPolls, { fn })
        try {
          // Call the pool's promise, shedule it again only if it returns true
          if (await fn()) {
            // Update the pool id with the next one
            pool.id = this.schedulePool({ fn, timeout })
          } else {
            this.unregisteredPoll(pool)
          }
        // Reject promise triggers unregistering of the pool
        } catch (_) {
          this.unregisteredPoll(pool)
        }
      // If immediate is true, the timeout is set to 0
      }, !immediate * this.callOrGetTimeout(timeout))
    },
    callOrGetTimeout (timeout) {
      if (isFunction(timeout)) {
        return timeout()
      }
      return Number(timeout)
    }
  }
}
