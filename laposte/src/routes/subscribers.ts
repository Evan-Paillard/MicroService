import { Router } from 'express'
import { Subscriber } from '../models/subscriber'

const router = Router()

router.get('/:studentId', async (req, res) => {
  try {
    const subscriber = await Subscriber.findOne({ studentId: req.params.studentId })
    if (!subscriber) return res.status(404).json({ error: 'Subscriber not found' })
    res.json(subscriber)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/:studentId', async (req, res) => {
  try {
    const subscriber = await Subscriber.findOneAndUpdate(
      { studentId: req.params.studentId },
      req.body,
      { new: true, runValidators: true }
    )
    if (!subscriber) return res.status(404).json({ error: 'Subscriber not found' })
    res.json(subscriber)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:studentId', async (req, res) => {
  try {
    const subscriber = await Subscriber.findOneAndDelete({ studentId: req.params.studentId })
    if (!subscriber) return res.status(404).json({ error: 'Subscriber not found' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
