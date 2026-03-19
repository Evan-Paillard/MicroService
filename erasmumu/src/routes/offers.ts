import { Router, Request, Response, NextFunction } from 'express'
import { Offer } from '../models/offer'

const router = Router()

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const offer = new Offer(req.body)
    await offer.save()
    res.status(201).json(offer)
  } catch (err) {
    next(err)
  }
})

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { domain, city } = req.query
    const filter: Record<string, unknown> = { available: true }
    if (domain) filter.domain = domain
    if (city) filter.city = city

    const offers = await Offer.find(filter)
    res.json(offers)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const offer = await Offer.findById(req.params.id)
    if (!offer || !offer.available) {
      return res.status(404).json({ error: 'Offer not found' })
    }
    res.json(offer)
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' })
    }
    res.json(offer)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id)
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' })
    }
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
