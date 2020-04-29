import humanSize from '@/filters/humanSize'

describe('humanSize filter', () => {
  it('should return "unknown" if size equals -1', () => {
    expect(humanSize(-1)).toBe('unknown')
  })

  it('should return "unknown" if size is an empty string', () => {
    expect(humanSize('')).toBe('unknown')
  })

  it('should return "unknown" if size is undefined', () => {
    expect(humanSize(undefined)).toBe('unknown')
  })

  it('should display human readable size for 0', () => {
    expect(humanSize(0)).toBe('0.00 B')
  })

  it('should display human readable size for Bytes', () => {
    expect(humanSize(12)).toBe('12.00 B')
  })

  it('should display human readable size for Kilobytes WITHOUT bytes', () => {
    expect(humanSize(10342, false)).toBe('10.10 KB')
  })

  it('should display human readable size for Kilobytes WITH bytes', () => {
    expect(humanSize(10342, true)).toBe('10.10 KB (10342 B)')
  })

  it('should display human readable size for Megabytes WITHOUT bytes', () => {
    expect(humanSize(12345678, false)).toBe('11.77 MB')
  })

  it('should display human readable size for Megabytes WITH bytes', () => {
    expect(humanSize(12345678, true)).toBe('11.77 MB (12345678 B)')
  })
})
