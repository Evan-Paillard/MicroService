import amqp from 'amqplib'
import { Subscriber } from './models/subscriber'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'

export async function startConsumer() {
  const connection = await amqp.connect(RABBITMQ_URL)
  const channel = await connection.createChannel()

  await channel.assertExchange('student.registered', 'fanout', { durable: true })
  const regQueue = await channel.assertQueue('laposte.student.registered', { durable: true })
  await channel.bindQueue(regQueue.queue, 'student.registered', '')

  channel.consume(regQueue.queue, async (msg) => {
    if (!msg) return
    try {
      const data = JSON.parse(msg.content.toString())
      const { studentId, domain } = data

      await Subscriber.findOneAndUpdate(
        { studentId },
        { studentId, domain },
        { upsert: true, new: true }
      )

      console.log(`[student.registered] Created/updated subscriber for student ${studentId}`)
      channel.ack(msg)
    } catch (err) {
      console.error('[student.registered] Error:', err)
      channel.nack(msg, false, false)
    }
  })

  await channel.assertExchange('offer.created', 'fanout', { durable: true })
  const offerQueue = await channel.assertQueue('laposte.offer.created', { durable: true })
  await channel.bindQueue(offerQueue.queue, 'offer.created', '')

  channel.consume(offerQueue.queue, async (msg) => {
    if (!msg) return
    try {
      const offer = JSON.parse(msg.content.toString())
      const { title, domain, city } = offer

      const subscribers = await Subscriber.find({ domain, enabled: true })

      for (const sub of subscribers) {
        console.log(`[MOCK ALERT] Sent to student ${sub.studentId} via ${sub.channel} (${sub.contact || 'no contact info'}): New offer in ${city} - ${title}`)
      }

      console.log(`[offer.created] Sent mock alerts to ${subscribers.length} subscriber(s) for domain "${domain}"`)
      channel.ack(msg)
    } catch (err) {
      console.error('[offer.created] Error:', err)
      channel.nack(msg, false, false)
    }
  })

  console.log('La Poste AMQP consumer started')
}
