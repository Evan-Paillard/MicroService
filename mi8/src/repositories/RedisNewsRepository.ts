import Redis from 'ioredis'
import { v4 as uuidv4 } from 'uuid'
import { News, CityScore, NewsRepository } from './NewsRepository'
import { computeScoreDelta } from '../scoring'

const BASE_SCORE = 1000

export class RedisNewsRepository implements NewsRepository {
  private redis: Redis

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl)
  }

  async getLatestNews(limit: number): Promise<News[]> {
    const ids = await this.redis.zrevrange('news:timeline', 0, limit - 1)
    if (ids.length === 0) return []

    const items = await this.redis.mget(ids.map(id => `news:${id}`))
    return items.filter(Boolean).map(item => JSON.parse(item!))
  }

  async getLatestNewsInCity(city: string, limit: number): Promise<News[]> {
    const ids = await this.redis.zrevrange(`news:city:${city.toLowerCase()}`, 0, limit - 1)
    if (ids.length === 0) return []

    const items = await this.redis.mget(ids.map(id => `news:${id}`))
    return items.filter(Boolean).map(item => JSON.parse(item!))
  }

  async createNews(newsData: Omit<News, 'id'>): Promise<News> {
    const news: News = { ...newsData, id: uuidv4() }
    const timestamp = new Date(news.date).getTime() || Date.now()

    await this.redis.set(`news:${news.id}`, JSON.stringify(news))
    await this.redis.zadd('news:timeline', timestamp, news.id)
    await this.redis.zadd(`news:city:${news.city.toLowerCase()}`, timestamp, news.id)

    await this.applyScoreDelta(news.city, news.country, computeScoreDelta(news.tags))

    return news
  }

  async getCityScore(city: string): Promise<CityScore | null> {
    const data = await this.redis.hgetall(`city:${city.toLowerCase()}`)
    if (!data || Object.keys(data).length === 0) return null

    return {
      city: data.city || city,
      country: data.country || '',
      qualityOfLife: parseInt(data.quality_of_life || String(BASE_SCORE)),
      safety: parseInt(data.safety || String(BASE_SCORE)),
      economy: parseInt(data.economy || String(BASE_SCORE)),
      culture: parseInt(data.culture || String(BASE_SCORE)),
      lastUpdated: data.last_updated || new Date().toISOString(),
    }
  }

  async getTopCities(limit: number): Promise<CityScore[]> {
    const cityKeys = await this.redis.zrange('cities:ranking', 0, limit - 1)
    const scores = await Promise.all(cityKeys.map(city => this.getCityScore(city)))
    return scores.filter(Boolean) as CityScore[]
  }

  private async applyScoreDelta(
    city: string,
    country: string,
    delta: ReturnType<typeof computeScoreDelta>
  ) {
    const key = `city:${city.toLowerCase()}`
    const existing = await this.redis.hgetall(key)

    const current = {
      qualityOfLife: parseInt(existing.quality_of_life ?? String(BASE_SCORE)),
      safety: parseInt(existing.safety ?? String(BASE_SCORE)),
      economy: parseInt(existing.economy ?? String(BASE_SCORE)),
      culture: parseInt(existing.culture ?? String(BASE_SCORE)),
    }

    const updated = {
      city,
      country: existing.country || country,
      quality_of_life: Math.max(0, current.qualityOfLife + delta.qualityOfLife),
      safety: Math.max(0, current.safety + delta.safety),
      economy: Math.max(0, current.economy + delta.economy),
      culture: Math.max(0, current.culture + delta.culture),
      last_updated: new Date().toISOString(),
    }

    await this.redis.hmset(key, updated as unknown as Record<string, string>)

    const total = updated.quality_of_life + updated.safety + updated.economy + updated.culture
    await this.redis.zadd('cities:ranking', total, city.toLowerCase())
  }
}
