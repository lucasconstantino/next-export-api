/**
 * This can be improved to mimic better Next.js API
 * @see https://github.com/vercel/next.js/blob/canary/packages/next/next-server/server/api-utils.ts
 */

import type { NextApiHandler } from 'next'
import type { Context, APIGatewayEvent } from 'aws-lambda'

import express, { Handler } from 'express'
import { json } from 'body-parser'
import serverless from 'serverless-http'

const adaptor = (handler: NextApiHandler) => (
  event: APIGatewayEvent,
  context: Context
) => {
  const app = express()
    .use(json()) // compatibility with Next.js default parsers
    .use((handler as unknown) as Handler)

  /**
   * Execute the event/context using the Next.js adapted handler.
   */
  return serverless(app)(event, context)
}

export { adaptor }
