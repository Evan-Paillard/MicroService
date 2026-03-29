import amqp from 'amqplib'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'

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
