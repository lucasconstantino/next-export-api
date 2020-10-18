const handler = (req, res) => {
  res.status(200).send({ name: `Hello, nested ${req.query.name}` })
}

export default handler
