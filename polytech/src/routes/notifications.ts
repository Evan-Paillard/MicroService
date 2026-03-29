import { Router, Request, Response, NextFunction } from 'express'
import pool from '../db'

const router = Router()

router.get('/students/:id/notifications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE student_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
})

router.put('/notifications/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `UPDATE notifications SET read = TRUE WHERE id = $1 RETURNING *`,
      [req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
})

export default router
