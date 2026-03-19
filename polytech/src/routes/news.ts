import { Router, Request, Response, NextFunction } from 'express'
import * as mi8 from '../mi8Client'

const router = Router()

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const { city } = req.query

    const news = city
      ? await mi8.getLatestNewsInCity(city as string, limit)
      : await mi8.getLatestNews(limit)

    res.json(news)
  } catch (err) {
    next(err)
  }
})

router.get('/cities/top', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const cities = await mi8.getTopCities(limit)
    res.json(cities)
  } catch (err) {
    next(err)
  }
})

router.get('/city/:city/score', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const score = await mi8.getCityScore(req.params.city)
    res.json(score)
  } catch (err: any) {
    if (err?.code === 5) {
      return res.status(404).json({ error: 'City not found' })
    }
    next(err)
  }
})

export default router
