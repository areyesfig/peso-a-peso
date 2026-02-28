interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

// Cleanup cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter(t => now - t < 5 * 60 * 1000)
    if (entry.timestamps.length === 0) store.delete(key)
  }
}, 5 * 60 * 1000)

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetMs: number
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key) ?? { timestamps: [] }

  entry.timestamps = entry.timestamps.filter(t => now - t < config.windowMs)

  if (entry.timestamps.length >= config.maxRequests) {
    const oldestInWindow = entry.timestamps[0]
    return {
      allowed: false,
      remaining: 0,
      resetMs: oldestInWindow + config.windowMs - now,
    }
  }

  entry.timestamps.push(now)
  store.set(key, entry)

  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
    resetMs: config.windowMs,
  }
}

export const RATE_LIMITS = {
  processStatement: { maxRequests: 5, windowMs: 60_000 },
  transactions: { maxRequests: 30, windowMs: 60_000 },
  deleteStatement: { maxRequests: 10, windowMs: 60_000 },
} as const
