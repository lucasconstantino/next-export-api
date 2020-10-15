/**
 * This can be improved to mimic better Next.js API
 * @see https://github.com/vercel/next.js/blob/canary/packages/next/next-server/server/api-utils.ts
 */

import type { NextApiHandler } from 'next'
import type { APIGatewayEvent, Context } from 'aws-lambda'
import express, { Handler } from 'express'
import { json } from 'body-parser'
import { createServer, proxy } from 'aws-serverless-express'

const adaptor = (handler: NextApiHandler) =>
  !process.env.NETLIFY
    ? /**
       * Handler is returned as is if not running on Netlify environment
       */
      handler
    : /**
       * Handler is returned as AWS gateway function, but adapted to run
       * the provided Next.js compatible handler.
       */
      async (event: APIGatewayEvent, context: Context) =>
        proxy(
          createServer(
            express()
              .use(json())
              .use((handler as unknown) as Handler)
          ),
          event,
          context
        )

export { adaptor }
