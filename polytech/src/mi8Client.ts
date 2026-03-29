import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'

const PROTO_PATH = path.join(__dirname, '..', '..', 'mi8', 'proto', 'news.proto')

const packageDef = protoLoader.loadSync(PROTO_PATH, { keepCase: false })
const proto = grpc.loadPackageDefinition(packageDef) as any

const MI8_ADDRESS = process.env.MI8_ADDRESS || 'localhost:50051'
const client = new proto.mi8.NewsService(MI8_ADDRESS, grpc.credentials.createInsecure())

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

export function getLatestNews(limit: number): Promise<News[]> {
  return new Promise((resolve, reject) => {
    client.getLatestNews({ limit }, (err: Error | null, response: any) => {
      if (err) reject(err)
      else resolve(response.news)
    })
  })
}

export function getLatestNewsInCity(city: string, limit: number): Promise<News[]> {
  return new Promise((resolve, reject) => {
    client.getLatestNewsInCity({ city, limit }, (err: Error | null, response: any) => {
      if (err) reject(err)
      else resolve(response.news)
    })
  })
}

export function getCityScore(city: string): Promise<CityScore> {
  return new Promise((resolve, reject) => {
    client.getCityScore({ city }, (err: Error | null, response: any) => {
      if (err) reject(err)
      else resolve(response.cityScore)
    })
  })
}

export function getTopCities(limit: number): Promise<CityScore[]> {
  return new Promise((resolve, reject) => {
    client.getTopCities({ limit }, (err: Error | null, response: any) => {
      if (err) reject(err)
      else resolve(response.cities)
    })
  })
}

export function getCityStats(city: string): Promise<CityStats> {
  return new Promise((resolve, reject) => {
    client.getCityStats({ city }, (err: Error | null, response: any) => {
      if (err) reject(err)
      else resolve(response.cityStats)
    })
  })
}
