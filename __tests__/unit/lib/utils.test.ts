import { describe, it, expect } from 'vitest'
import {
  slugify,
  formatPrice,
  calculatePlatformFee,
  calculateCreatorEarnings,
  truncate,
} from '@/lib/utils'

describe('slugify', () => {
  it('converts text to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugify('my cool post')).toBe('my-cool-post')
  })

  it('removes special characters', () => {
    expect(slugify('Hello! World?')).toBe('hello-world')
  })

  it('handles multiple spaces', () => {
    expect(slugify('hello    world')).toBe('hello-world')
  })

  it('trims leading and trailing spaces', () => {
    expect(slugify('  hello world  ')).toBe('hello-world')
  })
})

describe('formatPrice', () => {
  it('formats cents to USD by default', () => {
    expect(formatPrice(1000)).toBe('$10.00')
  })

  it('formats cents correctly', () => {
    expect(formatPrice(999)).toBe('$9.99')
  })

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('$0.00')
  })
})

describe('calculatePlatformFee', () => {
  it('calculates 10% fee', () => {
    expect(calculatePlatformFee(1000)).toBe(100)
  })

  it('rounds to nearest cent', () => {
    expect(calculatePlatformFee(999)).toBe(100)
  })
})

describe('calculateCreatorEarnings', () => {
  it('calculates 90% earnings', () => {
    expect(calculateCreatorEarnings(1000)).toBe(900)
  })

  it('is consistent with platform fee', () => {
    const amount = 1500
    const fee = calculatePlatformFee(amount)
    const earnings = calculateCreatorEarnings(amount)
    expect(fee + earnings).toBe(amount)
  })
})

describe('truncate', () => {
  it('returns original text if shorter than length', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates text and adds ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...')
  })

  it('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })
})
