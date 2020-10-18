const handler = (req, res) => {
  res.send({ name: `Hello, ${req.body.name}` })
}

export default handler
