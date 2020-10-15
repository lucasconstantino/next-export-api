import { NextApiHandler } from 'next'

const handler: NextApiHandler = (req, res) => {
  res.status(200).send({ name: `Hello, ${req.query.name}` })
}

export default handler
