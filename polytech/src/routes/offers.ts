import { Router, Request, Response, NextFunction } from 'express'
import axios from 'axios'
import * as mi8 from '../mi8Client'

const router = Router()

const ERASMUMU_URL = process.env.ERASMUMU_URL || 'http://localhost:3002'

async function enrichOffers(offers: any[]) {
  const cities = [...new Set(offers.map((o: any) => o.city as string))]

  const cityResults = await Promise.all(
    cities.map(async (city) => {
      const [scoreResult, newsResult] = await Promise.allSettled([
        mi8.getCityScore(city),
        mi8.getLatestNewsInCity(city, 3),
      ])

      return {
        city,
        scores:
          scoreResult.status === 'fulfilled'
            ? {
                safety: scoreResult.value.safety,
                economy: scoreResult.value.economy,
                quality_of_life: scoreResult.value.qualityOfLife,
                culture: scoreResult.value.culture,
              }
            : null,
        news: newsResult.status === 'fulfilled' ? newsResult.value : [],
      }
    })
  )

  const cityMap = new Map(cityResults.map((d) => [d.city, d]))

  return offers.map((offer: any) => {
    const data = cityMap.get(offer.city)
    return {
      ...offer,
      scores: data?.scores ?? null,
      latest_news: data?.news ?? [],
    }
  })
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const { city, domain } = req.query

    const params = new URLSearchParams()
    if (city) params.set('city', city as string)
    if (domain) params.set('domain', domain as string)

    let offers: any[]
    try {
      const response = await axios.get(`${ERASMUMU_URL}/offer?${params}`)
      offers = response.data.slice(0, limit)
    } catch {
      return res.status(502).json({ error: 'Erasmumu service unavailable' })
    }

    const enriched = await enrichOffers(offers)
    res.json({ offers: enriched })
  } catch (err) {
    next(err)
  }
})

export { enrichOffers }
export default router
