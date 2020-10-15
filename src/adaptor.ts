/**
 * This can be improved to mimic better Next.js API
 * @see https://github.com/vercel/next.js/blob/canary/packages/next/next-server/server/api-utils.ts
 */

import type { NextApiHandler } from 'next'
import type {
  Context,
  APIGatewayEvent,
  APIGatewayProxyResult,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda'

import express, { Handler } from 'express'
import { json } from 'body-parser'
import serverless from 'serverless-http'

export type { NextApiHandler }

export type NetlifyApiHandler = (
  event: APIGatewayEvent,
  context: Context
) => Promise<APIGatewayProxyResult | APIGatewayProxyStructuredResultV2>

const adaptor = (handler: NextApiHandler) => {
  /**
   * Handler is returned as is if running on Next.js environment
   */
  if (!process.env.NETLIFY) {
    return handler
  }

  const app = express()
    .use(json())
    .use((handler as unknown) as Handler)

  /**
   * Handler is returned as AWS gateway function if running on Netlify,
   * but adapted to run the provided Next.js compatible handler.
   */
  return serverless(app)
}

export { adaptor }
