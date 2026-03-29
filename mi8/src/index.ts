import * as grpc from '@grpc/grpc-js'
import amqp from 'amqplib'
import { createGrpcServer } from './server'
import { ArrayNewsRepository } from './repositories/ArrayNewsRepository'
import { RedisNewsRepository } from './repositories/RedisNewsRepository'

const PORT = process.env.PORT || '50051'
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'

const repository = REDIS_URL
  ? new RedisNewsRepository(REDIS_URL)
  : new ArrayNewsRepository()

const server = createGrpcServer(repository)

server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`MI8 gRPC server running on port ${port}`)
  }
)

async function startConsumer() {
  const connection = await amqp.connect(RABBITMQ_URL)
  const channel = await connection.createChannel()

  // Subscribe to news.created
  await channel.assertExchange('news.created', 'fanout', { durable: true })
  const newsQueue = await channel.assertQueue('mi8.news.created', { durable: true })
  await channel.bindQueue(newsQueue.queue, 'news.created', '')

  channel.consume(newsQueue.queue, async (msg) => {
    if (!msg) return
    try {
      const news = JSON.parse(msg.content.toString())
      await repository.createNews(news)
      console.log(`[news.created] Stored: "${news.name}" (${news.city})`)
      channel.ack(msg)
    } catch (err) {
      console.error('[news.created] Error processing message:', err)
      channel.nack(msg, false, false)
    }
  })

  // Subscribe to offer.created
  await channel.assertExchange('offer.created', 'fanout', { durable: true })
  const offerQueue = await channel.assertQueue('mi8.offer.created', { durable: true })
  await channel.bindQueue(offerQueue.queue, 'offer.created', '')

  channel.consume(offerQueue.queue, async (msg) => {
    if (!msg) return
    try {
      const offer = JSON.parse(msg.content.toString())
      await repository.updateCityStats(offer.city, offer.domain, offer.createdAt || new Date().toISOString())
      console.log(`[offer.created] Updated city stats for "${offer.city}"`)
      channel.ack(msg)
    } catch (err) {
      console.error('[offer.created] Error processing message:', err)
      channel.nack(msg, false, false)
    }
  })

  console.log('MI8 AMQP consumers started')
}

startConsumer().catch(err => {
  console.error('Failed to start AMQP consumer:', err)
  process.exit(1)
})
