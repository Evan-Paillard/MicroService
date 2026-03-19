import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'
import { NewsRepository } from './repositories/NewsRepository'

const PROTO_PATH = path.join(__dirname, '..', 'proto', 'news.proto')

function toGrpcCityScore(cs: NonNullable<Awaited<ReturnType<NewsRepository['getCityScore']>>>) {
  return {
    city: cs.city,
    country: cs.country,
    quality_of_life: cs.qualityOfLife,
    safety: cs.safety,
    economy: cs.economy,
    culture: cs.culture,
    last_updated: cs.lastUpdated,
  }
}

export function createGrpcServer(repository: NewsRepository): grpc.Server {
  const packageDef = protoLoader.loadSync(PROTO_PATH, { keepCase: false })
  const proto = grpc.loadPackageDefinition(packageDef) as any

  const server = new grpc.Server()

  server.addService(proto.mi8.NewsService.service, {
    getLatestNews: async (call: any, callback: any) => {
      try {
        const news = await repository.getLatestNews(call.request.limit)
        callback(null, { news })
      } catch (err) {
        callback(err)
      }
    },

    getLatestNewsInCity: async (call: any, callback: any) => {
      try {
        const news = await repository.getLatestNewsInCity(call.request.city, call.request.limit)
        callback(null, { news })
      } catch (err) {
        callback(err)
      }
    },

    createNews: async (call: any, callback: any) => {
      try {
        const news = await repository.createNews(call.request)
        callback(null, { news })
      } catch (err) {
        callback(err)
      }
    },

    getCityScore: async (call: any, callback: any) => {
      try {
        const cityScore = await repository.getCityScore(call.request.city)
        if (!cityScore) {
          callback({ code: grpc.status.NOT_FOUND, message: 'City not found' })
          return
        }
        callback(null, { cityScore: toGrpcCityScore(cityScore) })
      } catch (err) {
        callback(err)
      }
    },

    getTopCities: async (call: any, callback: any) => {
      try {
        const cities = await repository.getTopCities(call.request.limit)
        callback(null, { cities: cities.map(toGrpcCityScore) })
      } catch (err) {
        callback(err)
      }
    },
  })

  return server
}
