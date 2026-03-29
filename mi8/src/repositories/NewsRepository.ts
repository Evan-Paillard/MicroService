export interface News {
  id: string
  name: string
  source: string
  date: string
  tags: string[]
  city: string
  country: string
}

export interface CityScore {
  city: string
  country: string
  qualityOfLife: number
  safety: number
  economy: number
  culture: number
  lastUpdated: string
}

export interface CityStats {
  city: string
  totalOffers: number
  offersByDomain: Record<string, number>
  lastOfferDate: string
}

export interface NewsRepository {
  getLatestNews(limit: number): Promise<News[]>
  getLatestNewsInCity(city: string, limit: number): Promise<News[]>
  createNews(news: Omit<News, 'id'>): Promise<News>
  getCityScore(city: string): Promise<CityScore | null>
  getTopCities(limit: number): Promise<CityScore[]>
  updateCityStats(city: string, domain: string, date: string): Promise<void>
  getCityStats(city: string): Promise<CityStats | null>
}
