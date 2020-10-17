describe('main', () => {
  beforeEach(jest.resetModules)

  describe('Next.js', () => {
    it('should export "api" for Next.js usage', async () => {
      delete process.env.NETLIFY
      const { api } = await import('../src/index')
      expect(api).toBe('/api')
    })
  })

  describe('Netlify', () => {
    it('should export "api" for Netlify usage', async () => {
      process.env.NETLIFY = 'true'
      const { api } = await import('../src/index')
      expect(api).toBe('/.netlify/functions')
    })
  })
})
