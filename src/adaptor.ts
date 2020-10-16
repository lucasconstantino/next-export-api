/**
 * This can be improved to mimic better Next.js API
 * @see https://github.com/vercel/next.js/blob/canary/packages/next/next-server/server/api-utils.ts
 */

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
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

const inNetlify = (
  eventOrRequest: APIGatewayEvent | NextApiRequest
): eventOrRequest is APIGatewayEvent => 'httpMethod' in eventOrRequest

const adaptor = (handler: NextApiHandler) => (
  eventOrRequest: APIGatewayEvent | NextApiRequest,
  contextOrResponse: Context | NextApiResponse
) => {
  /**
   * Handler is executed as is if running on Next.js environment
   */
  if (!inNetlify(eventOrRequest)) {
    return handler(eventOrRequest, contextOrResponse as NextApiResponse)
  }

  const app = express()
    .use(json())
    .use((handler as unknown) as Handler)

  /**
   * Handler is executed as AWS gateway function if running on Netlify,
   * but adapted to run the provided Next.js compatible handler.
   */
  return serverless(app)(eventOrRequest, contextOrResponse as Context)
}

export { adaptor }
