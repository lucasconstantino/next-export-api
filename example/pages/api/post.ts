import { NextApiHandler } from 'next'

const handler: NextApiHandler = (req, res) => {
  res.send({ name: `Hello, ${req.body.name}` })
}

export default handler
