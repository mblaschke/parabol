// Datadog APM, must be first import (disabled for now)
// import './tracer'

import uws, {HttpRequest, HttpResponse, SHARED_COMPRESSOR} from 'uWebSockets.js'
import stripeWebhookHandler from './billing/stripeWebhookHandler'
import createSSR from './createSSR'
import httpGraphQLHandler from './graphql/httpGraphQLHandler'
import intranetGraphQLHandler from './graphql/intranetGraphQLHandler'
import webhookGraphQLHandler from './graphql/webhookGraphQLHandler'
import ICSHandler from './ICSHandler'
import './initSentry'
import githubWebhookHandler from './integrations/githubWebhookHandler'
import listenHandler from './listenHandler'
import PWAHandler from './PWAHandler'
import handleClose from './socketHandlers/handleClose'
import handleMessage from './socketHandlers/handleMessage'
import handleOpen from './socketHandlers/handleOpen'
import SSEConnectionHandler from './sse/SSEConnectionHandler'
import SSEPingHandler from './sse/SSEPingHandler'
import staticFileHandler from './staticFileHandler'
import SAMLHandler from './utils/SAMLHandler'

const PORT = Number(process.env.PORT)

uws
  .App()
  .get('/favicon.ico', PWAHandler)
  .get('/sw.js', PWAHandler)
  .get('/manifest.json', PWAHandler)
  .get('/static/*', staticFileHandler)
  .get('/email/createics', ICSHandler)
  .get('/sse', SSEConnectionHandler)
  .get('/sse-ping', SSEPingHandler)
  .post('/stripe', stripeWebhookHandler)
  .post('/webhooks/github', githubWebhookHandler)
  .post('/webhooks/graphql', webhookGraphQLHandler)
  .post('/graphql', httpGraphQLHandler)
  .post('/intranet-graphql', intranetGraphQLHandler)
  .post('/saml/:domain', SAMLHandler)
  .ws('/*', {
    compression: SHARED_COMPRESSOR,
    idleTimeout: 0,
    maxPayloadLength: 5 * 2 ** 20,
    open: handleOpen,
    message: handleMessage,
    // today, we don't send folks enough data to worry about backpressure
    close: handleClose
  })
  .any('/*', (res: HttpResponse, req: HttpRequest) => {
      res.writeHeader("Referrer-Policy", "no-referrer")
      res.writeHeader("X-Frame-Options", "BLOCK")
      res.writeHeader("X-XSS-Protection", "1; mode=block")
      res.writeHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' 'unsafe-inline' data:")
      return createSSR(res, req)
  })
  .listen(PORT, listenHandler)
