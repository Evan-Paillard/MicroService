import http from 'http'
import express from 'express'
import cors from 'cors'
import { WebSocketServer, WebSocket } from 'ws'
import pool from './db'
import studentRoutes from './routes/students'
import internshipRoutes from './routes/internships'
import newsRoutes from './routes/news'
import offersRoutes from './routes/offers'
import notificationRoutes from './routes/notifications'
import { startConsumer, wsClients } from './consumer'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/student', studentRoutes)
app.use('/internship', internshipRoutes)
app.use('/news', newsRoutes)
app.use('/offers', offersRoutes)
app.use('/', notificationRoutes)

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3001

async function start() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      firstname VARCHAR(100) NOT NULL,
      name VARCHAR(100) NOT NULL,
      domain VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS internships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID NOT NULL REFERENCES students(id),
      offer_id VARCHAR(255) NOT NULL,
      status VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'rejected')),
      message TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID NOT NULL REFERENCES students(id),
      type VARCHAR(50) NOT NULL DEFAULT 'new_offer',
      offer_id VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await startConsumer()

  const server = http.createServer(app)

  const wss = new WebSocketServer({ server })
  wss.on('connection', (ws: WebSocket) => {
    wsClients.add(ws)
    ws.on('close', () => wsClients.delete(ws))
  })

  server.listen(PORT, () => {
    console.log(`Polytech running on port ${PORT}`)
  })
}

start().catch(console.error)
