import { adaptor } from 'next-to-netlify'

export const handler = adaptor((req, res) => {
  res.status(200).send({ name: `Hello, ${req.query.name}` })
})

export default handler
