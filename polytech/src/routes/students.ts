import { Router, Request, Response, NextFunction } from 'express'
import axios from 'axios'
import pool from '../db'
import { enrichOffers } from './offers'
import { publishEvent } from '../consumer'

const ERASMUMU_URL = process.env.ERASMUMU_URL || 'http://localhost:3002'

const SORT_MAP: Record<string, string> = {
  safety: 'safety',
  economy: 'economy',
  quality_of_life: 'qualityOfLife',
  culture: 'culture',
}

const router = Router()

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstname, name, domain } = req.body
    if (!firstname || !name || !domain) {
      return res.status(400).json({ error: 'firstname, name and domain are required' })
    }

    const result = await pool.query(
      'INSERT INTO students (firstname, name, domain) VALUES ($1, $2, $3) RETURNING *',
      [firstname, name, domain]
    )
    const student = result.rows[0]

    // Publish student.registered event
    publishEvent('student.registered', {
      studentId: student.id,
      name: `${student.firstname} ${student.name}`,
      domain: student.domain,
      createdAt: new Date().toISOString()
    }).catch(err => console.error('Failed to publish student.registered:', err))

    res.status(201).json(student)
  } catch (err) {
    next(err)
  }
})

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { domain } = req.query
    if (!domain) {
      return res.status(400).json({ error: 'domain query parameter is required' })
    }

    const result = await pool.query('SELECT * FROM students WHERE domain = $1', [domain])
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
})

router.get('/:id/recommended-offers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5
    const sortBy = req.query.sort_by as string | undefined

    const studentResult = await pool.query('SELECT * FROM students WHERE id = $1', [req.params.id])
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' })
    }
    const student = studentResult.rows[0]

    let offers: any[]
    try {
      const response = await axios.get(`${ERASMUMU_URL}/offer?domain=${student.domain}`)
      offers = response.data
    } catch {
      return res.status(502).json({ error: 'Erasmumu service unavailable' })
    }

    let enriched = await enrichOffers(offers)

    if (sortBy && SORT_MAP[sortBy]) {
      const key = SORT_MAP[sortBy]
      enriched = enriched.sort((a: any, b: any) => {
        const aScore = a.scores?.[sortBy] ?? a.scores?.[key] ?? 0
        const bScore = b.scores?.[sortBy] ?? b.scores?.[key] ?? 0
        return bScore - aScore
      })
    }

    res.json({ student, offers: enriched.slice(0, limit) })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM students WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstname, name, domain } = req.body
    const result = await pool.query(
      `UPDATE students
       SET firstname = COALESCE($1, firstname),
           name      = COALESCE($2, name),
           domain    = COALESCE($3, domain)
       WHERE id = $4
       RETURNING *`,
      [firstname, name, domain, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' })
    }
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
