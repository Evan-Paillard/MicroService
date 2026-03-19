import express from 'express'
import { connect } from './db'
import offerRoutes from './routes/offers'

const app = express()
app.use(express.json())

app.use('/offer', offerRoutes)

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3002

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Erasmumu running on port ${PORT}`)
    })
  })
  .catch(console.error)
