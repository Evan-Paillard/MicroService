import { Router, Request, Response, NextFunction } from 'express'
import axios from 'axios'
import pool from '../db'

const router = Router()

const ERASMUMU_URL = process.env.ERASMUMU_URL || 'http://localhost:3002'

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId, offerId } = req.body
    if (!studentId || !offerId) {
      return res.status(400).json({ error: 'studentId and offerId are required' })
    }

    const studentResult = await pool.query('SELECT * FROM students WHERE id = $1', [studentId])
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' })
    }
    const student = studentResult.rows[0]

    let offer
    try {
      const response = await axios.get(`${ERASMUMU_URL}/offer/${offerId}`)
      offer = response.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        return res.status(404).json({ error: 'Offer not found or unavailable' })
      }
      return res.status(502).json({ error: 'Failed to reach Erasmumu service' })
    }

    const status = offer.domain === student.domain ? 'approved' : 'rejected'
    const message = status === 'approved' ? 'Student successfully registered' : "Offer domain doesn't match"

    const result = await pool.query(
      'INSERT INTO internships (student_id, offer_id, status, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [studentId, offerId, status, message]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM internships WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Internship not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
})

export default router
