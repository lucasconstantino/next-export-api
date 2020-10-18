import { adaptor, NextApiHandler, NetlifyApiHandler } from '../src/adaptor'

describe('adaptor', () => {
  const handlers: { [key: string]: NextApiHandler } = {
    ok: (req, res) => res.send('ok'),
    status: (req, res) => res.status(201).send('ok'),
    query: (req, res) => res.send(req.query.name),
    post: (req, res) => res.send('ok'),
    body: (req, res) => res.send(req.body.name),
    json: (req, res) => res.json({ message: 'ok' }),
  }

  const adaptors = {
    ok: adaptor(handlers.ok),
    status: adaptor(handlers.status),
    query: adaptor(handlers.query),
    post: adaptor(handlers.post),
    body: adaptor(handlers.body),
    json: adaptor(handlers.json),
  }

  beforeEach(jest.resetModules)

  describe('Netlify', () => {
    const { ok, status, query, post, body, json } = adaptors as {
      [key: string]: NetlifyApiHandler
    }

    test('"ok" handler', async () => {
      const result = await ok(
        { httpMethod: 'GET', path: '/' } as any,
        {} as any
      )

      expect(result.body).toEqual('ok')
    })

    test('"status" handler', async () => {
      const result = await status(
        { httpMethod: 'GET', path: '/' } as any,
        {} as any
      )

      expect(result.statusCode).toEqual(201)
      expect(result.body).toEqual('ok')
    })

    test('"query" handler', async () => {
      const result = await query(
        {
          httpMethod: 'GET',
          path: '/',
          queryStringParameters: { name: 'susan' },
        } as any,
        {} as any
      )

      expect(result.body).toEqual('susan')
    })

    test('"post" handler', async () => {
      const result = await post(
        { httpMethod: 'POST', path: '/' } as any,
        {} as any
      )

      expect(result.body).toEqual('ok')
    })

    test('"body" handler', async () => {
      const result = await body(
        {
          httpMethod: 'POST',
          path: '/',
          headers: { 'Content-Type': 'application/json' },
          body: '{ "name": "susan" }',
        } as any,
        {} as any
      )

      expect(result.body).toEqual('susan')
    })

    test('"json" handler', async () => {
      const result = await json(
        { httpMethod: 'GET', path: '/' } as any,
        {} as any
      )

      expect(result).toHaveProperty(
        'headers.content-type',
        expect.stringMatching('application/json')
      )

      expect(result.body).toEqual('{"message":"ok"}')
    })
  })
})
