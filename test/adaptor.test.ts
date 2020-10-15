import { adaptor, NextApiHandler, NetlifyApiHandler } from '../src/adaptor'

describe('adaptor', () => {
  const handlers: { [key: string]: NextApiHandler } = {
    ok: (req, res) => res.send('ok'),
    status: (req, res) => res.status(201).send('ok'),
    query: (req, res) => res.send(req.query.name),
    body: (req, res) => res.send(req.body.name),
    json: (req, res) => res.json({ message: 'ok' }),
  }

  const spies = {
    ok: jest.fn(handlers.ok),
    status: jest.fn(handlers.status),
    query: jest.fn(handlers.query),
    body: jest.fn(handlers.body),
    json: jest.fn(handlers.json),
  }

  const adaptors = (netlify: boolean) => {
    process.env.NETLIFY = netlify ? 'true' : null

    return {
      ok: adaptor(spies.ok),
      status: adaptor(spies.status),
      query: adaptor(spies.query),
      body: adaptor(spies.body),
      json: adaptor(spies.json),
    }
  }

  beforeEach(jest.clearAllMocks)

  describe('Next.js', () => {
    const { ok } = adaptors(false) as { [key: string]: NetlifyApiHandler }

    test('"ok" handler', async () => {
      const result = await ok(
        { httpMethod: 'GET', path: '/' } as any,
        {} as any
      )

      expect(result.body).toEqual('ok')
    })
  })
})
