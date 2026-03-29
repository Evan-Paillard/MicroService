import express from 'express'
import cors from 'cors'
import { connectDB } from './db'
import { startConsumer } from './consumer'
import subscriberRoutes from './routes/subscribers'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/subscribers', subscriberRoutes)

const PORT = process.env.PORT || 3003

async function start() {
  await connectDB()
  await startConsumer()

  app.listen(PORT, () => {
    console.log(`La Poste running on port ${PORT}`)
  })
}

start().catch(console.error)
