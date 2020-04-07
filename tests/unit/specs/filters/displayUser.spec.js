import displayUser from '@/filters/displayUser'

describe('displayUser filter', () => {
  it('should "you" if user id is "local"', () => {
    expect(displayUser('local')).toBe('you')
  })

  it('should return the user id in all other cases', () => {
    expect(displayUser('otherUserId')).toBe('otherUserId')
  })
})
