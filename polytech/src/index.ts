import express from 'express'
import pool from './db'
import studentRoutes from './routes/students'
import internshipRoutes from './routes/internships'
import newsRoutes from './routes/news'

const app = express()
app.use(express.json())

app.use('/student', studentRoutes)
app.use('/internship', internshipRoutes)
app.use('/news', newsRoutes)

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
  `)

  app.listen(PORT, () => {
    console.log(`Polytech running on port ${PORT}`)
  })
}

start().catch(console.error)
