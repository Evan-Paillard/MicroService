import { v4 as uuidv4 } from 'uuid'
import { News, CityScore, CityStats, NewsRepository } from './NewsRepository'
import { computeScoreDelta } from '../scoring'

const BASE_SCORE = 1000

export class ArrayNewsRepository implements NewsRepository {
  private news: News[] = [
    {
      id: uuidv4(),
      name: 'Berlin Innovation Hub Opens',
      source: 'Tech Weekly',
      date: new Date('2025-01-10').toISOString(),
      tags: ['innovation'],
      city: 'Berlin',
      country: 'Germany',
    },
    {
      id: uuidv4(),
      name: 'Paris Cultural Festival 2025',
      source: 'Le Monde',
      date: new Date('2025-01-12').toISOString(),
      tags: ['culture', 'entertainment'],
      city: 'Paris',
      country: 'France',
    },
    {
      id: uuidv4(),
      name: 'Tokyo Healthcare Breakthrough',
      source: 'Japan Times',
      date: new Date('2025-01-15').toISOString(),
      tags: ['healthcare', 'innovation'],
      city: 'Tokyo',
      country: 'Japan',
    },
  ]

  private cityScores: Map<string, CityScore> = new Map()
  private cityStatsMap: Map<string, CityStats> = new Map()

  async getLatestNews(limit: number): Promise<News[]> {
    return [...this.news]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  }

  async getLatestNewsInCity(city: string, limit: number): Promise<News[]> {
    return [...this.news]
      .filter(n => n.city.toLowerCase() === city.toLowerCase())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  }

  async createNews(newsData: Omit<News, 'id'>): Promise<News> {
    const news: News = { ...newsData, id: uuidv4() }
    this.news.push(news)
    this.applyScoreDelta(news.city, news.country, computeScoreDelta(news.tags))
    return news
  }

  async getCityScore(city: string): Promise<CityScore | null> {
    return this.cityScores.get(city.toLowerCase()) ?? null
  }

  async getTopCities(limit: number): Promise<CityScore[]> {
    return [...this.cityScores.values()]
      .sort((a, b) => this.total(a) - this.total(b))
      .slice(0, limit)
  }

  async updateCityStats(city: string, domain: string, date: string): Promise<void> {
    const key = city.toLowerCase()
    const existing = this.cityStatsMap.get(key) ?? {
      city,
      totalOffers: 0,
      offersByDomain: {},
      lastOfferDate: '',
    }
    existing.totalOffers += 1
    existing.offersByDomain[domain] = (existing.offersByDomain[domain] ?? 0) + 1
    existing.lastOfferDate = date
    this.cityStatsMap.set(key, existing)
  }

  async getCityStats(city: string): Promise<CityStats | null> {
    return this.cityStatsMap.get(city.toLowerCase()) ?? null
  }

  private total(score: CityScore): number {
    return score.safety + score.economy + score.qualityOfLife + score.culture
  }

  private applyScoreDelta(city: string, country: string, delta: ReturnType<typeof computeScoreDelta>) {
    const key = city.toLowerCase()
    const current = this.cityScores.get(key) ?? {
      city,
      country,
      qualityOfLife: BASE_SCORE,
      safety: BASE_SCORE,
      economy: BASE_SCORE,
      culture: BASE_SCORE,
      lastUpdated: new Date().toISOString(),
    }

    this.cityScores.set(key, {
      ...current,
      safety: Math.max(0, current.safety + delta.safety),
      economy: Math.max(0, current.economy + delta.economy),
      qualityOfLife: Math.max(0, current.qualityOfLife + delta.qualityOfLife),
      culture: Math.max(0, current.culture + delta.culture),
      lastUpdated: new Date().toISOString(),
    })
  }
}
