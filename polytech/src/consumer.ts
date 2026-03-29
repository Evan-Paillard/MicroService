import amqp from 'amqplib'
import { WebSocket } from 'ws'
import pool from './db'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'

export const wsClients = new Set<WebSocket>()

let channel: amqp.Channel | null = null

export async function getChannel(): Promise<amqp.Channel> {
  if (channel) return channel
  const connection = await amqp.connect(RABBITMQ_URL)
  channel = await connection.createChannel()
  return channel
}

export async function publishEvent(exchange: string, data: object): Promise<void> {
  const ch = await getChannel()
  await ch.assertExchange(exchange, 'fanout', { durable: true })
  ch.publish(exchange, '', Buffer.from(JSON.stringify(data)), { persistent: true })
}

export async function startConsumer(): Promise<void> {
  const connection = await amqp.connect(RABBITMQ_URL)
  const ch = await connection.createChannel()

  await ch.assertExchange('offer.created', 'fanout', { durable: true })
  const q = await ch.assertQueue('polytech.offer.created', { durable: true })
  await ch.bindQueue(q.queue, 'offer.created', '')

  ch.consume(q.queue, async (msg) => {
    if (!msg) return
    try {
      const offer = JSON.parse(msg.content.toString())
      const { offerId, title, city, domain, createdAt } = offer

      // Find all students with matching domain
      const students = await pool.query(
        'SELECT id FROM students WHERE domain = $1',
        [domain]
      )

      for (const student of students.rows) {
        await pool.query(
          `INSERT INTO notifications (student_id, type, offer_id, message)
           VALUES ($1, 'new_offer', $2, $3)`,
          [
            student.id,
            offerId,
            `New internship offer in ${city}: ${title}`,
          ]
        )
      }

      console.log(`[offer.created] Created ${students.rowCount} notification(s) for domain "${domain}"`)
      ch.ack(msg)
    } catch (err) {
      console.error('[offer.created] Error:', err)
      ch.nack(msg, false, false)
    }
  })

  // Subscribe to news.created → push via WebSocket
  await ch.assertExchange('news.created', 'fanout', { durable: true })
  const newsWsQueue = await ch.assertQueue('polytech.ws.news.created', { durable: false, autoDelete: true })
  await ch.bindQueue(newsWsQueue.queue, 'news.created', '')

  ch.consume(newsWsQueue.queue, (msg) => {
    if (!msg) return
    try {
      const news = JSON.parse(msg.content.toString())
      const payload = JSON.stringify({ type: 'news.created', news })
      for (const client of wsClients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload)
        }
      }
      ch.ack(msg)
    } catch (err) {
      console.error('[news.created ws] Error:', err)
      ch.nack(msg, false, false)
    }
  })

  console.log('Polytech AMQP consumer started')
}
