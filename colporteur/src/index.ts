import amqp from 'amqplib'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'
const EXCHANGE = 'news.created'

const sampleNews = [
  {
    name: 'Berlin Innovation Hub Opens New Campus',
    source: 'Tech Weekly',
    date: new Date().toISOString(),
    tags: ['innovation'],
    city: 'Berlin',
    country: 'Germany',
  },
  {
    name: 'Paris Cultural Festival Draws Record Crowds',
    source: 'Le Monde',
    date: new Date().toISOString(),
    tags: ['culture', 'entertainment'],
    city: 'Paris',
    country: 'France',
  },
  {
    name: 'Tokyo Healthcare Breakthrough in Cancer Research',
    source: 'Japan Times',
    date: new Date().toISOString(),
    tags: ['healthcare', 'innovation'],
    city: 'Tokyo',
    country: 'Japan',
  },
  {
    name: 'Crime Rate Drops in Berlin City Center',
    source: 'Berlin Daily',
    date: new Date().toISOString(),
    tags: ['crime'],
    city: 'Berlin',
    country: 'Germany',
  },
  {
    name: 'Paris Hosts International Music Festival',
    source: 'France Info',
    date: new Date().toISOString(),
    tags: ['culture', 'entertainment'],
    city: 'Paris',
    country: 'France',
  },
]

async function main() {
  console.log(`Connecting to RabbitMQ at ${RABBITMQ_URL}...`)
  const connection = await amqp.connect(RABBITMQ_URL)
  const channel = await connection.createChannel()

  await channel.assertExchange(EXCHANGE, 'fanout', { durable: true })

  for (const news of sampleNews) {
    const message = Buffer.from(JSON.stringify(news))
    channel.publish(EXCHANGE, '', message, { persistent: true })
    console.log(`Published: "${news.name}" (${news.city})`)
  }

  console.log('All news published.')
  await channel.close()
  await connection.close()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
