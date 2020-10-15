import { adaptor } from 'next-to-netlify/adaptor'

export const handler = adaptor((req, res) => {
  res.send({ name: `Hello, ${req.body.name}` })
})

export default handler
