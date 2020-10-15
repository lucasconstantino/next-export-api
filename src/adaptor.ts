/**
 * This can be improved to mimic better Next.js API
 * @see https://github.com/vercel/next.js/blob/canary/packages/next/next-server/server/api-utils.ts
 */

import type { APIGatewayEvent, Context } from 'aws-lambda'
import express, { Handler } from 'express'
import { json } from 'body-parser'
import { createServer, proxy } from 'aws-serverless-express'

const adaptor = (handler: Handler) => async (
  event: APIGatewayEvent,
  context: Context
) =>
  proxy(
    createServer(
      express()
        .use(json())
        .use(handler as Handler)
    ),
    event,
    context
  )

export default adaptor
