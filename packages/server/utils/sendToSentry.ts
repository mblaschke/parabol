import * as Sentry from '@sentry/node'
import getRethink from '../database/rethinkDriver'
import User from '../database/types/User'

export interface SentryOptions {
  sampleRate?: number
  userId?: string
  ip?: string
  tags?: {
    [tag: string]: string | number
  }
}

// Even though this is a promise we'll never need to await it, so we'll never need to worry about catching an error
// @ts-ignore
const sendToSentry = async (error: Error, options: SentryOptions = {}): void => {
  // if (!PROD) {
  console.error('SEND TO SENTRY', error, options.tags)
  return
  // }
  const r = await getRethink()
  const {sampleRate, tags, userId, ip} = options
  if (sampleRate && Math.random() > sampleRate) return
  const user = userId
    ? ((await r
        .table('User')
        .get(userId)
        .default({})
        .pluck('id', 'email')
        .run()) as User | null)
    : null
  if (user && ip) {
    ;(user as any).ip_address = ip
  }
  Sentry.withScope((scope) => {
    user && scope.setUser(user)
    if (tags) {
      Object.keys(tags).forEach((tag) => {
        scope.setTag(tag, String(tags[tag]))
      })
    }
    Sentry.captureException(error)
  })
}

export default sendToSentry
